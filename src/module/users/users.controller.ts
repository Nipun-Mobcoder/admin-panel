import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/createUser.dto';
import { LoginUserDTO, UserEmailDTO } from './dto/LoginUser.dto';
import { Request } from 'express';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { Permissions } from 'src/decorators/permission.decorator';
import { Resource } from 'src/common/enum/resource.enum';
import { Action } from 'src/common/enum/action.enum';
import { ResetAuthenticationGuard } from 'src/guards/resetAuthentication.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permissions([{ resource: Resource.users, actions: [Action.create] }])
  async register(@Body() createUser: CreateUserDTO) {
    return this.usersService.createUser(createUser);
  }

  @Post('login')
  async login(@Body() loginUser: LoginUserDTO) {
    return this.usersService.login(loginUser);
  }

  @Post('logout')
  async logout(@Body() logoutUser: UserEmailDTO) {
    return this.usersService.logout(logoutUser.email);
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

  @Post('sendResetMail')
  async sendResetMail(@Body() logoutUser: UserEmailDTO) {
    return this.usersService.sendEmailForPassword(logoutUser.email);
  }

  @Patch('resetPassword')
  @UseGuards(ResetAuthenticationGuard)
  async resetPassword(@Body() resetDTO: ResetPasswordDto, @Req() request: Request) {
    const userDetails = request.user;
    if (!userDetails || !userDetails.email) {
      throw new UnauthorizedException();
    }
    return this.usersService.forgotPassword(userDetails.email, resetDTO.password);
  }
}
