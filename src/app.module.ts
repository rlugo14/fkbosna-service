import { AppConfigService } from './shared/services/app-config.service';
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import 'reflect-metadata';
import { GraphQLModule } from '@nestjs/graphql';
import { PlayersModule } from './players/players.module';
import { ColorsModule } from './colors/colors.module';
import { IncomingMessage } from 'http';
import { UserModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { SharedModule } from './shared/shared.module';
import { AwsSdkModule } from 'nest-aws-sdk';
import { S3 } from 'aws-sdk';
import { PlayerImageModule } from './player-image/player-image.module';
import { TenantsModule } from './tenants/tenants.module';
import { TenantImageModule } from './tenant-image/tenant-image.module';
import * as Joi from 'joi';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SlackModule } from 'nestjs-slack';
import { FinesModule } from './fines/fines.module';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      useFactory: (configService: AppConfigService) => ({
        playground: configService.appConfig.isDev,
        installSubscriptionHandlers: true,
        autoSchemaFile: 'schema.gql',
        context: ({ req }: { req: IncomingMessage }) => ({
          ...req,
          authorization: req.headers.authorization,
        }),
        cors: true,
      }),
      driver: ApolloDriver,
      inject: [AppConfigService],
    }),
    AwsSdkModule.forRootAsync({
      defaultServiceOptions: {
        useFactory: (configService: AppConfigService) => ({
          region: configService.awsConfig.region,
          credentials: {
            accessKeyId: configService.awsConfig.keyId,
            secretAccessKey: configService.awsConfig.secretKey,
          },
        }),
        inject: [AppConfigService],
      },
      services: [S3],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().default('production'),
        PORT: Joi.number().default(4000),
        JWT_SECRET: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_REGION: Joi.string().default('eu-west-1'),
        BUCKET_NAME: Joi.string().default('rlugo14-bucket'),

        EMAIL_SERVICE: Joi.string().optional(),
        EMAIL_SECURE: Joi.boolean().default(true),
        EMAIL_HOST: Joi.string().default('smtp.mailtrap.io'),
        EMAIl_PORT: Joi.number().default(2525),
        EMAIL_USER: Joi.string().required(),
        EMAIL_PASSWORD: Joi.string().required(),
        EMAIL_FROM: Joi.string().required(),
        EMAIL_FROM_NAME: Joi.string().default('Matdienst'),

        SLACK_TOKEN: Joi.string().required(),
        SLACK_CHANNEL_ID: Joi.string().default('C056YMQH8UR'),

        WEB_APP_PROTOCOL: Joi.string().default('http://'),
        WEB_APP_HOST: Joi.string().default('localhost:3000'),
      }),
    }),
    SlackModule.forRootAsync({
      useFactory: (configService: AppConfigService) => ({
        type: 'api',
        token: configService.slackConfig.token,
      }),
      isGlobal: true,
      inject: [AppConfigService],
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    PlayersModule,
    ColorsModule,
    UserModule,
    AuthModule,
    SharedModule,
    PlayerImageModule,
    TenantsModule,
    TenantImageModule,
    FinesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
