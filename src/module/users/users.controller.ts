import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/createUser.dto';
import { LoginUserDTO } from './dto/LoginUser.dto';
import { Request } from 'express';
import { AuthenticationGuard } from 'src/guards/authentication.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUser: CreateUserDTO) {
    return this.usersService.createUser(createUser);
  }

  @Post('login')
  async login(@Body() loginUser: LoginUserDTO) {
    return this.usersService.login(loginUser);
  }

  @Get('profile')
  @UseGuards(AuthenticationGuard)
  async profile(@Req() request: Request) {
    const userDetails = request.user;
    if (!userDetails || !userDetails.id || !userDetails.email) {
      throw new UnauthorizedException();
    }
    return this.usersService.profile(userDetails.id);
  }
}
