import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import {
  bearerTokenFromGraphql,
  bearerTokenFromHttp,
  isBearerToken,
} from './helpers/extractBearerToken';

@Injectable()
export class AuthGuard implements CanActivate {
  private secret: string;
  constructor(private readonly configService: ConfigService) {
    this.secret = this.configService.get<string>('JWT_SECRET');
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    let bearerToken: string;

    switch (context.getType().toLowerCase()) {
      case 'http':
        bearerToken = bearerTokenFromHttp(context);
        break;
      case 'graphql':
        bearerToken = bearerTokenFromGraphql(context);
        break;
    }

    await this.validateBearerToken(bearerToken);
    return true;
  }

  async validateBearerToken(bearerToken: string) {
    if (!isBearerToken(bearerToken)) {
      throw new UnauthorizedException('Invalid Token');
    }

    const token = bearerToken.split(' ')[1];

    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw new UnauthorizedException('Invalid Token');
    }
  }
}
