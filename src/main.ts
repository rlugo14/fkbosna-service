import { otelSDK } from './tracing';
import { ValidationPipe, Logger as NestLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { join } from 'path';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  otelSDK.start();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  app.flushLogs();

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT ? process.env.PORT : 3010;
  app.use('/public', express.static(join(__dirname, '..', 'public')));

  NestLogger.log(`Running on port ${port}`, 'NestApplication');
  await app.listen(port);
}
bootstrap();
