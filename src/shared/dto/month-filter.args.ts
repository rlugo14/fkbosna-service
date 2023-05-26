import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsOptional, Max, Min } from 'class-validator';

@ArgsType()
export class MonthFilterArgs {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0)
  @Max(11)
  month?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  year?: number;
}
