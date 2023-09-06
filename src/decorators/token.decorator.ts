import {
  bearerTokenFromContext,
  isBearerToken,
  tokenFromBearer,
} from '../helpers/extractBearerToken';
import { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

export function Token() {
  return createParamDecorator(
    async (_data: unknown, context: ExecutionContext) => {
      const bearerToken = bearerTokenFromContext(context);

      if (isBearerToken(bearerToken)) {
        return tokenFromBearer(bearerToken);
      }
    },
  )();
}
