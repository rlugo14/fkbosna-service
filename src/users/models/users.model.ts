import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@ObjectType()
export class User {
  @Field(() => ID)
  id: number;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
export class RegisteredUser {
  @Field(() => ID)
  id: number;

  @Field()
  @IsEmail()
  email: string;
}
