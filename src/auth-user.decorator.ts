import {
  bearerTokenFromGraphql,
  isBearerToken,
} from './helpers/extractBearerToken';
import { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './auth/interfaces/token.payload';

const jwtService = new JwtService();

export function AuthUserId() {
  return createParamDecorator(
    async (_data: unknown, context: ExecutionContext) => {
      const bearerToken = bearerTokenFromGraphql(context);

      if (isBearerToken(bearerToken)) {
        const token = bearerToken.split(' ')[1];
        const decodedToken = jwtService.decode(token) as TokenPayload;
        return decodedToken.id;
      }
    },
  )();
}
