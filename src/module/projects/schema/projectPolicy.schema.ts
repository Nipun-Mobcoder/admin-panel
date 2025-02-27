import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Designation } from 'src/common/enum/designations.enum';

export type ProjectPolicyDocument = mongoose.HydratedDocument<ProjectPolicy>;

@Schema()
export class ProjectPolicy {
  @Prop({ unique: true })
  budget: number;

  @Prop({
    type: [Map],
    of: Number,
    required: true,
  })
  quotation: Record<Designation, number>[];
}

export const ProjectPolicySchema = SchemaFactory.createForClass(ProjectPolicy);
