import { Field, InputType } from '@nestjs/graphql';
import { BatchInput } from '../../shared/dto/batch-input.model';

@InputType()
export class DeleteManyColorsInput extends BatchInput {
  @Field(() => [String], { nullable: true })
  names?: string[];
}
