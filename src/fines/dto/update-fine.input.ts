import { CreateFineInput, CreateManyFinesInput } from './create-fine.input';
import {
  Field,
  InputType,
  PartialType,
  createUnionType,
} from '@nestjs/graphql';

@InputType()
export class UpdateFineInput extends PartialType(CreateFineInput) {
  @Field()
  id: number;
}

@InputType()
export class UpsertFineInput extends PartialType(CreateFineInput) {
  @Field({ nullable: true })
  id?: number;
}

@InputType()
export class UpsertManyFinesInput {
  @Field(() => [UpsertFineInput])
  data: UpsertFineInput[];
}

export const CreateOrUpsertManyFinesInput = createUnionType({
  name: 'CreateOrUpsertManyFinesInput',
  types: () => [CreateManyFinesInput, UpsertManyFinesInput] as const,
});
