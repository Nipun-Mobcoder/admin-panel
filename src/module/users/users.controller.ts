import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
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
import { AssignRoleDTO } from './dto/assignRole.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDTO } from './dto/updateUser.dto';

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

  @Get('logout')
  @UseGuards(AuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: Request) {
    const userDetails = request.user;
    if (!userDetails || !userDetails.id || !userDetails.email) {
      throw new UnauthorizedException();
    }
    return this.usersService.logout(userDetails.email);
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

  @Post('assignRole')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permissions([{ resource: Resource.users, actions: [Action.update] }])
  @HttpCode(HttpStatus.OK)
  async assignRole(@Body() assignRoleDTO: AssignRoleDTO) {
    return this.usersService.assignRole(assignRoleDTO);
  }

  @Patch('update')
  @UseGuards(AuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  updateUser(@Req() request: Request, @Body() updateDto: UpdateUserDTO) {
    const userDetails = request.user;
    if (!userDetails || !userDetails.id) {
      throw new UnauthorizedException();
    }
    return this.usersService.updateUser(userDetails.id, updateDto);
  }

  @Post('upload')
  @UseGuards(AuthenticationGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @Req() request: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'image/jpeg' })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const userDetails = request.user;
    if (!userDetails || !userDetails.id) {
      throw new UnauthorizedException();
    }
    return this.usersService.uploadFile(userDetails.id, file);
  }
}
