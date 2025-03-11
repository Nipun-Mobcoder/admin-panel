import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ComapnyBranch } from 'src/common/enum/companyBranch.enum';

class AddressDTO {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Delhi' })
  state?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Adarsh Nagar' })
  city?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'India' })
  country?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '110033' })
  zipCode?: string;
}

export class UpdateUserDTO {
  @IsString()
  @ApiProperty({ example: 'Nipun' })
  @IsOptional()
  firstName?: string;

  @IsString()
  @ApiProperty({ example: 'Bhardwaj' })
  @IsOptional()
  lastName?: string;

  @IsString()
  @ApiProperty({ example: '+91' })
  @IsOptional()
  countryCode?: string;

  @IsNumber()
  @ApiProperty({ example: 8800225566 })
  @IsOptional()
  phoneNumber?: number;

  @IsEnum(ComapnyBranch)
  @ApiProperty({ example: 'India' })
  @IsOptional()
  branch?: ComapnyBranch;

  @ValidateNested()
  @Type(() => AddressDTO)
  @IsOptional()
  @ApiProperty()
  address?: AddressDTO;
}
