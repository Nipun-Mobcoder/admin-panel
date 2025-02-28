import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNumber, IsString } from 'class-validator';

export class CreateProjectDTO {
  @IsString()
  @ApiProperty()
  projectName: string;

  @IsNumber()
  @ApiProperty()
  projectBudget: number;

  @IsEmail()
  @ApiProperty()
  clientEmail: string;

  @IsArray()
  @ApiProperty()
  @IsString({ each: true })
  techStack: string[];

  @IsNumber()
  @ApiProperty()
  proposedDuration: number;

  @IsString()
  @ApiProperty()
  description: string;
}
