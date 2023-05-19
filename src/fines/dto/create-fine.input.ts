import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateFineInput {
  @Field()
  amount: number;

  @Field()
  playerId: number;

  @Field()
  typeId: number;
}

@InputType()
export class CreateManyFinesInput {
  @Field(() => [CreateFineInput])
  data: CreateFineInput[];
}
