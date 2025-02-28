import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schema/users.schema';
import { RolesModule } from '../roles/roles.module';
import { SendGridModule } from 'src/email/sendGrip.module';
import { ProjectsModule } from '../projects/projects.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RolesModule,
    SendGridModule,
    ProjectsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
