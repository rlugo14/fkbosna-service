import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Player } from '../../players/models/player.model';
import { Tenant } from 'src/tenants/models/tenant.model';

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

  @Field(() => Tenant)
  tenant: Tenant;

  @Field()
  tenantId: number;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;
}
