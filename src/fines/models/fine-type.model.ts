import { Field, Int, ObjectType } from '@nestjs/graphql';

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
}
