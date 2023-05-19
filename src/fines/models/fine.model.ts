import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { FineType } from './fine-type.model';

@ObjectType()
export class Fine {
  @Field(() => Int)
  id: number;

  @Field()
  amount: number;

  @Field()
  typeId: number;

  @Field()
  playerId: number;

  @Field()
  tenantId: number;

  @Field()
  total: number;

  @Field(() => Date)
  createdAt: Date;
}
