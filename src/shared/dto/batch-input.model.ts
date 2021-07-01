import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class BatchInput {
  @Field(() => [Number], { nullable: true })
  ids?: number[];
}
