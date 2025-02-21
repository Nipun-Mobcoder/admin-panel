import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { CreateRoleDTO } from './dto/CreateRole.dto';
import { Action } from 'src/common/enum/action.enum';
import { Resource } from 'src/common/enum/resource.enum';
import { Permissions } from 'src/decorators/permission.decorator';
import { AuthorizationGuard } from 'src/guards/authorization.guard';

@Controller('roles')
@UseGuards(AuthenticationGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get(':roleName')
  async getRole(@Param('roleName') roleName: string) {
    return this.rolesService.getRole(roleName);
  }

  @Post('create')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permissions([{ resource: Resource.settings, actions: [Action.create, Action.update] }])
  async createRole(@Body() createRoleDTO: CreateRoleDTO) {
    return this.rolesService.createRole(createRoleDTO);
  }
}
