import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Restaurant } from './schema/restauraunt.schema';
import { Model } from 'mongoose';
import { AddRestaurauntDto } from './dto/addRestauraunt.dto';

@Injectable()
export class FoodService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(Restaurant.name) private readonly restaurantModel: Model<Restaurant>,
  ) {
    this.logger = new Logger(FoodService.name);
  }

  async addRestauraunt(addRestaurauntDto: AddRestaurauntDto) {
    const ifRestaurauntExists = await this.restaurantModel.exists({ name: addRestaurauntDto.name })
    if(ifRestaurauntExists) {
      throw new ConflictException(`Restauraunt ${addRestaurauntDto.name} exists already.`);
    }

    const restaurant = await this.restaurantModel.create({
      ...addRestaurauntDto,
      rating: {
        votes: addRestaurauntDto.ratingVotes,
        aggregateRating: addRestaurauntDto.aggregateRating
      }
    })
  }
}
