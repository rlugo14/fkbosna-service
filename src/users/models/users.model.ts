import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';
import { Tenant } from 'src/tenants/models/tenant.model';

@ObjectType()
export class User {
  @Field(() => ID)
  id: number;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  password: string;

  @Field(() => Tenant)
  tenant: Tenant;

  @Field()
  tenantId: number;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;
}

@ObjectType()
export class RegisteredUser {
  @Field()
  id: number;

  @Field()
  @IsEmail()
  email: string;
}
