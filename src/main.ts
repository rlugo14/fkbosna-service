import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  const port = process.env.PORT ? process.env.PORT : 3010;

  Logger.log(`Running on port ${port}`, 'NestApplication');
  await app.listen(port);
}
bootstrap();
