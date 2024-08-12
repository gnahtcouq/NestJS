import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class ThrottleExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status = exception.getStatus();
    const message =
      status === 429
        ? 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút'
        : exception.message;

    response.status(status).json({
      statusCode: status,
      message: message,
    });
  }
}
