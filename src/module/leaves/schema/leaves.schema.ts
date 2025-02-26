import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { leaveType } from 'src/common/enum/leaveType.enum';
import { User } from 'src/module/users/schema/users.schema';

export type LeaveDocument = mongoose.HydratedDocument<Leave>;

@Schema({ timestamps: true })
export class Leave {
  @Prop({ enum: leaveType, required: true })
  leaveType: leaveType;

  @Prop({ type: [Date], required: true })
  days: Date[];

  @Prop({ enum: ['Progress', 'Accepted', 'Declined'], required: true })
  status: 'Progress' | 'Accepted' | 'Declined';

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: () => User,
  })
  user: User;

  @Prop({ type: Date, index: { expireAfterSeconds: 10 }, default: null })
  declinedAt?: Date;
}

export const LeaveSchema = SchemaFactory.createForClass(Leave);

LeaveSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate() as any;
  
    if(!update)
        next();

    if (update.status === 'Declined' && !update.declinedAt) {
      update.declinedAt = new Date();
    }
  
    this.setUpdate(update);
  
    next();
  });
  
