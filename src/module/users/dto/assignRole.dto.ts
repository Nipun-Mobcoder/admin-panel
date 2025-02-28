import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsString } from 'class-validator';

export class AssignRoleDTO {
  @IsEmail()
  @ApiProperty({ example: 'nipun@gmail.com' })
  email: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ example: ['Admin'] })
  roles: string[];
}
