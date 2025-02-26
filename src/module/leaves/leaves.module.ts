import { Module } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { LeavesController } from './leaves.controller';
import { Leave, LeaveSchema } from './schema/leaves.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { LeavePolicy, LeavePolicySchema } from './schema/leavePolicy.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Leave.name, schema: LeaveSchema },
      { name: LeavePolicy.name, schema: LeavePolicySchema },
    ]),
  ],
  controllers: [LeavesController],
  providers: [LeavesService],
})
export class LeavesModule {}
