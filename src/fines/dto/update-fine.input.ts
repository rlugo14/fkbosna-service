import {
  CreatePlayerFineInput,
  CreateManyPlayerFinesInput,
} from './create-fine.input';
import {
  Field,
  InputType,
  PartialType,
  createUnionType,
} from '@nestjs/graphql';

@InputType()
export class UpdateFineInput extends PartialType(CreatePlayerFineInput) {
  @Field()
  id: number;
}

@InputType()
export class UpsertFineInput extends PartialType(CreatePlayerFineInput) {
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
  types: () => [CreateManyPlayerFinesInput, UpsertManyFinesInput] as const,
});
