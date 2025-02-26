import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { leaveType } from 'src/common/enum/leaveType.enum';
import { Designation } from 'src/common/enum/designations.enum';

export type LeavePolicyDocument = LeavePolicy & Document;

@Schema({ timestamps: true })
export class LeavePolicy {
  @Prop({
    type: String,
    enum: Object.values(Designation),
    required: true,
    unique: true,
  })
  designation: Designation;

  @Prop({
    type: Map,
    of: Number,
    required: true,
  })
  leaveQuota: Record<leaveType, number>;
}

export const LeavePolicySchema = SchemaFactory.createForClass(LeavePolicy);
