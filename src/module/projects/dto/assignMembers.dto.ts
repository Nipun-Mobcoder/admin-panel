import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsString } from 'class-validator';
import { Designation } from 'src/common/enum/designations.enum';

export class AssignMembersDTO {
  @IsString()
  @ApiProperty()
  projectName: string;

  @IsArray()
  @ApiProperty()
  users: Users[];
}

export class Users {
  @IsEnum(Designation)
  @ApiProperty()
  designation: Designation;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  userIDs: String[];
}
