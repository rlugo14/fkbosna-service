import { Field, InputType } from '@nestjs/graphql';
import { MaxLength } from 'class-validator';

@InputType()
export class CreateTenantInput {
  @Field()
  name: string;

  @Field()
  @MaxLength(20)
  slug: string;

  @Field({ nullable: true })
  fupaSlug?: string;

  @Field({ nullable: true })
  imageName?: string;

  @Field({ defaultValue: true })
  active: boolean;
}
