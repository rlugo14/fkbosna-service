import {
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  IsPositive,
  IsObject,
  ValidateNested,
  IsNumberString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FineData {
  @IsString()
  name: string;

  @IsNumber()
  cost: number;

  @IsNumber()
  amount: number;

  @IsNumber()
  total: number;
}

export class Player {
  @IsNumber()
  id: number;

  @IsString()
  firstname: number;

  @IsString()
  lastname: number;
}

export class FinesByCategoryType {
  @IsOptional()
  @IsArray()
  TRAINING: FineData[];

  @IsOptional()
  @IsArray()
  GENERAL: FineData[];

  @IsOptional()
  @IsArray()
  GAME: FineData[];
}

export class PlayerBasedFinesByCategoryType {
  @ValidateNested({ each: true })
  key: Map<string, FinesByCategoryType>;
}

export class CreateInvoiceInput {
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => PlayerBasedFinesByCategoryType)
  finesData: PlayerBasedFinesByCategoryType;

  @IsArray()
  playersData: Player[];

  @IsString()
  tenantName: string;

  @IsString()
  tenantSlug: string;

  @IsString()
  tenantImageName: string;

  @IsBoolean()
  withDetails: boolean;
}
