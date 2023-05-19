import { CreateFineInput } from './create-fine.input';
import { Field, InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateFineInput extends PartialType(CreateFineInput) {
  @Field()
  id: number;
}
