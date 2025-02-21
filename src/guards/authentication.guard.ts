import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly logger = new Logger(AuthenticationGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      throw new UnauthorizedException('User not authenticated.');
    }

    const token = authHeader.split(' ')?.[1];

    if (!token) {
      throw new UnauthorizedException(
        'User not authenticated. Token is missing',
      );
    }

    const decoded = this.jwtService.decode(token);

    if (!decoded || !decoded.email || !decoded.id) {
      throw new NotFoundException('User details are misssing');
    }

    const redisToken = await this.redisService.get<string>(
      `token:${decoded.email}`,
    );
    if (!redisToken || redisToken !== token) {
      throw new UnauthorizedException('Token has expired.');
    }

    request.user = decoded;

    return true;
  }
}
