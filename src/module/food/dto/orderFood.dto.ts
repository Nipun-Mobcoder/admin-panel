import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString } from 'class-validator';

export class OrderFoodDto {
  @IsString()
  @ApiProperty({ example: "McDonald's" })
  restaurantName: string;

  @IsString()
  @ApiProperty({ example: 'Cheese Burger' })
  food: string;

  @IsNumber()
  @IsPositive()
  @ApiProperty({ example: 100 })
  price: number;
}
