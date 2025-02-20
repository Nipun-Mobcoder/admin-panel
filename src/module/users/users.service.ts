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
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'node:crypto';
import { RedisService } from 'src/redis/redis.service';
import { LoginUserDTO } from './dto/LoginUser.dto';
import { RolesService } from '../roles/roles.service';
import { SendGridClient } from 'src/email/sendgrid.client';
import { ConfigService } from '@nestjs/config';

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
    try {
      const ifUserExists = await this.userModel.findOne({
        email: createUser.email,
      });

      if (ifUserExists) {
        throw new InternalServerErrorException(
          'User already exists with this email id.',
        );
      }

      const hashPassword = bcrypt.hashSync(
        `${randomInt(10000, 100000)}`,
        this.bcryptSalt,
      );

      let roles: any = [];
      if(createUser.roles && createUser.roles.length!==0 ) {
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
  }

  async sendEmailForPassword(email: string) {
    try {
        const userDetails = await this.userModel.findOne({ email });
        if(!userDetails) 
            throw new NotFoundException(`User ${email} not found.`);
        const secretKey = this.configService.get('JWT_SECRET');
        console.log('JWT_SECRET:', secretKey);
        const token = await this.jwtService.signAsync({email}, { secret: secretKey });
        await this.sendGridClient.send("welcomeMail.ejs", "User", email, `http://localhost:3000/forgotPassword?token=${token}`, "Reset Password");
        return `Reset Password email sent at ${email}`;
    } catch (error) {
        this.logger.error(error);
      throw new InternalServerErrorException(
        'Looks like something went wrong.',
      );
    }
  }

  async forgotPassword(token: string, password: string) {
    const email = await this.jwtService.decode(token);
    const userDetails = await this.userModel.findOne({ email });
    if(!userDetails) 
        throw new NotFoundException(`User ${email} not found.`);

    const hashedPassword = bcrypt.hashSync(password, this.bcryptSalt);

    const userData = await this.userModel.findOneAndUpdate({ id: userDetails._id }, { password: hashedPassword }, { new: true } );

    return {
        message: "Password updated Successfully",
        data: userData
    }
  }

  async profile(id: string) {
    try {
      const userData = await this.userModel.findById(id);
      return userData;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(e);
    }
  }
}
