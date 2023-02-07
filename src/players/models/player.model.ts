import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Color } from '../../colors/models/color.model';

@ObjectType()
export class Player {
  @Field(() => ID)
  id: number;

  @Field()
  firstname: string;

  @Field()
  lastname: string;

  @Field({ nullable: true })
  color?: Color;

  @Field()
  fupaSlug?: string;

  @Field({ nullable: true })
  imageName?: string;
}
