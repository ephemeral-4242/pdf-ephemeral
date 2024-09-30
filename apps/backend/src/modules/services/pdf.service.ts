import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import * as pdf from 'pdf-parse';
import OpenAI from 'openai';
import { Response } from 'express';
import {
  IPDFRepository,
  PDF_REPOSITORY,
} from '../repositories/pdf-repository.interface';
import { PDFDocument } from '../repositories/pdf-document.interface';

import { generateEmbedding } from '../../utils/embedding';
import { upsertPoints } from '../services/qdrant-service';
import { splitTextIntoChunks } from 'src/utils/text-utils';
import { v4 as uuidv4 } from 'uuid';
import { createCollection } from '../services/qdrant-service';
import { queryQdrant } from '../services/qdrant-service';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  private pdfText: string;

  constructor(@Inject(PDF_REPOSITORY) private pdfRepository: IPDFRepository) {}

  private conversation: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }> = [];

  async processAndSavePdf(file: Express.Multer.File): Promise<PDFDocument> {
    try {
      const pdfDocument = await this.pdfRepository.save(file);
      this.pdfText = pdfDocument.content;
      this.resetConversation();

      // Ensure the collection exists
      await createCollection('pdf_collection');

      // Split the text into larger chunks
      const chunks = splitTextIntoChunks(this.pdfText, 2000); // Adjust chunk size as needed

      console.log('chunks', chunks.length);

      // Generate embeddings for each chunk and store them in Qdrant
      const points = await Promise.all(
        chunks.map(async (chunk, index) => {
          try {
            const vector = await generateEmbedding(chunk);
            return {
              id: uuidv4(), // Generate a valid UUID for the point ID
              vector,
              payload: {
                pdfId: pdfDocument.id,
                chunkIndex: index,
                text: chunk,
              },
            };
          } catch (error) {
            this.logger.error(
              `Error generating embedding for chunk ${index}: ${error.message}`,
            );
            throw error;
          }
        }),
      );

      await upsertPoints('pdf_collection', points); // Ensure 'pdf_collection' exists in Qdrant

      return pdfDocument;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        this.logger.error(
          'OpenAI API quota exceeded. Please check your plan and billing details.',
        );
      } else {
        this.logger.error(`Error processing and saving PDF: ${error.message}`);
      }
      throw error;
    }
  }

  async getAllPdfs(): Promise<PDFDocument[]> {
    return this.pdfRepository.getAll();
  }

  resetConversation() {
    this.conversation = [
      {
        role: 'system',
        content:
          'You are an AI assistant that answers questions based on the provided PDF content.',
      },
      {
        role: 'user',
        content: `Here is the content of the PDF document:\n\n${this.pdfText}`,
      },
    ];
  }

  async chatWithPdfStream(
    question: string,
    pdfId: string,
    res: Response,
  ): Promise<void> {
    try {
      // Retrieve the PDF content using the pdfId
      const pdfDocument = await this.pdfRepository.getById(pdfId);
      if (!pdfDocument) {
        throw new NotFoundException(`PDF with id ${pdfId} not found`);
      }

      // Add user's question to the conversation
      this.conversation = [
        {
          role: 'system',
          content: `You are an AI assistant answering questions about the following PDF content: ${pdfDocument.content}`,
        },
        { role: 'user', content: question },
      ];

      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4',
        stream: true,
        messages: this.conversation,
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      let assistantReply = '';

      for await (const part of stream) {
        const content = part.choices[0].delta?.content || '';
        assistantReply += content;
        res.write(content);
      }

      res.end();

      // Add assistant's reply to the conversation
      this.conversation.push({ role: 'assistant', content: assistantReply });
    } catch (error) {
      this.logger.error(`Error during streaming: ${error.message}`);
      res.status(500).end('Internal Server Error');
    }
  }

  async chatWithLibrary(question: string, res: Response): Promise<void> {
    try {
      // Step 1: Vectorize the query
      const queryVector = await generateEmbedding(question);

      // Step 2: Query Qdrant with the vector
      const retrievedContent = await queryQdrant(queryVector);

      // Step 3: Stream response from LLM using the retrieved content
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4',
        stream: true,
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that answers questions based on the provided PDF content.`,
          },
          {
            role: 'user',
            content: `Here is the content retrieved from the library:\n\n${retrievedContent.join(
              '\n',
            )}`,
          },
          { role: 'user', content: question },
        ],
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      let assistantReply = '';

      for await (const part of stream) {
        const content = part.choices[0].delta?.content || '';
        assistantReply += content;
        res.write(content);
      }

      res.end();
    } catch (error) {
      console.error('Error in chatWithLibrary:', error);
      res.status(500).end('Internal Server Error');
    }
  }
}
