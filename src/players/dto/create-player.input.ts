import { Field, InputType } from '@nestjs/graphql';
import { MaxLength } from 'class-validator';
import { ColorWhereUniqueInput } from '../../colors/dto/update-color.input';

@InputType()
export class CreatePlayerInput {
  @Field()
  @MaxLength(20)
  firstname: string;

  @Field()
  @MaxLength(20)
  lastname: string;

  @Field({ nullable: true })
  colorId?: number;

  @Field(() => ColorWhereUniqueInput, { nullable: true })
  color?: ColorWhereUniqueInput;
}

@InputType()
export class CreateManyPlayersInput {
  @Field(() => [CreatePlayerInput])
  data: CreatePlayerInput[];
}
