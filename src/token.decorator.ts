import {
  bearerTokenFromContext,
  isBearerToken,
} from './helpers/extractBearerToken';
import { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

export function token() {
  return createParamDecorator(
    async (_data: unknown, context: ExecutionContext) => {
      const bearerToken = bearerTokenFromContext(context);

      if (isBearerToken(bearerToken)) {
        return bearerToken.split(' ')[1];
      }
    },
  )();
}
