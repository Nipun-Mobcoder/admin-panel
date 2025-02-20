import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { map, Observable, tap } from 'rxjs';

export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getRequest<Response>();

    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      map((data: any) => {
        return {
          statusCode: response.statusCode,
          success: true,
          timeStamp: new Date().toISOString,
          path: url,
          method,
          data,
        };
      }),
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.log(`Response sent for ${method} ${url} in ${duration}ms`);
      }),
    );
  }
}
