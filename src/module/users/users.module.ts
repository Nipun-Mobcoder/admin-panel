import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schema/users.schema';
import { RolesModule } from '../roles/roles.module';
import { SendGridModule } from 'src/email/sendGrip.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RolesModule,
    JwtModule,
    SendGridModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
