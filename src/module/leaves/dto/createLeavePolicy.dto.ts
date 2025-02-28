import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsObject, ValidateNested } from 'class-validator';
import { Designation } from 'src/common/enum/designations.enum';
import { leaveType } from 'src/common/enum/leaveType.enum';

export class CreateLeavePolicyDTO {
  @IsEnum(Designation)
  @ApiProperty()
  designation: Designation;

  @IsObject()
  @ValidateNested()
  @Type(() => Number)
  @ApiProperty()
  leaveQuota: Record<leaveType, number>;
}
