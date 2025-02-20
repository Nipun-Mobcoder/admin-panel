import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Action } from 'src/common/enum/action.enum';
import { Resource } from 'src/common/enum/resource.enum';

@Schema()
export class Permission {
  @Prop({ enum: Action, required: true })
  action: Action;

  @Prop({ enum: Resource, required: true })
  resource: Resource;
}
export const PermissionSchema = SchemaFactory.createForClass(Permission);

@Schema({ timestamps: { createdAt: true } })
export class Roles {
  @Prop({ unique: true, lowercase: true, required: true })
  name: string;

  @Prop({ type: [PermissionSchema], default: [] })
  permissions: Permission[];
}
export const RoleSchema = SchemaFactory.createForClass(Roles);
