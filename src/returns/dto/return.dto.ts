import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FilterRequestDto } from '../../transactions/dto/filter-request.dto';

export class ReturnsBaseDto extends FilterRequestDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  age: number;

  declare wage: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  inflation: number;
}

export class NpsReturnDto extends ReturnsBaseDto {}

export class IndexReturnDto extends ReturnsBaseDto {}
