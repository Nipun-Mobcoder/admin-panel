import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from './module/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from './redis/redis.module';
import { SendGridModule } from './email/sendGrid.module';
import { LeavesModule } from './module/leaves/leaves.module';
import { ProjectsModule } from './module/projects/projects.module';
import { KafkaModule } from './kafka/kafka.module';
import { NotificationModule } from './module/notification/notification.module';
import { MulterModule } from '@nestjs/platform-express';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { FoodModule } from './module/food/food.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.getOrThrow('MONGO_URL'),
      }),
      inject: [ConfigService],
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    MulterModule.register({
      dest: './upload',
    }),
    RedisModule,
    UsersModule,
    SendGridModule,
    LeavesModule,
    ProjectsModule,
    NotificationModule,
    KafkaModule,
    CloudinaryModule,
    FoodModule,
  ],
})
export class AppModule {}
