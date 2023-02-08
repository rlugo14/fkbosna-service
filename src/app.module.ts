import { AppConfigService } from './shared/services/app-config.service';
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import 'reflect-metadata';
import { GraphQLModule } from '@nestjs/graphql';
import { PlayersModule } from './players/players.module';
import { ColorsModule } from './colors/colors.module';
import { IncomingMessage } from 'http';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ApolloDriver } from '@nestjs/apollo';
import { SharedModule } from './shared/shared.module';
import { AwsSdkModule } from 'nest-aws-sdk';
import { S3 } from 'aws-sdk';
import { PlayerImageModule } from './player-image/player-image.module';

@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      installSubscriptionHandlers: true,
      autoSchemaFile: 'schema.gql',
      context: ({ req }: { req: IncomingMessage }) => ({
        authorization: req.headers.authorization,
      }),
      cors: {
        credentials: true,
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders:
          'Content-Type,Accept,Authorization,Access-Control-Allow-Origin',
      },
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
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PlayersModule,
    ColorsModule,
    UsersModule,
    AuthModule,
    SharedModule,
    PlayerImageModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
