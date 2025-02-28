import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class UpdateLeaveDTO {
  @IsString()
  @ApiProperty()
  leaveId: string;

  @IsEnum(['Accepted', 'Declined'])
  @ApiProperty()
  status: 'Accepted' | 'Declined';
}
