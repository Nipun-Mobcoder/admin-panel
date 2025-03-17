import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Restaurant } from './schema/restauraunt.schema';
import { Model, SortOrder } from 'mongoose';
import { AddRestaurauntDto } from './dto/addRestauraunt.dto';
import { FilterRestaurauntDTO } from './dto/filterRestauraunt.dto';
import { Order } from './schema/order.schema';
import { OrderFoodDto } from './dto/orderFood.dto';
import { UsersService } from '../users/users.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class FoodService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<Restaurant>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
    private readonly userService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {
    this.logger = new Logger(FoodService.name);
  }

  async addRestauraunt(addRestaurauntDto: AddRestaurauntDto) {
    const ifRestaurauntExists = await this.restaurantModel.exists({
      name: addRestaurauntDto.name,
    });
    if (ifRestaurauntExists) {
      throw new ConflictException(
        `Restauraunt ${addRestaurauntDto.name} exists already.`,
      );
    }

    try {
      const restaurant = await this.restaurantModel.create({
        ...addRestaurauntDto,
        rating: {
          votes: addRestaurauntDto.ratingVotes,
          aggregateRating: addRestaurauntDto.aggregateRating,
        },
      });

      return restaurant;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }

  async fetchRestauraunts(filterData: FilterRestaurauntDTO) {
    const filter: any = {};
    if (filterData.search)
      filter.name = {
        $regex: filterData.search,
        $options: 'i',
      };
    if (filterData.foodType) {
      filter.menu = {
        $elemMatch: { type: filterData.foodType },
      };
    }

    if (
      (filterData.skip && isNaN(Number(filterData.skip))) ||
      (filterData.limit && isNaN(Number(filterData.limit)))
    ) {
      throw new BadRequestException('Skip or Limit is not a number.');
    }

    const sortField = filterData.field || 'createdAt';
    const sortOrder: SortOrder = Number(filterData.order) === -1 ? -1 : 1;

    const sort = { [sortField]: sortOrder };
    const restaurants = await this.restaurantModel
      .find(filter)
      .skip(Number(filterData.skip) || 0)
      .sort(sort)
      .limit(Number(filterData.limit) || 10)
      .lean()
      .exec();
    if (!restaurants)
      throw new NotFoundException(
        'Sorry no restauraunt is available for order right now.',
      );

    return restaurants;
  }

  async fetchFoodType() {
    const restaurant = await this.restaurantModel.aggregate([
      {
        $unwind: '$menu',
      },
      {
        $group: {
          _id: '$menu.type',
          restaurants: {
            $push: {
              _id: '$_id',
              name: '$name',
              image: '$image',
              address: '$address',
              rating: '$rating',
              latitude: '$latitude',
              longitude: '$longitude',
              menu: '$menu',
            },
          },
        },
      },
    ]);

    return restaurant;
  }

  async orderFood(userId: string, orderFoodDto: OrderFoodDto) {
    const user = await this.userService.findUser(userId);
    if (!user) throw new NotFoundException('User not found.');

    const restaurant = await this.restaurantModel.findOne({
      name: orderFoodDto.restaurantName,
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found.');

    try {
      const order = await this.orderModel.create({
        reciever: user,
        ...orderFoodDto,
        restaurant,
      });

      return order;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }

  async uploadImage(image: Express.Multer.File) {
    const uploadData = await this.cloudinaryService.uploadImage(image);
    return uploadData.secure_url;
  }
}
