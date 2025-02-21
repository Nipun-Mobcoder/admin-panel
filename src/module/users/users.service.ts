import {
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
      const hashPassword = bcrypt.hashSync(
        `${randomInt(10000, 100000)}`,
        this.bcryptSalt,
      );

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
        'User',
        email,
        `${this.configService.getOrThrow('FRONTEND_URL')}forgotPassword?token=${token}`,
        'Reset Password',
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
    try {
      const filter: any = {};
      if (filterData.searchFromEmail)
        filter.email = { $regex: filterData.searchFromEmail, $options: 'i' };

      const sortField = filterData.field || 'createdAt';
      const sortOrder: SortOrder = Number(filterData.order) === -1 ? -1 : 1;

      const sort = { [sortField]: sortOrder };

      const data = await this.userModel
        .find(filter)
        .skip(filterData.skip || 0)
        .sort(sort)
        .limit(filterData.limit || 10)
        .lean()
        .exec();

      return data;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }
}
