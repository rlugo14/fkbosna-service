import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  bearerTokenFromContext,
  tokenFromBearer,
} from 'src/helpers/extractBearerToken';
import { TokenService } from 'src/tokens/tokens.service';

@Injectable()
export class EmailConfirmedGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}
  canActivate(context: ExecutionContext): boolean {
    const bearerToken = bearerTokenFromContext(context);
    this.tokenService.validateBearerToken(bearerToken);
    const token = tokenFromBearer(bearerToken);

    const { isEmailConfirmed } = this.tokenService.decodeToken(token);

    if (isEmailConfirmed) return true;
    else
      throw new UnauthorizedException(
        'This operation is allowed to verified users only',
      );
  }
}
