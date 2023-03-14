import { Field, InputType } from '@nestjs/graphql';
import { MaxLength } from 'class-validator';

@InputType()
export class TenantWhereUniqueInput {
  @Field()
  id: number;
}

@InputType()
export class UpdateTenantInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  @MaxLength(20)
  slug?: string;

  @Field({ nullable: true })
  fupaSlug?: string;

  @Field({ nullable: true })
  imageName?: string;

  @Field({ nullable: true })
  active?: boolean;
}
