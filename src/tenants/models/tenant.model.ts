import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Player } from '../../players/models/player.model';
import { Color } from 'src/colors/models/color.model';

@ObjectType()
export class Tenant {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field()
  fupaSlug: string;

  @Field({ nullable: true })
  imageName?: string;

  @Field(() => [Player])
  players?: Player[];

  @Field(() => [Color])
  colors?: Color[];
}
