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

export const fineCategoryToLabel = (category: FineTypeCategory | string) => {
  switch (category) {
    case FineTypeCategory.GAME:
      return 'Spiel';
    case FineTypeCategory.TRAINING:
      return 'Training';
    case FineTypeCategory.GENERAL:
      return 'Allgemein';
    default:
      break;
  }
};
