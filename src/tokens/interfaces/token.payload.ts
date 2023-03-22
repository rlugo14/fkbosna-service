export interface TokenPayload {
  userId: number;
  email: string;
  tenantId: number;
  type: 'refresh' | 'access';
}
