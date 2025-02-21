import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { FilterDTO } from './dto/filter.dto';

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
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUser: LoginUserDTO) {
    return this.usersService.login(loginUser);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() logoutUser: UserEmailDTO) {
    return this.usersService.logout(logoutUser.email);
  }

  @Get('profile')
  @UseGuards(AuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  async profile(@Req() request: Request) {
    const userDetails = request.user;
    if (!userDetails || !userDetails.id || !userDetails.email) {
      throw new UnauthorizedException();
    }
    return this.usersService.profile(userDetails.id);
  }

  @Post('sendResetMail')
  @HttpCode(HttpStatus.OK)
  async sendResetMail(@Body() logoutUser: UserEmailDTO) {
    return this.usersService.sendEmailForPassword(logoutUser.email);
  }

  @Patch('resetPassword')
  @UseGuards(ResetAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetDTO: ResetPasswordDto,
    @Req() request: Request,
  ) {
    const userDetails = request.user;
    if (!userDetails || !userDetails.email) {
      throw new UnauthorizedException();
    }
    return this.usersService.forgotPassword(
      userDetails.email,
      resetDTO.password,
    );
  }

  @Delete(':id')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permissions([{ resource: Resource.users, actions: [Action.delete] }])
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @Get()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permissions([{ resource: Resource.users, actions: [Action.read] }])
  @HttpCode(HttpStatus.OK)
  async fetch(@Query() filter: FilterDTO) {
    return this.usersService.fetch(filter);
  }
}
