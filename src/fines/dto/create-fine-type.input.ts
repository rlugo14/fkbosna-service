import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateFineTypeInput {
  @Field()
  name: string;

  @Field()
  cost: number;
}
