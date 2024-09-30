import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './modules/controllers/app.controller';
import { AppService } from './modules/services/app.service';
import { HelloController } from './modules/controllers/hello.controller';
import { PdfController } from './modules/controllers/pdf.controller';
import { PdfService } from './modules/services/pdf.service';
import { PrismaPDFRepository } from './modules/repositories/prisma-pdf-repository';
import { IPDFRepository } from './modules/repositories/pdf-repository.interface';
import { PDF_REPOSITORY } from './modules/repositories/pdf-repository.interface';
import { PrismaService } from './modules/prisma/prisma.service';

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
    {
      provide: PDF_REPOSITORY,
      useClass: PrismaPDFRepository,
    },
  ],
})
export class AppModule {}
