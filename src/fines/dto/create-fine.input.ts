import { BatchResponse } from './../../shared/dto/batch-response.model';
import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class CreatePlayerFineInput {
  @Field()
  amount: number;

  @Field()
  playerId: number;

  @Field()
  typeId: number;
}

@ObjectType()
export class UpsertBatchResponse {
  @Field(() => BatchResponse)
  created: BatchResponse;
  @Field(() => BatchResponse)
  updated: BatchResponse;
}

@InputType()
export class CreateFineInput {
  @Field()
  amount: number;

  @Field()
  typeId: number;
}

@InputType()
export class CreateManyPlayerFinesInput {
  @Field(() => [CreatePlayerFineInput])
  data: CreatePlayerFineInput[];
}

@InputType()
export class CreateManyFinesInput {
  @Field(() => [CreateFineInput])
  data: CreateFineInput[];
}
