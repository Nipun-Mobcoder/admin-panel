import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { NotificationGateway } from './notification.gateway';

@Module({
  imports: [NotificationGateway],
  providers: [NotificationGateway, KafkaService],
  exports: [NotificationGateway, KafkaService],
})
export class KafkaModule {}
