import { Field, InputType } from '@nestjs/graphql';
import { MaxLength } from 'class-validator';

@InputType()
export class CreatePlayerInput {
  @Field()
  @MaxLength(20)
  firstname: string;

  @Field()
  @MaxLength(20)
  lastname: string;

  @Field({ nullable: true })
  fupaSlug?: string;

  @Field({ nullable: true })
  colorId?: number;
}

@InputType()
export class CreateManyPlayersInput {
  @Field(() => [CreatePlayerInput])
  data: CreatePlayerInput[];
}
