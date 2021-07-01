import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { User } from '../users/models/users.model';

@Injectable()
export class AuthService {
  private secret: string;
  constructor(private readonly configService: ConfigService) {
    this.secret = this.configService.get<string>('JWT_SECRET');
  }
  createToken({ id, email }: User) {
    return jwt.sign({ id, email }, this.secret);
  }
}
