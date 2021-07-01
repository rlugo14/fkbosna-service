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

@Module({
  imports: [
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: 'schema.gql',
      context: ({ req }: { req: IncomingMessage }) => ({
        authorization: req.headers.authorization,
      }),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PlayersModule,
    ColorsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
