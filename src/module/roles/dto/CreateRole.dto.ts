import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayUnique, IsEnum, IsString, ValidateNested } from 'class-validator';
import { Action } from 'src/common/enum/action.enum';
import { Resource } from 'src/common/enum/resource.enum';

export class CreateRoleDTO {
  @IsString()
  @ApiProperty({ example: 'Admin' })
  name: string;

  @ValidateNested({ each: true })
  @Type(() => Permission)
  @ApiProperty()
  permissions: Permission[];
}

export class Permission {
  @IsEnum(Resource)
  @ApiProperty({ example: 'products' })
  resource: Resource;

  @IsEnum(Action, { each: true })
  @ArrayUnique()
  @ApiProperty({ example: ['delete'] })
  actions: Action[];
}
