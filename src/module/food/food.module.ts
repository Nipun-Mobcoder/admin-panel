import { Module } from '@nestjs/common';
import { FoodService } from './food.service';
import { FoodController } from './food.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Restaurant, RestaurantSchema } from './schema/restauraunt.schema';
import { Order, OrderSchema } from './schema/order.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    CloudinaryModule,
  ],
  controllers: [FoodController],
  providers: [FoodService],
})
export class FoodModule {}
