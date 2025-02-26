import { Type } from 'class-transformer';
import { IsEnum, IsObject, ValidateNested } from 'class-validator';
import { Designation } from 'src/common/enum/designations.enum';
import { leaveType } from 'src/common/enum/leaveType.enum';

export class CreateLeavePolicyDTO {
  @IsEnum(Designation)
  designation: Designation;

  @IsObject()
  @ValidateNested()
  @Type(() => Number)
  leaveQuota: Record<leaveType, number>;
}
