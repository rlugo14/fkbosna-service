import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Player } from '../../players/models/player.model';

@ObjectType()
export class Color {
  @Field(() => ID)
  id: number;

  @Field()
  hexCode: string;

  @Field()
  name: string;

  @Field(() => [Player])
  players?: Player[];
}
