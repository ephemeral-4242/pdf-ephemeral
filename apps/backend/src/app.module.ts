import { Module } from '@nestjs/common';
import { AppController } from './modules/controllers/app.controller';
import { AppService } from './modules/services/app.service';
import { HelloController } from './modules/controllers/hello.controller';

@Module({
  imports: [],
  controllers: [AppController, HelloController],
  providers: [AppService],
})
export class AppModule {}
