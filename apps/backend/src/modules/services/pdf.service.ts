import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import * as pdf from 'pdf-parse';
import OpenAI from 'openai';
import { Response } from 'express';

import { splitTextIntoChunks } from 'src/utils/text-utils';
import { v4 as uuidv4 } from 'uuid';

import {
  IEmbeddingService,
  EMBEDDING_SERVICE,
} from '../interface/embedding-service.interface';
import { QdrantService } from './qdrant-service';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { OpenAIService } from './openai.service';
import {
  IPDFRepository,
  PDF_REPOSITORY,
} from '../interface/pdf-repository.interface';
import { PDFDocument } from 'src/types/pdf-document.type';
import { AI_SERVICE, AIService } from '../interface/ai-service.interface';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  private pdfText: string;

  constructor(
    @Inject(PDF_REPOSITORY) private pdfRepository: IPDFRepository,
    private qdrantService: QdrantService,
    @Inject(EMBEDDING_SERVICE) private embeddingService: IEmbeddingService,
    @Inject(AI_SERVICE) private openAIService: AIService,
  ) {}

  private conversation: ChatCompletionMessageParam[] = [];

  async processAndSavePdf(
    file: Express.Multer.File,
    folderId?: string, // Changed from folderName to folderId
  ): Promise<PDFDocument> {
    try {
      const pdfDocument = await this.pdfRepository.save(file, folderId);
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
                folderId: folderId,
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

      await this.qdrantService.saveFolderPoints(
        'pdf_collection',
        points,
        folderId,
      );

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

  async getAllFolders(): Promise<any[]> {
    try {
      return await this.pdfRepository.getAllFolders();
    } catch (error) {
      this.logger.error(`Error retrieving folders: ${error.message}`);
      throw error;
    }
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

      const assistantReply =
        await this.openAIService.createChatCompletionStream(
          this.conversation,
          res,
        );

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

      const searchResults = await this.qdrantService.searchPoints(
        'pdf_collection',
        queryVector,
      );
      const retrievedContent = searchResults.map(
        (result: any) => result.payload.text,
      );

      const messages: ChatCompletionMessageParam[] = [
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
      ];

      await this.openAIService.createChatCompletionStream(messages, res);
    } catch (error) {
      this.logger.error(`Error in chatWithLibrary: ${error.message}`);
      res.status(500).end('Internal Server Error');
    }
  }

  async chatWithFolder(
    question: string,
    folderId: string,
    res: Response,
  ): Promise<void> {
    try {
      const queryVector =
        await this.embeddingService.generateEmbedding(question);

      const searchResults = await this.qdrantService.searchPointsByFolderId(
        'pdf_collection',
        queryVector,
        folderId,
      );
      const retrievedContent = searchResults.map(
        (result: any) => result.payload.text,
      );

      const messages: ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `You are an AI assistant that answers questions based on the provided content. Use the provided content to answer the user's question as accurately as possible.`,
        },
        {
          role: 'system',
          content: `Content retrieved from the folder:\n\n${retrievedContent.join('\n\n')}`,
        },
        {
          role: 'user',
          content: `Question: ${question}`,
        },
      ];

      await this.openAIService.createChatCompletionStream(messages, res);
    } catch (error) {
      this.logger.error(`Error in chatWithFolder: ${error.message}`);
      res.status(500).end('Internal Server Error');
    }
  }

  async createFolder(name: string): Promise<{ id: string; name: string }> {
    try {
      return await this.pdfRepository.getOrCreateFolder(name);
    } catch (error) {
      this.logger.error(`Error creating folder: ${error.message}`);
      throw error;
    }
  }

  async getPdfById(pdfId: string): Promise<PDFDocument> {
    try {
      const pdfDocument = await this.pdfRepository.getById(pdfId);
      if (!pdfDocument) {
        throw new NotFoundException(`PDF with id ${pdfId} not found`);
      }
      return pdfDocument;
    } catch (error) {
      this.logger.error(
        `Error retrieving PDF by id ${pdfId}: ${error.message}`,
      );
      throw error;
    }
  }
}
