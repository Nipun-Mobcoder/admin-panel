import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationModule } from 'src/module/notification/notification.module';

@Module({
  imports: [NotificationGateway, NotificationModule],
  providers: [NotificationGateway, KafkaService],
  exports: [NotificationGateway, KafkaService],
})
export class KafkaModule {}
