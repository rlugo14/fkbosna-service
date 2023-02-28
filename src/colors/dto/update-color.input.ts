import { Field, InputType } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';

@InputType()
export class ColorWhereUniqueInput {
  @Field({ nullable: true })
  id: number;
}

@InputType()
export class UpdateColorInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  hexCode?: string;
}
