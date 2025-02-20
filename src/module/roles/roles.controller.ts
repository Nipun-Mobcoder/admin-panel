import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { CreateRoleDTO } from './dto/CreateRole.dto';

@Controller('roles')
@UseGuards(AuthenticationGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get(':roleName')
  async getRole(@Param('roleName') roleName: string) {
    return this.rolesService.getRole(roleName);
  }

  @Post('create')
  async createRole(@Body() createRoleDTO: CreateRoleDTO) {
    return this.createRole(createRoleDTO);
  }
}
