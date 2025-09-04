/**
 * @class TenantValidationInterceptor
 * @description 租户验证拦截器
 *
 * 功能与职责：
 * 1. 验证租户请求参数
 * 2. 实现租户业务规则验证
 * 3. 提供统一的参数处理
 *
 * @example
 * ```typescript
 * @UseInterceptors(TenantValidationInterceptor)
 * @Controller('api/tenants')
 * export class TenantController {}
 * ```
 * @since 1.0.0
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantType } from '../../domain/enums/tenant-type.enum';

/**
 * 租户验证拦截器类
 * @description 验证租户相关请求参数
 */
@Injectable()
export class TenantValidationInterceptor implements NestInterceptor {
  /**
   * 拦截请求并验证参数
   * @param context 执行上下文
   * @param next 下一个处理器
   * @returns 处理结果
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const body = request.body;

    // 根据HTTP方法进行不同的验证
    switch (method) {
      case 'POST':
        this.validateCreateTenantRequest(body);
        break;
      case 'PUT':
        this.validateUpdateTenantRequest(body);
        break;
      case 'PATCH':
        this.validatePatchTenantRequest(body);
        break;
    }

    return next.handle();
  }

  /**
   * 验证创建租户请求
   * @param body 请求体
   */
  private validateCreateTenantRequest(body: any): void {
    if (!body) {
      throw new BadRequestException('请求体不能为空');
    }

    // 验证必填字段
    this.validateRequiredFields(body, ['name', 'code', 'domain', 'type']);

    // 验证租户类型
    if (body.type && !Object.values(TenantType).includes(body.type)) {
      throw new BadRequestException('无效的租户类型');
    }

    // 验证字段格式
    this.validateFieldFormats(body);
  }

  /**
   * 验证更新租户请求
   * @param body 请求体
   */
  private validateUpdateTenantRequest(body: any): void {
    if (!body) {
      throw new BadRequestException('请求体不能为空');
    }

    // 验证字段格式（更新时字段都是可选的）
    this.validateFieldFormats(body, false);
  }

  /**
   * 验证部分更新租户请求
   * @param body 请求体
   */
  private validatePatchTenantRequest(body: any): void {
    if (!body) {
      throw new BadRequestException('请求体不能为空');
    }

    // 验证字段格式（部分更新时字段都是可选的）
    this.validateFieldFormats(body, false);
  }

  /**
   * 验证必填字段
   * @param body 请求体
   * @param requiredFields 必填字段列表
   */
  private validateRequiredFields(body: any, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (
        !body[field] ||
        (typeof body[field] === 'string' && body[field].trim() === '')
      ) {
        throw new BadRequestException(`字段 ${field} 不能为空`);
      }
    }
  }

  /**
   * 验证字段格式
   * @param body 请求体
   * @param required 是否必填
   */
  private validateFieldFormats(body: any, required: boolean = true): void {
    // 验证租户名称
    if (body.name !== undefined) {
      if (required && (!body.name || body.name.trim() === '')) {
        throw new BadRequestException('租户名称不能为空');
      }
      if (body.name && (body.name.length < 2 || body.name.length > 100)) {
        throw new BadRequestException('租户名称长度必须在2-100个字符之间');
      }
    }

    // 验证租户代码
    if (body.code !== undefined) {
      if (required && (!body.code || body.code.trim() === '')) {
        throw new BadRequestException('租户代码不能为空');
      }
      if (body.code && !/^[A-Z0-9_-]+$/.test(body.code)) {
        throw new BadRequestException(
          '租户代码只能包含大写字母、数字、下划线和连字符',
        );
      }
      if (body.code && (body.code.length < 2 || body.code.length > 20)) {
        throw new BadRequestException('租户代码长度必须在2-20个字符之间');
      }
    }

    // 验证租户域名
    if (body.domain !== undefined) {
      if (required && (!body.domain || body.domain.trim() === '')) {
        throw new BadRequestException('租户域名不能为空');
      }
      if (body.domain && !this.isValidDomain(body.domain)) {
        throw new BadRequestException('租户域名格式无效');
      }
    }

    // 验证租户类型
    if (body.type !== undefined) {
      if (required && !body.type) {
        throw new BadRequestException('租户类型不能为空');
      }
      if (body.type && !Object.values(TenantType).includes(body.type)) {
        throw new BadRequestException('无效的租户类型');
      }
    }

    // 验证描述
    if (
      body.description !== undefined &&
      body.description &&
      body.description.length > 500
    ) {
      throw new BadRequestException('租户描述长度不能超过500个字符');
    }
  }

  /**
   * 验证域名格式
   * @param domain 域名
   * @returns 是否有效
   */
  private isValidDomain(domain: string): boolean {
    const domainRegex =
      /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain);
  }
}
