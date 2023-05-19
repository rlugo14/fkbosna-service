import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateFineTypeInput } from './create-fine-type.input';

@InputType()
export class UpdateFineTypeInput extends PartialType(CreateFineTypeInput) {
  @Field()
  id: number;
}
