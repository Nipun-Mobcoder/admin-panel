import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model } from 'mongoose';
import { Resource } from 'src/common/enum/resource.enum';
import { Permission } from 'src/module/roles/dto/CreateRole.dto';
import { RolesService } from 'src/module/roles/roles.service';
import { Roles } from 'src/module/roles/schema/roles.schema';
import { User } from 'src/module/users/schema/users.schema';
import { UsersService } from 'src/module/users/users.service';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private readonly logger = new Logger(AuthorizationGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UsersService,
    private readonly roleService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const { user } = request;
    if (!user || !user.id || !user.email) {
      throw new NotFoundException('User not found.');
    }

    const routePermissions: Permission[] = this.reflector.getAllAndOverride(
      'permissions',
      [context.getHandler(), context.getClass()],
    );
    if (!routePermissions) {
      return true;
    }

    const userDetails = await this.userService.getUserAuthorization(user.id);
    if (!userDetails) {
      throw new NotFoundException(`User ${user.email} not found.`);
    }

    const userRoles = userDetails.roleDetails;
    if (!userRoles || userRoles.length === 0) {
      throw new UnauthorizedException(
        `${userDetails.email} is not authorized to perform this action.`,
      );
    }
    const userPermissions = userRoles
      .filter((role: any) => role)
      .flatMap((role: { permissions: any; }) => role?.permissions);
    if (!userPermissions)
      throw new UnauthorizedException(
        `${userDetails.email} is not authorized to perform this action.`,
      );
    for (const routePermission of routePermissions) {
      const userPermission = userPermissions.find(
        (userPermission: { resource: Resource; }) =>
          userPermission?.resource === routePermission.resource,
      );
      if (!userPermission) {
        throw new UnauthorizedException(
          `${userDetails.email} is not authorized to perform this action.`,
        );
      }

      const allActionsAvailable = routePermission.actions.every(
        (requiredAction) => userPermission.actions.includes(requiredAction),
      );
      if (!allActionsAvailable)
        throw new UnauthorizedException(
          `${userDetails.email} is not authorized to perform this action.`,
        );
    }

    return true;
  }
}
