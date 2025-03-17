import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SortOrder } from 'mongoose';
import { foodType } from 'src/common/enum/foodType.enum';

export class FilterRestaurauntDTO {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: "McDonald's" })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'createdAt' })
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

  @IsOptional()
  @IsEnum(foodType)
  @ApiProperty()
  foodType: foodType;
}
