import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { Designation } from 'src/common/enum/designations.enum';

export class ConfirmProjectDTO {
  @IsString()
  @IsOptional()
  projectLead?: string;

  @IsObject()
  @IsOptional()
  chosenQuotation: Record<Designation, number>;

  @IsEnum(['Declined', 'Ongoing'])
  projectStatus: string;

  @IsString()
  token: string;
}
