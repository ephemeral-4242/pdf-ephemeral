import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import * as pdf from 'pdf-parse';
import OpenAI from 'openai';
import { Response } from 'express';
import {
  IPDFRepository,
  PDF_REPOSITORY,
} from '../repositories/pdf-repository.interface';
import { PDFDocument } from '../repositories/pdf-document.interface';

import { splitTextIntoChunks } from 'src/utils/text-utils';
import { v4 as uuidv4 } from 'uuid';

import { EmbeddingService } from './embedding.service';
import { QdrantService } from './qdrant-service';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  private pdfText: string;

  constructor(
    @Inject(PDF_REPOSITORY) private pdfRepository: IPDFRepository,
    private qdrantService: QdrantService,
    private embeddingService: EmbeddingService,
  ) {}

  private conversation: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }> = [];

  async processAndSavePdf(file: Express.Multer.File): Promise<PDFDocument> {
    try {
      const pdfDocument = await this.pdfRepository.save(file);
      this.pdfText = pdfDocument.content;
      this.resetConversation();

      await this.qdrantService.createCollection('pdf_collection');

      const chunks = splitTextIntoChunks(this.pdfText, 2000);

      console.log('chunks', chunks.length);

      const points = await Promise.all(
        chunks.map(async (chunk, index) => {
          try {
            const vector = await this.embeddingService.generateEmbedding(chunk);
            return {
              id: uuidv4(),
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

      await this.qdrantService.upsertPoints('pdf_collection', points);

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
          'You are an AI assistant that answers questions based on the provided content.',
      },
      {
        role: 'user',
        content: `Here is the content:\n\n${this.pdfText}`,
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
          content: `You are an AI assistant answering questions about the following content: ${pdfDocument.content}`,
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
      const queryVector =
        await this.embeddingService.generateEmbedding(question);
      const retrievedContent =
        await this.qdrantService.queryQdrant(queryVector);

      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4',
        stream: true,
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that answers questions based on the provided content. Use the provided content to answer the user's question as accurately as possible.`,
          },
          {
            role: 'system',
            content: `Content retrieved from the library:\n\n${retrievedContent.join('\n\n')}`,
          },
          {
            role: 'user',
            content: `Question: ${question}`,
          },
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
