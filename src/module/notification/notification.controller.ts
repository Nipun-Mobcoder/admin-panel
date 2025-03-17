import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { Request } from 'express';

@Controller('notification')
@UseGuards(AuthenticationGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('seen/:id')
  seenNotification(@Param('id') id: string) {
    return this.notificationService.seenNotification(id);
  }

  @Get('clear/:id')
  clearNotification(@Param('id') id: string) {
    return this.notificationService.clearNotification(id);
  }

  @Get('fetch')
  fetchNotifications(
    @Req() request: Request,
    @Query('allNotifications') allNotifications: string,
  ) {
    const userDetails = request.user;
    if (!userDetails || !userDetails.id) {
      throw new UnauthorizedException();
    }
    if (!allNotifications) {
      return this.notificationService.fetchNotifications(userDetails.id);
    }
    return this.notificationService.fetchNotifications(
      userDetails.id,
      Boolean(allNotifications),
    );
  }
}
