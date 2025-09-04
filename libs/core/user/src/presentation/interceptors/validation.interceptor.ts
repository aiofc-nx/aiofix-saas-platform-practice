import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * 验证拦截器
 * @description 拦截请求并实现数据验证
 */
@Injectable()
export class ValidationInterceptor implements NestInterceptor {
  /**
   * 拦截请求并实现验证
   * @param context 执行上下文
   * @param next 下一个处理器
   * @returns 可观察对象
   */
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const validationSchema = request.validationSchema;

    if (validationSchema && request.body) {
      try {
        // 转换并验证数据
        const dto = plainToClass(validationSchema, request.body);
        const errors = await validate(dto);

        if (errors.length > 0) {
          throw new BadRequestException('数据验证失败', {
            cause: errors,
          });
        }

        // 更新请求体为验证后的数据
        request.body = dto;
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new BadRequestException('数据验证失败');
      }
    }

    return next.handle();
  }
}
