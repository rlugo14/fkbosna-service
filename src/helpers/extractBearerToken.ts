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
  const gqlContext: { authorization: string } =
    GqlExecutionContext.create(context).getContext();
  const bearerToken = gqlContext.authorization;
  return bearerToken;
};

export const isBearerToken = (bearerToken: string | undefined) =>
  !!bearerToken || (bearerToken && bearerToken.split(' ')[0] === 'Bearer');
