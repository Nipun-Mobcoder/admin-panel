import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { Permissions } from 'src/decorators/permission.decorator';
import { Resource } from 'src/common/enum/resource.enum';
import { Action } from 'src/common/enum/action.enum';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { createPolicyDTO } from './dto/createPolicy.dto';
import { CreateProjectDTO } from './dto/createProject.dto';
import { ConfirmProjectDTO } from './dto/confirmProject.dto';
import { AssignMembersDTO } from './dto/assignMembers.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('create/policy')
  @Permissions([{ resource: Resource.projects, actions: [Action.create] }])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  async createPolicy(@Body() createPolicyDTO: createPolicyDTO[]) {
    return this.projectsService.createPolicy(createPolicyDTO);
  }

  @Post()
  @Permissions([{ resource: Resource.projects, actions: [Action.create] }])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  async createProject(@Body() createProjectDTO: CreateProjectDTO) {
    return this.projectsService.createProject(createProjectDTO);
  }

  @Get('get/:projectName')
  @Permissions([{ resource: Resource.projects, actions: [Action.read] }])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  async getProject(@Param('projectName') projectName: string) {
    return this.projectsService.getProject(projectName);
  }

  @Get('projectInfo/:token')
  async getProjectInfo(@Param('token') token: string) {
    return this.projectsService.getProjectInfo(token);
  }

  @Patch('confirmProject')
  async confirmProject(@Body() confirmProjectDTO: ConfirmProjectDTO) {
    return this.projectsService.confirmProject(confirmProjectDTO);
  }

  @Get('getUsers')
  @Permissions([
    { resource: Resource.projects, actions: [Action.read, Action.update] },
  ])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  async getUsersAccToDesignation() {
    return this.projectsService.getUsersAccToDesignation();
  }

  @Post('assignUsers')
  @Permissions([{ resource: Resource.projects, actions: [Action.update] }])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  async assignUsers(@Body() assignMembersDTO: AssignMembersDTO) {
    return this.projectsService.assignUsers(assignMembersDTO);
  }
}
