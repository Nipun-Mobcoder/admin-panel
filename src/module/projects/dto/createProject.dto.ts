import { IsArray, IsEmail, IsNumber, IsString } from 'class-validator';

export class CreateProjectDTO {
  @IsString()
  projectName: string;

  @IsNumber()
  projectBudget: number;

  @IsEmail()
  clientEmail: string;

  @IsArray()
  @IsString({ each: true })
  techStack: string[];

  @IsNumber()
  proposedDuration: number;
}
