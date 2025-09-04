/**
 * @class UpdateTenantValidator
 * @description 更新租户验证器
 *
 * 功能与职责：
 * 1. 验证更新租户请求参数
 * 2. 实现租户业务规则验证
 * 3. 提供详细的错误信息
 *
 * @example
 * ```typescript
 * const validator = new UpdateTenantValidator();
 * const errors = validator.validate(request);
 * if (errors.length > 0) {
 *   throw new BadRequestException(errors);
 * }
 * ```
 * @since 1.0.0
 */

import {
  IsString,
  IsOptional,
  IsEnum,
  Length,
  Matches,
  IsUUID,
} from 'class-validator';
import { TenantType } from '../../domain/enums/tenant-type.enum';

/**
 * 更新租户验证器类
 * @description 验证更新租户请求参数
 */
export class UpdateTenantValidator {
  @IsOptional()
  @IsString({ message: '租户名称必须是字符串' })
  @Length(2, 100, { message: '租户名称长度必须在2-100个字符之间' })
  name?: string;

  @IsOptional()
  @IsString({ message: '租户代码必须是字符串' })
  @Length(2, 20, { message: '租户代码长度必须在2-20个字符之间' })
  @Matches(/^[A-Z0-9_-]+$/, {
    message: '租户代码只能包含大写字母、数字、下划线和连字符',
  })
  code?: string;

  @IsOptional()
  @IsString({ message: '租户域名必须是字符串' })
  @Matches(
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    {
      message: '租户域名格式无效',
    },
  )
  domain?: string;

  @IsOptional()
  @IsEnum(TenantType, { message: '无效的租户类型' })
  type?: TenantType;

  @IsOptional()
  @IsString({ message: '租户描述必须是字符串' })
  @Length(0, 500, { message: '租户描述长度不能超过500个字符' })
  description?: string;

  @IsOptional()
  @IsString({ message: '当前用户ID必须是字符串' })
  @IsUUID('4', { message: '当前用户ID必须是有效的UUID格式' })
  currentUserId?: string;
}
