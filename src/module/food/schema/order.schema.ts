import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/module/users/schema/users.schema';
import { Restaurant } from './restauraunt.schema';

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  reciever: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Restaurant })
  restaurant: Restaurant;

  @Prop()
  food: string;

  @Prop()
  price: number;

  @Prop({ enum: ['accepted', 'progress', 'rejected', 'completed'], default: 'accepted' })
  status: 'accepted' | 'progress' | 'rejected' | 'completed';
}

export const OrderSchema = SchemaFactory.createForClass(Order);