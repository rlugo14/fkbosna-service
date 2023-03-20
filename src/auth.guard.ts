import { AppConfigService } from 'src/shared/services/app-config.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  bearerTokenFromGraphql,
  bearerTokenFromHttp,
  isBearerToken,
} from './helpers/extractBearerToken';
import { JwtService } from '@nestjs/jwt';

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
      return this.jwtService.verify(token, { secret: this.secret });
    } catch (error) {
      throw new UnauthorizedException('Invalid Token');
    }
  }
}
