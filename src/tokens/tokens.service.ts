import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from 'src/shared/services/app-config.service';
import { TokenPayload } from './interfaces/token.payload';
import { PrismaService } from 'src/prisma/prisma.service';
import { DecodedTokenPayload } from './interfaces/decodedToken.payload';
import { isBearerToken, tokenFromBearer } from 'src/helpers/extractBearerToken';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

const MINS_15_IN_SECONDS = 15 * 60;
const MINS_300_IN_SECONDS = 300 * 60;
const DAY_1_IN_SECONDS = 1 * 24 * 60 * 60;
const DAY_3_IN_SECONDS = 1 * 24 * 60 * 60;

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
      expiresIn: this.appConfigService.appConfig.isProd
        ? MINS_15_IN_SECONDS
        : MINS_300_IN_SECONDS,
    });
  }

  async createChangePasswordToken(payload: TokenPayload) {
    return this.createExpirableToken(payload, DAY_1_IN_SECONDS);
  }

  async createVerifyEmailToken(payload: TokenPayload) {
    return this.createExpirableToken(payload, DAY_3_IN_SECONDS);
  }

  private async createExpirableToken(payload: TokenPayload, expiresIn: number) {
    const token = await this.jwtService.signAsync(payload, {
      secret: this.secret,
      expiresIn,
    });

    const createdToken = await this.createToken(token, payload.userId);

    return createdToken.token;
  }

  private async createToken(token: string, userId: number) {
    return this.prismaService.token.create({
      data: { token: token, userId: userId },
    });
  }

  async deleteAll(userId: number): Promise<number> {
    const res = await this.prismaService.token.deleteMany({
      where: { userId, deletedAt: null },
    });

    return res.count;
  }

  decodeToken(token: string) {
    return this.jwtService.decode(token) as DecodedTokenPayload;
  }

  validateBearerToken(bearerToken: string): void {
    if (!isBearerToken(bearerToken)) {
      throw new UnauthorizedException('Invalid Token');
    }

    const token = tokenFromBearer(bearerToken);

    try {
      this.jwtService.verify(token, { secret: this.secret });
    } catch (error) {
      switch (error.constructor) {
        case TokenExpiredError:
          throw new UnauthorizedException(error.message);
        case JsonWebTokenError:
          throw new UnauthorizedException(error.message);
        default:
          throw new UnauthorizedException('Invalid Token');
      }
    }
  }

  async checkTokenValidity(token: string) {
    const decodedToken = this.decodeToken(token);

    if (decodedToken.type === 'refresh') {
      const foundToken = await this.prismaService.token.findFirst({
        where: { token, deletedAt: null },
      });

      if (!foundToken) {
        throw new UnauthorizedException('Token is invalid');
      }
    }
  }
}
