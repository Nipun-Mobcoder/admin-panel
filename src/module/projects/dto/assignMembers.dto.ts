import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, IsString, ValidateNested } from 'class-validator';
import { Designation } from 'src/common/enum/designations.enum';

export class AssignMembersDTO {
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => Number)
  @ApiProperty()
  projectQuota: Record<Designation, number>;

  @IsString()
  projectName: string;
}
