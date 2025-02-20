import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Designation } from 'src/common/enum/designations.enum';

class AddressDTO {
  @IsString()
  state: string;

  @IsString()
  city: string;

  @IsString()
  country: string;

  @IsString()
  zipCode: string;
}

export class CreateUserDTO {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsNumber()
  phoneNumber: number;

  @IsArray()
  @IsString({ each: true })
  roles: string[];

  @IsEnum(Designation)
  designation: Designation;

  @ValidateNested()
  @Type(() => AddressDTO)
  address: AddressDTO;
}
