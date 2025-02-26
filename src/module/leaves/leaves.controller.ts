import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { Permissions } from 'src/decorators/permission.decorator';
import { Resource } from 'src/common/enum/resource.enum';
import { Action } from 'src/common/enum/action.enum';
import { CreateLeavePolicyDTO } from './dto/createLeavePolicy.dto';
import { Designation } from 'src/common/enum/designations.enum';
import { ReqLeaveDTO } from './dto/ReqLeave.dto';
import { Request } from 'express';
import { UpdateLeaveDTO } from './dto/updateLeaveDTO';

@Controller('leaves')
@UseGuards(AuthenticationGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post('createPolicy')
  @Permissions([{ resource: Resource.leavePolicy, actions: [Action.create] }])
  @UseGuards(AuthorizationGuard)
  async createLeavePolicy(@Body() createLeavePolicy: CreateLeavePolicyDTO[]) {
    return this.leavesService.createLeavePolicy(createLeavePolicy);
  }

  @Get('getLeaveQuota/:designation')
  @HttpCode(HttpStatus.OK)
  async getLeaveQuotaByDesignation(
    @Query('designation') designation: Designation,
  ) {
    return this.leavesService.getLeaveQuotaByDesignation(designation);
  }

  @Post()
  async requestLeaves(@Body() reqLeave: ReqLeaveDTO, @Req() request: Request) {
    const userDetails = request.user;
    if (!userDetails || !userDetails.id || !userDetails.email) {
      throw new UnauthorizedException();
    }
    return this.leavesService.requestLeave(reqLeave, userDetails.id);
  }

  @Post('update')
  @Permissions([{ resource: Resource.leavePolicy, actions: [Action.update] }])
  @UseGuards(AuthorizationGuard)
  async updateLeaveStatus(@Body() updateStatus: UpdateLeaveDTO) {
    return this.leavesService.updateLeave(updateStatus);
  }
}
