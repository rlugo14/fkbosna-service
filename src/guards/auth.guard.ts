import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { bearerTokenFromContext } from '../helpers/extractBearerToken';
import { TokenService } from 'src/tokens/tokens.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}
  canActivate(context: ExecutionContext): boolean {
    const bearerToken = bearerTokenFromContext(context);
    this.tokenService.validateBearerToken(bearerToken);

    return true;
  }
}
