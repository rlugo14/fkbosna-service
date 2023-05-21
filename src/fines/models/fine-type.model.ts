import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

@ObjectType()
export class FineType {
  @Field(() => Int)
  id: number;

  @Field()
  cost: number;

  @Field()
  name: string;

  @Field()
  tenantId: number;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @Field(() => FineTypeCategory)
  category: 'GENERAL' | 'GAME' | 'TRAINING';
}

export enum FineTypeCategory {
  GENERAL = 'GENERAL',
  GAME = 'GAME',
  TRAINING = 'TRAINING',
}

registerEnumType(FineTypeCategory, {
  name: 'FineTypeCategory',
});
