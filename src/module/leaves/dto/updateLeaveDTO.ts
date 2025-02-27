import { IsEnum, IsString } from 'class-validator';

export class UpdateLeaveDTO {
  @IsString()
  leaveId: string;

  @IsEnum(['Accepted', 'Declined'])
  status: 'Accepted' | 'Declined';
}
