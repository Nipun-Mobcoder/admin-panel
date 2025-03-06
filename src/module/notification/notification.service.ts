import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './schema/notification.schema';
import { Model } from 'mongoose';
import { CreateNotificationDto } from './dto/createNotification.dto';

@Injectable()
export class NotificationService {
    private readonly logger: Logger;
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {
    this.logger = new Logger(NotificationService.name);
  }

  async createNotification(createNotificationDto :CreateNotificationDto) {
    try {
        const notificaiton = await this.notificationModel.create(createNotificationDto);
        return notificaiton;
    } catch (error) {
        this.logger.error(error);
        throw new InternalServerErrorException();
    }
  }

  async seenNotification(id: string) {
    try {
        const notificaiton = await this.notificationModel.updateOne({_id: id}, { seen: true }, { new: true });
        return notificaiton;
    } catch (error) {
        this.logger.error(error);
        throw new InternalServerErrorException();
    }
  }
}
