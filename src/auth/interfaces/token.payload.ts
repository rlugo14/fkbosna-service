export interface TokenPayload {
  userId: number;
  email: string;
  tenantId: number;
  iat?: number;
  exp?: number;
}
