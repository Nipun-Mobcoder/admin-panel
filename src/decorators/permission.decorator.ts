import { SetMetadata } from '@nestjs/common';
import { Permission } from 'src/module/roles/dto/CreateRole.dto';

export const Permissions = (permissions: Permission[]) =>
  SetMetadata('permissions', permissions);
