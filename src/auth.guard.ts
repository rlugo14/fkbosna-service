import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  private secret: string;
  constructor(private readonly configService: ConfigService) {
    this.secret = this.configService.get<string>('JWT_SECRET');
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext: { authorization: string } =
      GqlExecutionContext.create(context).getContext();

    const bearerToken = gqlContext.authorization;

    await this.validateBearerToken(bearerToken);
    return true;
  }

  async validateBearerToken(bearerToken: string) {
    if (
      !bearerToken ||
      (bearerToken && bearerToken.split(' ')[0] !== 'Bearer')
    ) {
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
