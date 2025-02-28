import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Designation } from 'src/common/enum/designations.enum';

export class ConfirmProjectDTO {
  @IsString()
  @IsOptional()
  @ApiProperty()
  projectLead?: string;

  @IsObject()
  @IsOptional()
  @ApiProperty()
  chosenQuotation: Record<Designation, number>;

  @IsEnum(['Declined', 'Ongoing'])
  @ApiProperty()
  projectStatus: string;

  @IsString()
  @ApiProperty()
  token: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  budget?: number;
}
