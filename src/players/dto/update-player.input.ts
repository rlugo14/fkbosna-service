import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class PlayerWhereUniqueInput {
  @Field(() => Number)
  id: number;
}

@InputType()
export class PlayersWhereInput {
  @Field(() => [Int], { nullable: true })
  ids: number[];

  @Field(() => Int, { nullable: true })
  colorId: number;
}

@InputType()
export class CreateOrConnectColorInput {
  @Field()
  id: number;

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

  @Field({ nullable: true })
  fupaSlug?: string;

  @Field({ nullable: true })
  colorId?: number;

  @Field({ nullable: true })
  imageName?: string;
}

@InputType()
export class UpdateManyPlayersInput {
  @Field(() => [UpdatePlayerInput])
  data: UpdatePlayerInput[];
}
