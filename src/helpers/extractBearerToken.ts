import { GqlContext } from './interfaces';
import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const bearerTokenFromHttp = (context: ExecutionContext) => {
  const headers: { authorization: string } = context
    .switchToHttp()
    .getRequest().headers;

  const bearerToken = headers.authorization;
  return bearerToken;
};

export const bearerTokenFromGraphql = (context: ExecutionContext) => {
  const gqlContext = contextToGqlContext(context);
  const bearerToken = gqlContext.authorization;
  return bearerToken;
};

export const bearerTokenFromContext = (context: ExecutionContext) => {
  let bearerToken: string;

  switch (context.getType().toLowerCase()) {
    case 'http':
      bearerToken = bearerTokenFromHttp(context);
      break;
    case 'graphql':
      bearerToken = bearerTokenFromGraphql(context);
      break;
  }

  return bearerToken;
};

export const contextToGqlContext = (context: ExecutionContext): GqlContext =>
  GqlExecutionContext.create(context).getContext();

export const tokenFromBearer = (
  bearerToken: string | undefined,
): string | undefined => {
  return isBearerToken(bearerToken) ? bearerToken.split(' ')[1] : undefined;
};

export const isBearerToken = (bearerToken: string | undefined) =>
  !!bearerToken || (bearerToken && bearerToken.split(' ')[0] === 'Bearer');
