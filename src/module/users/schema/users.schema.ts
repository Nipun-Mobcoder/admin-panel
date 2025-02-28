import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { defaultLeaves } from 'src/common/constant/defaultLeaves';
import { ComapnyBranch } from 'src/common/enum/companyBranch.enum';
import { leaveType } from 'src/common/enum/leaveType.enum';
import { Project } from 'src/module/projects/schema/project.schema';
import { Roles } from 'src/module/roles/schema/roles.schema';

export type UserDocument = mongoose.HydratedDocument<User>;

@Schema({ timestamps: { createdAt: true } })
export class User {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop(
    raw({
      firstName: { type: String },
      lastName: { type: String },
    }),
  )
  userName: Record<string, any>;

  @Prop({ required: true, select: false })
  password: string;

  @Prop(
    raw({
      countryCode: { type: String },
      number: { type: Number },
    }),
  )
  phoneNumber: Record<string, any>;

  @Prop({ default: 0 })
  walletAmount: number;

  @Prop()
  designation: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: () => Roles }],
    default: [],
  })
  roles: Roles[];

  @Prop()
  department: string;

  @Prop()
  employeeStatus: string;

  @Prop({ enum: ComapnyBranch, required: true })
  branch: ComapnyBranch;

  @Prop()
  address: mongoose.Schema.Types.Mixed;

  @Prop({
    type: Map,
    of: Number,
    default: defaultLeaves
  })
  leaveApplied: Record<leaveType, number>;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Project })
  currentProject: Project;
}

export const UserSchema = SchemaFactory.createForClass(User);
