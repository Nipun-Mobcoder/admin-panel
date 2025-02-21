import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginUserDTO {
  @IsEmail()
  @ApiProperty({ example: 'nipun@gmail.com' })
  email: string;

  @IsString()
  @ApiProperty({ example: '123456789' })
  password: string;
}
