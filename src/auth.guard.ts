import { AppConfigService } from 'src/shared/services/app-config.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  bearerTokenFromContext,
  isBearerToken,
} from './helpers/extractBearerToken';
import { JwtService } from '@nestjs/jwt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  private secret: string;
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.secret = this.appConfigService.jwtConfig.jwtSecret;
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const bearerToken = bearerTokenFromContext(context);
    await this.validateBearerToken(bearerToken);
    return true;
  }

  async validateBearerToken(bearerToken: string) {
    if (!isBearerToken(bearerToken)) {
      throw new UnauthorizedException('Invalid Token');
    }

    const token = bearerToken.split(' ')[1];

    try {
      return this.jwtService.verify(token, { secret: this.secret });
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
}
