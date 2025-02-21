import { Global, Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Roles, RoleSchema } from './schema/roles.schema';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Roles.name, schema: RoleSchema }]),
    JwtModule,
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
