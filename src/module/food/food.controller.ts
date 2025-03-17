import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { FoodService } from './food.service';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { AddRestaurauntDto } from './dto/addRestauraunt.dto';
import { Permissions } from 'src/decorators/permission.decorator';
import { Resource } from 'src/common/enum/resource.enum';
import { Action } from 'src/common/enum/action.enum';
import { FilterRestaurauntDTO } from './dto/filterRestauraunt.dto';
import { OrderFoodDto } from './dto/orderFood.dto';

@Controller('food')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Post('create')
  @Permissions([{ resource: Resource.food, actions: [Action.create] }])
  createRestauraunt(@Body() addRestaurauntDto: AddRestaurauntDto) {
    return this.foodService.addRestauraunt(addRestaurauntDto);
  }

  @Get()
  fetchRestauraunts(@Query() filterDetails: FilterRestaurauntDTO) {
    return this.foodService.fetchRestauraunts(filterDetails);
  }

  @Get('foodType')
  fetchAccToType() {
    return this.foodService.fetchFoodType();
  }

  @Post('order')
  orderFood(@Req() request: Request, @Body() orderFoodDto: OrderFoodDto) {
    const userDetails = request.user;
    if (!userDetails || !userDetails.id || !userDetails.email) {
      throw new UnauthorizedException();
    }

    return this.foodService.orderFood(userDetails.id, orderFoodDto);
  }
}
