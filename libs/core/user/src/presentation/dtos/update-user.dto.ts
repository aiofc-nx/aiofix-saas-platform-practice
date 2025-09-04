/**
 * @class UpdateUserDto
 * @description
 * 更新用户数据传输对象，用于接收和验证更新用户的请求数据。
 *
 * 原理与机制：
 * 1. 使用class-validator装饰器进行数据验证
 * 2. 使用class-transformer进行数据转换
 * 3. 通过Swagger装饰器生成API文档
 * 4. 所有字段都是可选的，支持部分更新
 *
 * 功能与职责：
 * 1. 定义更新用户的请求数据结构
 * 2. 提供数据验证规则
 * 3. 生成API文档
 * 4. 支持部分字段更新
 *
 * @example
 * ```typescript
 * // 更新用户请求
 * PUT /api/v1/users/{userId}
 * {
 *   "username": "john_doe_updated",
 *   "email": "john.updated@example.com",
 *   "status": "ACTIVE"
 * }
 * ```
 * @since 1.0.0
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserType } from '../../domain/enums/user-type.enum';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { DataPrivacyLevel } from '@aiofix/shared';

/**
 * 用户档案更新DTO
 */
export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    description: '显示名称',
    example: 'John Doe Updated',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: '显示名称必须是字符串' })
  @MinLength(1, { message: '显示名称不能为空' })
  @MaxLength(100, { message: '显示名称长度不能超过100个字符' })
  @Transform(({ value }) => value?.trim())
  displayName?: string;

  @ApiPropertyOptional({
    description: '个人简介',
    example: '高级软件工程师，专注于后端开发和系统架构',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '个人简介必须是字符串' })
  @MaxLength(500, { message: '个人简介长度不能超过500个字符' })
  @Transform(({ value }) => value?.trim())
  bio?: string;

  @ApiPropertyOptional({
    description: '位置信息',
    example: 'New York, NY',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: '位置信息必须是字符串' })
  @MaxLength(200, { message: '位置信息长度不能超过200个字符' })
  @Transform(({ value }) => value?.trim())
  location?: string;

  @ApiPropertyOptional({
    description: '个人网站',
    example: 'https://johndoe-updated.com',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: '个人网站必须是字符串' })
  @MaxLength(255, { message: '个人网站长度不能超过255个字符' })
  @Matches(/^https?:\/\/.+/, { message: '个人网站必须是有效的URL' })
  @Transform(({ value }) => value?.trim())
  website?: string;
}

/**
 * 更新用户DTO
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    description: '用户名',
    example: 'john_doe_updated',
    minLength: 3,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9_-]+$',
  })
  @IsOptional()
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(3, { message: '用户名长度不能少于3个字符' })
  @MaxLength(50, { message: '用户名长度不能超过50个字符' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: '用户名只能包含字母、数字、下划线和连字符',
  })
  @Transform(({ value }) => value?.trim().toLowerCase())
  username?: string;

  @ApiPropertyOptional({
    description: '电子邮箱',
    example: 'john.updated@example.com',
    maxLength: 255,
  })
  @IsOptional()
  @IsEmail({}, { message: '请输入有效的电子邮箱地址' })
  @MaxLength(255, { message: '电子邮箱长度不能超过255个字符' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email?: string;

  @ApiPropertyOptional({
    description: '电话号码',
    example: '+1987654321',
    maxLength: 20,
    pattern: '^\\+?[1-9]\\d{1,14}$',
  })
  @IsOptional()
  @IsString({ message: '电话号码必须是字符串' })
  @MaxLength(20, { message: '电话号码长度不能超过20个字符' })
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: '请输入有效的电话号码' })
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @ApiPropertyOptional({
    description: '用户状态',
    example: 'ACTIVE',
    enum: UserStatus,
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: '用户状态必须是有效的枚举值' })
  status?: UserStatus;

  @ApiPropertyOptional({
    description: '组织ID',
    example: 'org-789',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4', { message: '组织ID必须是有效的UUID格式' })
  organizationId?: string;

  @ApiPropertyOptional({
    description: '部门ID列表',
    example: ['dept-123', 'dept-456'],
    type: [String],
    format: 'uuid',
  })
  @IsOptional()
  @IsArray({ message: '部门ID列表必须是数组' })
  @IsUUID('4', { each: true, message: '每个部门ID必须是有效的UUID格式' })
  departmentIds?: string[];

  @ApiPropertyOptional({
    description: '用户类型',
    example: 'TENANT_ADMIN',
    enum: UserType,
  })
  @IsOptional()
  @IsEnum(UserType, { message: '用户类型必须是有效的枚举值' })
  userType?: UserType;

  @ApiPropertyOptional({
    description: '数据隐私级别',
    example: 'CONFIDENTIAL',
    enum: DataPrivacyLevel,
  })
  @IsOptional()
  @IsEnum(DataPrivacyLevel, { message: '数据隐私级别必须是有效的枚举值' })
  dataPrivacyLevel?: DataPrivacyLevel;

  @ApiPropertyOptional({
    description: '用户档案信息',
    type: UpdateUserProfileDto,
  })
  @IsOptional()
  profile?: UpdateUserProfileDto;
}
