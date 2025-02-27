import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Designation } from 'src/common/enum/designations.enum';
import { User } from 'src/module/users/schema/users.schema';

export type ProjectDocument = mongoose.HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  @Prop({ unique: true, required: true })
  projectName: string;

  @Prop({ required: true })
  budget: number;

  @Prop({
    required: true,
    enum: ['Pending', 'Ongoing', 'Completed', 'Declined'],
  })
  status: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: () => User }],
    default: [],
  })
  projectMembers: User[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  projectLead: User[];

  @Prop()
  clientEmail: string;

  @Prop()
  techStack: string[];

  @Prop({
    type: Map,
    of: Number,
  })
  chosenQuotation: Record<Designation, number>;

  @Prop()
  description: string;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop()
  proposedDuration: number;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
