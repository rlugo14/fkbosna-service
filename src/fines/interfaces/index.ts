import { Fine, Prisma } from '@prisma/client';
export interface UpsertTransactions {
  createManyData: Prisma.FineCreateManyInput[];
  updates: Promise<Fine>[];
}
