import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Designation } from 'src/common/enum/designations.enum';

export class createPolicyDTO {
  @IsNumber()
  @ApiProperty()
  budget: number;

  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => Number)
  @ApiProperty()
  projectQuota: Record<Designation, number>[];
}
