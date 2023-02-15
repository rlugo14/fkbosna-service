import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Player } from '../../players/models/player.model';

@ObjectType()
export class Color {
  @Field(() => Int)
  id: number;

  @Field()
  hexCode: string;

  @Field()
  name: string;

  @Field(() => [Player])
  players?: Player[];
}
