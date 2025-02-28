import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/createUser.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/users.schema';
import { Model, SortOrder, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'node:crypto';
import { RedisService } from 'src/redis/redis.service';
import { LoginUserDTO } from './dto/LoginUser.dto';
import { RolesService } from '../roles/roles.service';
import { SendGridClient } from 'src/email/sendgrid.client';
import { ConfigService } from '@nestjs/config';
import { FilterDTO } from './dto/filter.dto';
import { Designation } from 'src/common/enum/designations.enum';
import { AssignRoleDTO } from './dto/assignRole.dto';
import { UpdateLeaveDTO } from './dto/updateLeave.dto';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly bcryptSalt: string;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly rolesService: RolesService,
    private readonly sendGridClient: SendGridClient,
    private readonly configService: ConfigService,
    private readonly projectService: ProjectsService,
  ) {
    this.bcryptSalt = bcrypt.genSaltSync(10);
  }

  async createUser(createUser: CreateUserDTO) {
    const ifUserExists = await this.userModel.exists({
      email: createUser.email,
    });

    if (ifUserExists) {
      throw new InternalServerErrorException(
        'User already exists with this email id.',
      );
    }
    try {
      const hashPassword = bcrypt.hashSync(`12345678`, this.bcryptSalt);

      let roles: any = [];
      if (createUser.roles && createUser.roles.length !== 0) {
        roles = await Promise.all(
          createUser.roles.map((role) => this.rolesService.getRole(role)),
        );
      }

      const userData = await this.userModel.create({
        ...createUser,
        userName: {
          firstName: createUser.firstName,
          lastName: createUser.lastName,
        },
        password: hashPassword,
        walletAmount: 0,
        roles,
        phoneNumber: {
          countryCode: createUser.countryCode,
          number: createUser.phoneNumber,
        },
      });

      await this.sendEmailForPassword(userData.email);

      return userData;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Looks like something went wrong.',
      );
    }
  }

  async login(loginUser: LoginUserDTO) {
    const { email, password } = loginUser;
    const userData = await this.userModel
      .findOne({ email })
      .select('+password');

    if (!userData) {
      throw new NotFoundException(`User with email ${email} not found.`);
    }

    const isPasswordCorrect = bcrypt.compareSync(password, userData.password);

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Password is incorrect.');
    }
    try {
      const user = {
        id: userData.id,
        email,
        userName: userData.userName,
        phoneNumber: userData.phoneNumber,
        address: userData.address,
        walletAmount: userData.walletAmount,
      };
      const token = await this.jwtService.signAsync({ id: userData.id, email });
      await this.redisService.set(`token:${email}`, token, '1h');

      return { user, token };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async logout(email: string) {
    try {
      await this.redisService.delete(`token:${email}`);
      return `User with email ${email} has been logged out successfully`;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }

  async sendEmailForPassword(email: string) {
    try {
      const userDetails = await this.userModel.findOne({ email });
      if (!userDetails) throw new NotFoundException(`User ${email} not found.`);
      const token = await this.jwtService.signAsync({ email });
      await this.redisService.set(`resetToken:${email}`, token, '1h');
      await this.sendGridClient.send(
        'welcomeMail.ejs',
        email,
        'Reset Password',
        {
          userName: userDetails.userName?.firstName || 'User',
          email,
          url: `${this.configService.getOrThrow('FRONTEND_URL')}forgotPassword?token=${token}`,
        },
      );
      return `Reset Password email sent at ${email}`;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Looks like something went wrong.',
      );
    }
  }

  async forgotPassword(email: string, password: string) {
    try {
      const userDetails = await this.userModel.findOne({ email });
      if (!userDetails) throw new NotFoundException(`User ${email} not found.`);

      const hashedPassword = bcrypt.hashSync(password, this.bcryptSalt);

      const userData = await this.userModel.findOneAndUpdate(
        { email: userDetails.email },
        { password: hashedPassword },
        { new: true },
      );
      this.redisService.delete(`resetToken:${email}`);

      return {
        message: 'Password updated Successfully',
        data: userData,
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async profile(id: string) {
    try {
      const userData = await this.userModel.findById(id);
      return userData;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }

  async getUserAuthorization(id: string) {
    try {
      const user = await this.userModel.aggregate([
        {
          $match: { _id: new Types.ObjectId(id) },
        },
        {
          $lookup: {
            from: 'roles',
            localField: 'roles',
            foreignField: '_id',
            as: 'roleDetails',
          },
        },
      ]);

      return user.length ? user[0] : null;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }

  async findUser(userId: string) {
    try {
      var user = await this.userModel.findById(userId);
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }

  async delete(id: string) {
    try {
      var user = await this.userModel.deleteOne({ _id: id });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
    if (!user || user.deletedCount === 0)
      throw new NotFoundException(`User with ${id} id not found`);

    return `User with ${id} id deleted successfully.`;
  }

  async fetch(filterData: FilterDTO): Promise<User[]> {
    const filter: any = {};
    if (filterData.searchFromEmail)
      filter.email = {
        $regex: filterData.searchFromEmail,
        $options: 'i',
      };

    const admin = await this.rolesService.getRole('admin');

    filter.roles = {
      $ne: admin._id,
    };

    if (
      (filterData.skip && isNaN(Number(filterData.skip))) ||
      (filterData.limit && isNaN(Number(filterData.limit)))
    ) {
      throw new BadRequestException('Skip or Limit is not a number.');
    }

    const sortField = filterData.field || 'createdAt';
    const sortOrder: SortOrder = Number(filterData.order) === -1 ? -1 : 1;

    const sort = { [sortField]: sortOrder };
    try {
      const data = await this.userModel
        .find(filter)
        .skip(Number(filterData.skip) || 0)
        .sort(sort)
        .limit(Number(filterData.limit) || 10)
        .populate('roles', { name: true })
        .lean()
        .exec();

      return data;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }

  async findByDesignation(designation: Designation) {
    try {
      const users = await this.userModel.find({ designation });
      return users;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }

  async assignRole(assignRoleDto: AssignRoleDTO) {
    try {
      const ifUserExists = await this.userModel.findOne({
        email: assignRoleDto.email,
      });
      if (!ifUserExists) {
        throw new NotFoundException(
          `User with the email ${assignRoleDto.email} not found.`,
        );
      }

      const existingRoles = ifUserExists.roles;
      const updatedRoles = new Set([...existingRoles, ...assignRoleDto.roles]);

      const updateduser = await this.userModel.findOneAndUpdate(
        { _id: ifUserExists._id },
        { roles: updatedRoles },
        { new: true },
      );
      return updateduser;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }

  async updateLeaves(updateLeaveDTO: UpdateLeaveDTO) {
    try {
      const user = await this.userModel.findOne({
        email: updateLeaveDTO.userEmail,
      });
      if (!user)
        throw new NotFoundException(
          `User with the email ${updateLeaveDTO.userEmail} not found.`,
        );

      const { leaveType, days } = updateLeaveDTO;
      const updateData = await this.userModel.updateOne(
        { _id: user.id },
        { $inc: { [`leaveApplied.${leaveType}`]: days } },
        { new: true },
      );
      return updateData;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }

  async assignProject(projectName: string, userID: string) {
    try {
      const user = await this.userModel.findById(userID);
      if (!user)
        throw new NotFoundException(`User not found.`);

      const { project } = await this.projectService.getProject(projectName);
      const updateData = await this.userModel.updateOne(
        { _id: user.id },
        { currentProject: project },
        { new: true },
      );
      return updateData;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }
}
