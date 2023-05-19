import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Color } from '../../colors/models/color.model';
import { Tenant } from 'src/tenants/models/tenant.model';

@ObjectType()
export class Player {
  @Field(() => Int)
  id: number;

  @Field()
  firstname: string;

  @Field()
  lastname: string;

  @Field(() => Color, { nullable: true })
  color?: Color;

  @Field()
  fupaSlug?: string;

  @Field({ nullable: true })
  imageName?: string;

  @Field(() => Tenant)
  tenant: Tenant;

  @Field()
  tenantId: number;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;
}
