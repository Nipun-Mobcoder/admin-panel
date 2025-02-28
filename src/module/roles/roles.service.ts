import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Roles } from './schema/roles.schema';
import { Model } from 'mongoose';
import { CreateRoleDTO, Permission } from './dto/CreateRole.dto';
import { Resource } from 'src/common/enum/resource.enum';
import { Action } from 'src/common/enum/action.enum';
import { ComapnyBranch } from 'src/common/enum/companyBranch.enum';
import { UpdateRoleDTO } from './dto/UpdateRole.dto';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectModel(Roles.name) private readonly roleModel: Model<Roles>,
  ) {}

  async getRole(roleName: string) {
    try {
      var role = this.roleModel.findOne({ name: roleName });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
    if (!role) throw new NotFoundException(`Role ${roleName} not found`);

    return role;
  }

  async getRoleByID(roleId: string) {
    try {
      var role = this.roleModel.findById({ id: roleId });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
    if (!role) throw new NotFoundException(`Role ${roleId} not found`);

    return role;
  }

  async createRole(createRoleDTO: CreateRoleDTO) {
    var doesRoleExists = await this.roleModel.exists({
      name: createRoleDTO.name,
    });
    if (doesRoleExists) {
      throw new ConflictException(`Role ${createRoleDTO.name} already exists.`);
    }

    try {
      const roleData = await this.roleModel.create({
        name: createRoleDTO.name,
        permissions:
          createRoleDTO.permissions?.map((permission) => ({
            actions: permission.actions,
            resource: permission.resource,
          })) || [],
      });
      return roleData;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }

  async fetchRole() {
    return await this.roleModel.find().select('name').lean();
  }

  async fetch(type: string) {
    switch (type) {
      case 'role':
        return await this.fetchRole();
      case 'resources':
        return Object.values(Resource);
      case 'actions':
        return Object.values(Action);
      case 'branch':
        return Object.values(ComapnyBranch);
      default:
        throw new InternalServerErrorException('Incorrect type fetching');
    }
  }

  async updateRole(updateRoleDTO: UpdateRoleDTO) {
    const role = await this.roleModel.findOne({ name: updateRoleDTO.name });

    if (!role) {
      throw new NotFoundException(`${updateRoleDTO.name} not found.`);
    }

    try {
      let updatedPermissions = role.permissions || [];

      const newPermissions: Permission[] = [];
      updateRoleDTO.addRole.forEach((permission) => {
        const existingPermission = updatedPermissions.find(
          (existing) => existing.resource === permission.resource,
        );

        if (existingPermission) {
          existingPermission.actions = Array.from(
            new Set([...existingPermission.actions, ...permission.actions]),
          );
        } else {
          newPermissions.push(permission);
        }
      });

      updatedPermissions = [...updatedPermissions, ...newPermissions];

      updateRoleDTO.deleteRole.forEach((removePermission) => {
        const existingPermission = updatedPermissions.find(
          (perm) => perm.resource === removePermission.resource,
        );

        if (existingPermission) {
          existingPermission.actions = existingPermission.actions.filter(
            (action) => !removePermission.actions.includes(action),
          );

          if (existingPermission.actions.length === 0) {
            updatedPermissions = updatedPermissions.filter(
              (perm) => perm.resource !== removePermission.resource,
            );
          }
        }
      });

      const roleData = await this.roleModel.findOneAndUpdate(
        { _id: role._id },
        { permissions: updatedPermissions },
        { new: true },
      );

      return roleData;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }
}
