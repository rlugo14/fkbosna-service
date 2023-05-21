import { Field, InputType } from '@nestjs/graphql';
import { IsPositive } from 'class-validator';

@InputType()
export class CreateFineInput {
  @Field()
  @IsPositive()
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
