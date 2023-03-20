import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from 'src/shared/services/app-config.service';
import { TokenPayload } from './interfaces/token.payload';
import { PrismaService } from 'src/prisma/prisma.service';

const MINS_15_IN_SECONDS = 15 * 60;
const DAY_1_IN_SECONDS = 1 * 24 * 60 * 60;

@Injectable()
export class TokenService {
  private secret: string;
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {
    this.secret = this.appConfigService.jwtConfig.jwtSecret;
  }

  createLoginToken(payload: TokenPayload) {
    return this.jwtService.signAsync(payload, {
      secret: this.secret,
      expiresIn: MINS_15_IN_SECONDS,
    });
  }

  async createChangePasswordToken(payload: TokenPayload) {
    const token = await this.jwtService.signAsync(payload, {
      secret: this.secret,
      expiresIn: DAY_1_IN_SECONDS,
    });

    const createdToken = await this.prismaService.token.create({
      data: { token: token, userId: payload.userId },
    });

    return createdToken.token;
  }

  async deleteAll(userId: number): Promise<number> {
    const res = await this.prismaService.token.deleteMany({
      where: { userId, deletedAt: null },
    });

    return res.count;
  }

  async checkTokenValidity(token: string) {
    const foundToken = await this.prismaService.token.findFirst({
      where: { token, deletedAt: null },
    });

    if (!foundToken) {
      throw new UnauthorizedException('Token is invalid');
    }
  }
}
