import { otelSDK } from './tracing';
import { ValidationPipe, Logger as NestLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import * as CloudWatchTransport from 'winston-cloudwatch';
import * as express from 'express';
import { join } from 'path';
import { AppConfigService } from './shared/services/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(AppConfigService);
  configService.appConfig.isProd ? otelSDK.start() : undefined;

  app.useLogger(
    WinstonModule.createLogger({
      format: winston.format.uncolorize(),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike(),
          ),
        }),
        new CloudWatchTransport({
          name: 'Cloudwatch Logs',
          logGroupName: configService.awsConfig.cloudWatchGroupName,
          logStreamName: configService.awsConfig.cloudWatchStreamName,
          awsAccessKeyId: configService.awsConfig.keyId,
          awsSecretKey: configService.awsConfig.secretKey,
          awsRegion: configService.awsConfig.cloudWatchRegion,
          messageFormatter: (item) => JSON.stringify(item),
          silent: configService.appConfig.isDev,
        }),
      ],
    }),
  );

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
