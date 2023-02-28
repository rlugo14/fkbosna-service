import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { User } from '../users/models/users.model';
import { TokenPayload } from './interfaces/token.payload';
import { Tenant } from 'src/tenants/models/tenant.model';

const MINS_5_IN_SECONDS = 5 * 60;

@Injectable()
export class AuthService {
  private secret: string;
  constructor(private readonly configService: ConfigService) {
    this.secret = this.configService.get<string>('JWT_SECRET');
  }
  createToken({ userId, email, tenantId }: TokenPayload) {
    return jwt.sign({ userId, email, tenantId }, this.secret, {
      expiresIn: MINS_5_IN_SECONDS,
    });
  }
}
