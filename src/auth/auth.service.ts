import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { User } from '../users/models/users.model';
import { TokenPayload } from './interfaces/token.payload';

const MINS_5_IN_SECONDS = 5 * 60;

@Injectable()
export class AuthService {
  private secret: string;
  constructor(private readonly configService: ConfigService) {
    this.secret = this.configService.get<string>('JWT_SECRET');
  }
  createToken({ id, email }: User) {
    const tokenPayload: TokenPayload = { id, email };
    return jwt.sign(tokenPayload, this.secret, {
      expiresIn: MINS_5_IN_SECONDS,
    });
  }
}
