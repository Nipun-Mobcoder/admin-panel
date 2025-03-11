import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { foodType } from 'src/common/enum/foodType.enum';

class MenuDto {
  @IsUrl()
  @ApiProperty({ example: 'https://example.com/burger.jpg' })
  image: string;

  @IsEnum(foodType)
  @ApiProperty({ enum: foodType, example: foodType[0] })
  type: foodType;

  @IsString()
  @ApiProperty({ example: 'Cheese Burger' })
  name: string;

  @IsNumber()
  @IsPositive()
  @ApiProperty({ example: 199.99 })
  price: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '20 mins', required: false })
  ETM?: string;

  @IsBoolean()
  @ApiProperty({ example: true })
  isVeg: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'A delicious cheese burger', required: false })
  description?: string;
}

export class AddRestaurauntDto {
  @IsString()
  @ApiProperty({ example: 'The Burger House' })
  name: string;

  @IsUrl()
  @ApiProperty({ example: 'https://example.com/restaurant.jpg' })
  image: string;

  @IsNumber()
  @ApiProperty({ example: 100 })
  ratingVotes: number;

  @IsNumber()
  @ApiProperty({ example: 4.5 })
  aggregateRating: number;

  @IsString()
  @ApiProperty({ example: '123, Main Street, NY' })
  address: string;

  @IsNumber()
  @IsPositive()
  @ApiProperty({ example: 123.25 })
  latitude: number;

  @IsNumber()
  @IsPositive()
  @ApiProperty({ example: 456.57 })
  longitude: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '5 km', required: false })
  distance?: string;

  @ValidateNested({ each: true })
  @Type(() => MenuDto)
  @IsArray()
  @ApiProperty({ type: [MenuDto] })
  menu: MenuDto[];
}
