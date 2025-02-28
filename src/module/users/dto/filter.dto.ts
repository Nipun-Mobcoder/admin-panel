import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { SortOrder } from 'mongoose';

export class FilterDTO {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: "nipun@gmail.com" })
  searchFromEmail?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: "createdAt" })
  field: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: -1 })
  order: SortOrder;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 0 })
  skip?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 10 })
  limit?: string;
}
