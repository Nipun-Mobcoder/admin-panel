import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Leave } from './schema/leaves.schema';
import { Model } from 'mongoose';
import { LeavePolicy } from './schema/leavePolicy.schema';
import { Designation } from 'src/common/enum/designations.enum';
import { CreateLeavePolicyDTO } from './dto/createLeavePolicy.dto';
import { ReqLeaveDTO } from './dto/ReqLeave.dto';
import { UsersService } from '../users/users.service';
import { UpdateLeaveDTO } from './dto/updateLeaveDTO';
import { KafkaService } from 'src/kafka/kafka.service';
import { leaveType } from 'src/common/enum/leaveType.enum';

@Injectable()
export class LeavesService {
  private readonly logger = new Logger(LeavesService.name);
  constructor(
    @InjectModel(Leave.name) private readonly LeaveModel: Model<Leave>,
    @InjectModel(LeavePolicy.name)
    private readonly LeavePolicyModel: Model<LeavePolicy>,
    private readonly userService: UsersService,
    private readonly kafkaService: KafkaService,
  ) {}

  async getLeaveQuotaByDesignation(
    designation: Designation,
  ): Promise<Record<string, number>> {
    const policy = await this.LeavePolicyModel.findOne({ designation }).lean();
    if (!policy) throw new NotFoundException('Leave policy not found');
    return policy.leaveQuota;
  }

  async createLeavePolicy(createLeavePolicy: CreateLeavePolicyDTO[]) {
    try {
      return await this.LeavePolicyModel.create(createLeavePolicy);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async requestLeave(reqLeave: ReqLeaveDTO, userId: string) {
    const user = await this.userService.findUser(userId);
    const leaveQuota = await this.getLeaveQuotaByDesignation(
      user.designation as Designation,
    );

    const totalLeaves = leaveQuota[reqLeave.leaveType];
    const appliedLeaves = user?.leaveApplied?.[reqLeave.leaveType] ?? 0;
    if (reqLeave.days.length > totalLeaves - appliedLeaves) {
      throw new NotAcceptableException(
        'You do not have these may leaves left.',
      );
    }

    const isValid = reqLeave.days.every((day) => day > new Date());
    if (!isValid) {
      throw new BadRequestException();
    }

    const hrDetails = await this.userService.findByDesignation(
      Designation['Human Resource'],
    );
    if (!hrDetails) {
      throw new NotFoundException(
        'No currenct HR is available to look at your request please try again after a period of time.',
      );
    }

    try {
      const applyLeave = await this.LeaveModel.create({
        ...reqLeave,
        status: 'Progress',
        user,
      });

      await this.kafkaService.produceMessage({
        userId: hrDetails[0].id,
        message: {
          type: 'Leave Application',
          user: {
            userName: `${user.userName.firstName} ${user.userName.lastName}`,
            email: user.email,
            ...reqLeave,
          },
        },
      });

      return {
        message: 'Leave applied succesffuly.',
        applyLeave,
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async updateLeave(updateLeave: UpdateLeaveDTO) {
    try {
      const leaveData = await this.LeaveModel.findById(
        updateLeave.leaveId,
      ).populate('user');
      if (!leaveData) {
        throw new NotFoundException('Leave not found.');
      }

      const updatedLeaveData = await this.LeaveModel.findOneAndUpdate(
        { _id: updateLeave.leaveId },
        { status: updateLeave.status },
        { new: true },
      );

      if (updateLeave.status === 'Accepted')
        await this.userService.updateLeaves({
          userEmail: leaveData.user.email,
          days: leaveData.days.length,
          leaveType: leaveData.leaveType,
        });

      return updatedLeaveData;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }
}
