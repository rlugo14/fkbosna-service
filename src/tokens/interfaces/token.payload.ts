export interface TokenPayload {
  userId: number;
  email: string;
  tenantId: number;
  isEmailConfirmed: boolean;
  type: 'refresh' | 'access';
}
