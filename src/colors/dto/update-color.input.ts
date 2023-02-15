import { Field, InputType } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';

@InputType()
export class ColorWhereUniqueInput {
  @Field({ nullable: true })
  id?: number;

  @Field({ nullable: true })
  hexCode?: string;
}

@InputType()
export class UpdateColorInput implements Prisma.ColorWhereUniqueInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  hexCode?: string;
}
