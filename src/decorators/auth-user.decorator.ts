import {
  bearerTokenFromGraphql,
  bearerTokenFromHttp,
  isBearerToken,
  tokenFromBearer,
} from '../helpers/extractBearerToken';
import { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from '../tokens/interfaces/token.payload';

const jwtService = new JwtService();

export function AuthUserId() {
  return createParamDecorator(
    async (_data: unknown, context: ExecutionContext) => {
      const requestContextType = context.getType().toLowerCase();
      const bearerToken =
        requestContextType === 'graphql'
          ? bearerTokenFromGraphql(context)
          : bearerTokenFromHttp(context);

      const token = tokenFromBearer(bearerToken);
      const decodedToken = jwtService.decode(token) as TokenPayload;

      return decodedToken.userId;
    },
  )();
}

export function AuthUserEmail() {
  return createParamDecorator(
    async (_data: unknown, context: ExecutionContext) => {
      const bearerToken = bearerTokenFromHttp(context);

      if (isBearerToken(bearerToken)) {
        const token = tokenFromBearer(bearerToken);
        const decodedToken = jwtService.decode(token) as TokenPayload;
        return decodedToken.email;
      }
    },
  )();
}
