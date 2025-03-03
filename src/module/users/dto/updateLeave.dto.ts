import { IsEmail, IsEnum, IsNumber } from 'class-validator';
import { leaveType } from 'src/common/enum/leaveType.enum';

export class UpdateLeaveDTO {
  @IsEmail()
  userEmail: string;

  @IsEnum(leaveType)
  leaveType: leaveType;

  @IsNumber()
  days: number;
}
