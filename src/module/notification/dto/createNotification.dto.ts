import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsObject()
  @IsOptional()
  notificationDetails?: Record<string, any>;

  @IsString()
  @IsNotEmpty()
  user: string;
}
