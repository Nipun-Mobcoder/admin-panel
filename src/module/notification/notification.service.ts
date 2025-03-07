import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './schema/notification.schema';
import { Model } from 'mongoose';
import { CreateNotificationDto } from './dto/createNotification.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    private readonly userService: UsersService,
  ) {
    this.logger = new Logger(NotificationService.name);
  }

  async createNotification(createNotificationDto: CreateNotificationDto) {
    const user = await this.userService.findUser(createNotificationDto.user);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    try {
      const notificaiton = await this.notificationModel.create(
        createNotificationDto,
      );
      return notificaiton;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async seenNotification(id: string) {
    try {
      const notificaiton = await this.notificationModel.findOneAndUpdate(
        { _id: id },
        { seen: true },
        { new: true },
      );
      return notificaiton;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }
  async clearNotification(id: string) {
    try {
      const notificaiton = await this.notificationModel.findOneAndUpdate(
        { _id: id },
        { clear: true },
        { new: true },
      );
      return notificaiton;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async fetchNotifications(userId: string, allNotifications = false) {
    if (allNotifications) {
      return this.notificationModel.find({ user: userId });
    }
    const user = await this.userService.findUser(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    try {
      const unseenNotifcations = await this.notificationModel.find({
        user,
        seen: false,
        clear: false,
      });
      const seenNotifications = await this.notificationModel
        .find({ user, seen: true, clear: false })
        .limit(5);
      return { unseenNotifcations, seenNotifications };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }
}
