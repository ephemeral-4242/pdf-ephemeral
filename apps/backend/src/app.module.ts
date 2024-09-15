import { Module } from '@nestjs/common';
import { AppController } from './modules/controllers/app.controller';
import { AppService } from './modules/services/app.service';
import { HelloController } from './modules/controllers/hello.controller';
import { PdfController } from './modules/controllers/pdf.controller';
import { PdfService } from './modules/services/pdf.service';

@Module({
  imports: [],
  controllers: [AppController, HelloController, PdfController],
  providers: [AppService, PdfService],
})
export class AppModule {}
