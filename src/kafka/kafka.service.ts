import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { KafkaMessage } from 'kafkajs';

import { producer, consumer } from './kafka.config';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from 'src/module/notification/notification.service';

@Injectable()
export class KafkaService implements OnModuleInit {
  constructor(
    private readonly notificationGateway: NotificationGateway,
    private readonly notificationService: NotificationService,
  ) {}

  async onModuleInit() {
    await this.connect();
    await this.consumeMessages();
  }

  async connect() {
    await producer.connect();
    await consumer.connect();
  }

  async produceMessage(message: any, topic: string = 'notification-topic') {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }

  async consumeMessages() {
    await consumer.subscribe({
      topic: 'notification-topic',
      fromBeginning: true,
    });

    await consumer.run({
      eachMessage: async ({ message }: { message: KafkaMessage }) => {
        if (!message || !message.value)
          throw new Error('Invalid Kafka Message');
        const notification = JSON.parse(message.value.toString());

        console.log('Kafka Message Received:', notification);
        await this.notificationService.createNotification({
          notificationDetails: {...notification.message},
          type: notification.type,
          user: notification.userId
        })
        this.notificationGateway.sendNewNotification(notification);
      },
    });
  }
}
