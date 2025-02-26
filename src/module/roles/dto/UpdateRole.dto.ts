import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Permission } from './CreateRole.dto';

export class UpdateRoleDTO {
  @IsString()
  @ApiProperty({ example: 'Admin' })
  name: string;

  @ValidateNested({ each: true })
  @Type(() => Permission)
  @ApiProperty()
  addRole: Permission[];

  @ValidateNested({ each: true })
  @Type(() => Permission)
  @ApiProperty()
  deleteRole: Permission[];
}
