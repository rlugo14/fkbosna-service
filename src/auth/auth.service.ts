import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { TokenPayload } from './interfaces/token.payload';

const MINS_15_IN_SECONDS = 15 * 60;

@Injectable()
export class AuthService {
  private secret: string;
  constructor(private readonly configService: ConfigService) {
    this.secret = this.configService.get<string>('JWT_SECRET');
  }
  createToken({ userId, email, tenantId }: TokenPayload) {
    return jwt.sign({ userId, email, tenantId }, this.secret, {
      expiresIn: MINS_15_IN_SECONDS,
    });
  }
}
