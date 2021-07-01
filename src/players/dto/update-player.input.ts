import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class PlayerWhereUniqueInput {
  @Field(() => Number)
  id: number;
}

@InputType()
export class PlayersWhereUniqueInput {
  @Field(() => [Number])
  ids: number[];
}

@InputType()
export class CreateOrConnectColorInput {
  @Field()
  hexCode: string;

  @Field()
  name: string;
}

@InputType()
export class UpdatePlayerInput {
  @Field({ nullable: true })
  firstname?: string;

  @Field({ nullable: true })
  lastname?: string;

  @Field(() => CreateOrConnectColorInput, { nullable: true })
  color?: CreateOrConnectColorInput;
}

@InputType()
export class UpdateManyPlayersInput {
  @Field(() => [UpdatePlayerInput])
  data: UpdatePlayerInput[];
}
