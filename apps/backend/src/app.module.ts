import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './modules/controllers/app.controller';
import { AppService } from './modules/services/app.service';
import { HelloController } from './modules/controllers/hello.controller';
import { PdfController } from './modules/controllers/pdf.controller';
import { PdfService } from './modules/services/pdf.service';
import { PrismaPDFRepository } from './modules/repositories/prisma-pdf-repository';
import { PrismaService } from './modules/prisma/prisma.service';
import { EmbeddingService } from './modules/services/embedding.service';
import { QdrantService } from './modules/services/qdrant-service';
import { OpenAIService } from './modules/services/openai.service';
import { PDF_REPOSITORY } from './modules/interface/pdf-repository.interface';
import { DiskRepository } from './modules/repositories/disk-repository';
import { FILE_SERVICE } from './modules/interface/file-service.interface';
import { EMBEDDING_SERVICE } from './modules/interface/embedding-service.interface';
import { AI_SERVICE } from './modules/interface/ai-service.interface';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AppController, HelloController, PdfController],
  providers: [
    AppService,
    PdfService,
    PrismaService,
    QdrantService,
    {
      provide: AI_SERVICE,
      useClass: OpenAIService,
    },

    {
      provide: FILE_SERVICE,
      useClass: DiskRepository,
    },
    {
      provide: PDF_REPOSITORY,
      useClass: PrismaPDFRepository,
    },
    {
      provide: EMBEDDING_SERVICE,
      useClass: EmbeddingService,
    },
  ],
})
export class AppModule {}
