import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './schema/project.schema';
import {
  ProjectPolicy,
  ProjectPolicySchema,
} from './schema/projectPolicy.schema';
import { SendGridModule } from 'src/email/sendGrip.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: ProjectPolicy.name, schema: ProjectPolicySchema },
    ]),
    SendGridModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
