import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './schema/project.schema';
import {
  ProjectPolicy,
  ProjectPolicySchema,
} from './schema/projectPolicy.schema';
import { SendGridModule } from 'src/email/sendGrid.module';
import { KafkaModule } from 'src/kafka/kafka.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: ProjectPolicy.name, schema: ProjectPolicySchema },
    ]),
    SendGridModule,
    KafkaModule,
    RedisModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
