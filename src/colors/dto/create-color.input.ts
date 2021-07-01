import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateColorInput {
  @Field()
  name: string;

  @Field()
  hexCode: string;
}

@InputType()
export class CreateManyColorsInput {
  @Field(() => [CreateColorInput])
  data: CreateColorInput[];
}
