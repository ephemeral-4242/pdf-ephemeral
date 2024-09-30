import { Module } from '@nestjs/common';
import { AppController } from './modules/controllers/app.controller';
import { AppService } from './modules/services/app.service';
import { HelloController } from './modules/controllers/hello.controller';
import { PdfController } from './modules/controllers/pdf.controller';
import { PdfService } from './modules/services/pdf.service';
import { InMemoryPDFRepository } from './modules/repositories/in-memory-pdf-repository';
import { IPDFRepository } from './modules/repositories/pdf-repository.interface';
import { PDF_REPOSITORY } from './modules/repositories/pdf-repository.interface';

@Module({
  imports: [],
  controllers: [AppController, HelloController, PdfController],
  providers: [
    AppService,
    PdfService,
    {
      provide: PDF_REPOSITORY,
      useClass: InMemoryPDFRepository,
    },
  ],
})
export class AppModule {}
