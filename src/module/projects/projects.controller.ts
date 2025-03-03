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
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('create/policy')
  @Permissions([{ resource: Resource.projects, actions: [Action.create] }])
  async createPolicy(@Body() createPolicyDTO: createPolicyDTO[]) {
    return this.projectsService.createPolicy(createPolicyDTO);
  }

  @Post()
  @Permissions([{ resource: Resource.projects, actions: [Action.create] }])
  async createProject(@Body() createProjectDTO: CreateProjectDTO) {
    return this.projectsService.createProject(createProjectDTO);
  }

  @Get('get/:projectName')
  @Permissions([{ resource: Resource.projects, actions: [Action.read] }])
  async getProject(@Param('projectName') projectName: string) {
    return this.projectsService.getProject(projectName);
  }

  @Get('projectInfo/:token')
  @Permissions([{ resource: Resource.projects, actions: [Action.read] }])
  async getProjectInfo(@Param('token') token: string) {
    return this.projectsService.getProjectInfo(token);
  }

  @Patch('confirmProject')
  @Permissions([{ resource: Resource.projects, actions: [Action.update] }])
  async confirmProject(@Body() confirmProjectDTO: ConfirmProjectDTO) {
    return this.projectsService.confirmProject(confirmProjectDTO);
  }

  @Get('getUsers')
  @Permissions([
    { resource: Resource.projects, actions: [Action.read, Action.update] },
  ])
  async getUsersAccToDesignation() {
    return this.projectsService.getUsersAccToDesignation();
  }

  @Post('assignUsers')
  @Permissions([{ resource: Resource.projects, actions: [Action.update] }])
  async assignUsers(assignMembersDTO: AssignMembersDTO) {
    return this.projectsService.assignUsers(assignMembersDTO);
  }
}
