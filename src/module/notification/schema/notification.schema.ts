import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/module/users/schema/users.schema';

export type NotificationDocument = mongoose.HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  @Prop()
  type: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  notificationDetails: mongoose.Schema.Types.Mixed;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  user: User;

  @Prop({ default: false })
  seen: boolean;

  @Prop({ default: false })
  clear: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);