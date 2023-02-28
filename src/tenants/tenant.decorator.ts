import { tokenFromBearer } from './../helpers/extractBearerToken';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from 'src/auth/interfaces/token.payload';
import InvalidTenantException from 'src/exceptions/InvalidTenantException';
import NoTenantException from 'src/exceptions/NoTenantException';
import {
  bearerTokenFromGraphql,
  contextToGqlContext,
} from 'src/helpers/extractBearerToken';

const jwtService = new JwtService();

export enum TenantIdFrom {
  headers,
  token,
}

export const TenantId = createParamDecorator(
  (from: TenantIdFrom, ctx: ExecutionContext) => {
    const gqlContext = contextToGqlContext(ctx);
    let tenantId: number;

    switch (from) {
      case TenantIdFrom.headers:
        const tenantIdFromHeader = gqlContext.req.headers[
          'x-tenant-id'
        ] as string;

        if (!tenantIdFromHeader) throw new NoTenantException();
        if (typeof tenantIdFromHeader === 'string') {
          tenantId = parseInt(tenantIdFromHeader, 10);
        }

        if (Number.isNaN(tenantId))
          throw new InvalidTenantException(tenantIdFromHeader);
      case TenantIdFrom.token:
        const bearerToken = bearerTokenFromGraphql(ctx);
        const token = tokenFromBearer(bearerToken);

        if (token) {
          const tokenPayload = jwtService.decode(token) as TokenPayload;
          tenantId = tokenPayload.tenantId;
        }
    }

    return tenantId;
  },
);
