import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './interfaces/token.payload';

const MINS_15_IN_SECONDS = 15 * 60;

@Injectable()
export class AuthService {
  private secret: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.secret = this.configService.get<string>('JWT_SECRET');
  }
  createToken({ userId, email, tenantId }: TokenPayload) {
    return this.jwtService.signAsync(
      { userId, email, tenantId },
      {
        secret: this.secret,
        expiresIn: MINS_15_IN_SECONDS,
      },
    );
  }
}
