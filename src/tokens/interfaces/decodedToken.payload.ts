import { TokenPayload } from './token.payload';

export type DecodedTokenPayload = TokenPayload & {
  iat: number;
  exp: number;
};
