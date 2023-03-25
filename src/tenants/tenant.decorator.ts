import {
  bearerTokenFromHttp,
  tokenFromBearer,
} from './../helpers/extractBearerToken';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IncomingHttpHeaders } from 'http2';
import InvalidTenantException from 'src/exceptions/InvalidTenantException';
import NoTenantException from 'src/exceptions/NoTenantException';
import {
  bearerTokenFromGraphql,
  contextToGqlContext,
} from 'src/helpers/extractBearerToken';
import { TokenPayload } from 'src/tokens/interfaces/token.payload';

const jwtService = new JwtService();

export enum TenantIdFrom {
  headers,
  token,
}

export const TenantId = createParamDecorator(
  (from: TenantIdFrom, ctx: ExecutionContext) => {
    let headers: IncomingHttpHeaders;
    const requestContextType = ctx.getType().toLowerCase();

    switch (requestContextType) {
      case 'http':
        headers = ctx.switchToHttp().getRequest().headers;
        break;
      case 'graphql':
        headers = contextToGqlContext(ctx).req.headers;
        break;
    }
    let tenantId: number;

    switch (from) {
      case TenantIdFrom.headers:
        const tenantIdFromHeader = headers['x-tenant-id'] as string;

        if (!tenantIdFromHeader) throw new NoTenantException();
        if (typeof tenantIdFromHeader === 'string') {
          tenantId = parseInt(tenantIdFromHeader, 10);
        }

        if (Number.isNaN(tenantId))
          throw new InvalidTenantException(tenantIdFromHeader);
      case TenantIdFrom.token:
        const bearerToken =
          requestContextType === 'graphql'
            ? bearerTokenFromGraphql(ctx)
            : bearerTokenFromHttp(ctx);
        const token = tokenFromBearer(bearerToken);

        if (token) {
          const tokenPayload = jwtService.decode(token) as TokenPayload;
          tenantId = tokenPayload.tenantId;
        }
    }

    return tenantId;
  },
);
