import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'Delhi' })
  state: string;

  @IsString()
  @ApiProperty({ example: 'Adarsh Nagar' })
  city: string;

  @IsString()
  @ApiProperty({ example: 'India' })
  country: string;

  @IsString()
  @ApiProperty({ example: '110033' })
  zipCode: string;
}

export class CreateUserDTO {
  @IsString()
  @ApiProperty({ example: 'Nipun' })
  firstName: string;

  @IsString()
  @ApiProperty({ example: 'Bhardwaj' })
  lastName: string;

  @IsEmail()
  @ApiProperty({ example: 'nipun@gmail.com' })
  email: string;

  @IsNumber()
  @ApiProperty({ example: 8800225566 })
  phoneNumber: number;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ example: ['Admin'] })
  roles: string[];

  @IsEnum(Designation)
  @ApiProperty({ example: 'SDE1' })
  designation: Designation;

  @ValidateNested()
  @Type(() => AddressDTO)
  @ApiProperty()
  address: AddressDTO;
}
