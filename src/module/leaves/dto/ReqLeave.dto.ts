import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsString,
  ValidateNested,
} from 'class-validator';
import { leaveType } from 'src/common/enum/leaveType.enum';

export class ReqLeaveDTO {
  @IsEnum(leaveType)
  @ApiProperty()
  leaveType: leaveType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Date)
  @IsDate({ each: true })
  @ApiProperty()
  days: Date[];

  @IsString()
  @ApiProperty()
  reason: string;
}
