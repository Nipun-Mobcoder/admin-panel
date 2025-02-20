import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, Roles } from './schema/roles.schema';
import { Model } from 'mongoose';
import { CreateRoleDTO } from './dto/CreateRole.dto';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectModel(Roles.name) private readonly roleModel: Model<Roles>,
  ) {}

  async getRole(roleName: string) {
    try {
      const role = this.roleModel.findOne({ name: roleName });
      if (!role) throw new NotFoundException(`Role ${roleName} not found`);

      return role;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }

  async createRole(createRoleDTO: CreateRoleDTO) {
    try {
      const doesRoleExists = await this.roleModel.findOne({
        name: createRoleDTO.name,
      });
      if (doesRoleExists) {
        throw new ConflictException(
          `Role ${createRoleDTO.name} already exists.`,
        );
      }

      const roleData = await this.roleModel.create({
        name: createRoleDTO.name,
        permissions: createRoleDTO.permissions.map((permission) => ({
          actions: permission.actions,
          resource: permission.resource,
        })),
      });
      return roleData;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }
}
