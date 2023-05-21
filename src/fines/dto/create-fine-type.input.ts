import { Field, InputType } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { FineTypeCategory } from '../models/fine-type.model';

@InputType()
export class CreateFineTypeInput {
  @Field()
  name: string;

  @Field()
  cost: number;

  @Field()
  @IsEnum(FineTypeCategory)
  category: FineTypeCategory;
}
