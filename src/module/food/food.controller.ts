import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { FoodService } from './food.service';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { AddRestaurauntDto } from './dto/addRestauraunt.dto';
import { Permissions } from 'src/decorators/permission.decorator';
import { Resource } from 'src/common/enum/resource.enum';
import { Action } from 'src/common/enum/action.enum';

@Controller('food')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Post('restauraunt')
  @Permissions([{ resource: Resource.food, actions: [Action.create] }])
  createRestauraunt(@Body() addRestaurauntDto: AddRestaurauntDto) {
    return this.foodService.addRestauraunt(addRestaurauntDto);
  }
}
