import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { foodType } from 'src/common/enum/foodType.enum';
import {
  AddressSchema,
  AddressSchemaFactory,
} from 'src/module/users/schema/users.schema';

@Schema()
class Menu {
  @Prop({ enum: foodType })
  type: foodType;

  @Prop()
  image: string;

  @Prop({ unique: true })
  name: string;

  @Prop()
  price: number;

  @Prop({ required: false })
  ETM: string;

  @Prop({ default: true })
  isVeg: boolean;

  @Prop({ required: false })
  description: string;
}

const MenuSchema = SchemaFactory.createForClass(Menu);

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({ unique: true })
  name: string;

  @Prop()
  image: string;

  @Prop(
    raw({
      votes: { type: String },
      aggregateRating: { type: String },
    }),
  )
  rating: Record<string, any>;

  @Prop({ type: AddressSchemaFactory })
  address: AddressSchema;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ type: [MenuSchema], default: [] })
  menu: Menu[];
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
