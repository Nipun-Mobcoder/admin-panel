import { IsNumber, IsOptional, IsString } from 'class-validator';
import { SortOrder } from 'mongoose';

export class FilterDTO {
  @IsOptional()
  @IsString()
  searchFromEmail?: string;

  @IsOptional()
  @IsString()
  field: string;

  @IsOptional()
  @IsString()
  order: SortOrder;

  @IsOptional()
  @IsNumber()
  skip?: number = 0;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}
