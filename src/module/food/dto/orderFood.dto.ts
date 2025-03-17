import { IsNumber, IsPositive, IsString } from 'class-validator';

export class OrderFoodDto {
  @IsString()
  restaurantName: string;

  @IsString()
  food: string;

  @IsNumber()
  @IsPositive()
  price: number;
}
