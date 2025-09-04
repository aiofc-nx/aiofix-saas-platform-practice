/**
 * @class UserResponseDto
 * @description
 * 用户响应数据传输对象，用于返回用户相关的数据。
 *
 * 原理与机制：
 * 1. 使用class-transformer进行数据转换
 * 2. 通过Swagger装饰器生成API文档
 * 3. 隐藏敏感信息，只返回必要的字段
 * 4. 支持嵌套对象和数组的序列化
 *
 * 功能与职责：
 * 1. 定义用户数据的响应结构
 * 2. 提供数据转换和序列化
 * 3. 生成API文档
 * 4. 保护敏感信息
 *
 * @example
 * ```typescript
 * // 用户响应示例
 * {
 *   "id": "user-123",
 *   "username": "john_doe",
 *   "email": "john@example.com",
 *   "status": "ACTIVE",
 *   "userType": "TENANT_USER",
 *   "createdAt": "2024-01-01T00:00:00.000Z",
 *   "profile": {
 *     "displayName": "John Doe",
 *     "bio": "软件工程师"
 *   }
 * }
 * ```
 * @since 1.0.0
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { UserType } from '../../domain/enums/user-type.enum';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { DataPrivacyLevel } from '@aiofix/shared';

/**
 * 用户档案响应DTO
 */
export class UserProfileResponseDto {
  @ApiProperty({
    description: '档案ID',
    example: 'profile-123',
    format: 'uuid',
  })
  @Expose()
  id!: string;

  @ApiPropertyOptional({
    description: '显示名称',
    example: 'John Doe',
  })
  @Expose()
  displayName?: string;

  @ApiPropertyOptional({
    description: '个人简介',
    example: '软件工程师，专注于后端开发',
  })
  @Expose()
  bio?: string;

  @ApiPropertyOptional({
    description: '位置信息',
    example: 'San Francisco, CA',
  })
  @Expose()
  location?: string;

  @ApiPropertyOptional({
    description: '个人网站',
    example: 'https://johndoe.com',
  })
  @Expose()
  website?: string;

  @ApiPropertyOptional({
    description: '头像URL',
    example: 'https://example.com/avatar.jpg',
  })
  @Expose()
  avatar?: string;

  @ApiPropertyOptional({
    description: '时区',
    example: 'America/Los_Angeles',
  })
  @Expose()
  timezone?: string;

  @ApiPropertyOptional({
    description: '语言',
    example: 'zh-CN',
  })
  @Expose()
  language?: string;

  @ApiPropertyOptional({
    description: '出生日期',
    example: '1990-01-01',
    format: 'date',
  })
  @Expose()
  @Transform(({ value }) =>
    value ? new Date(value).toISOString().split('T')[0] : undefined,
  )
  dateOfBirth?: Date;

  @ApiPropertyOptional({
    description: '性别',
    example: 'male',
    enum: ['male', 'female', 'other'],
  })
  @Expose()
  gender?: string;

  @ApiProperty({
    description: '创建时间',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  @Expose()
  @Transform(({ value }) => (value ? new Date(value).toISOString() : undefined))
  createdAt!: Date;

  @ApiProperty({
    description: '更新时间',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  @Expose()
  @Transform(({ value }) => (value ? new Date(value).toISOString() : undefined))
  updatedAt!: Date;
}

/**
 * 用户响应DTO
 */
export class UserResponseDto {
  @ApiProperty({
    description: '用户ID',
    example: 'user-123',
    format: 'uuid',
  })
  @Expose()
  id: string | undefined;

  @ApiProperty({
    description: '用户名',
    example: 'john_doe',
  })
  @Expose()
  username: string | undefined;

  @ApiProperty({
    description: '电子邮箱',
    example: 'john@example.com',
  })
  @Expose()
  email: string | undefined;

  @ApiPropertyOptional({
    description: '电话号码',
    example: '+1234567890',
  })
  @Expose()
  phone?: string;

  @ApiProperty({
    description: '用户状态',
    example: 'ACTIVE',
    enum: UserStatus,
  })
  @Expose()
  status: UserStatus | undefined;

  @ApiProperty({
    description: '用户类型',
    example: 'TENANT_USER',
    enum: UserType,
  })
  @Expose()
  userType: UserType | undefined;

  @ApiProperty({
    description: '租户ID',
    example: 'tenant-123',
    format: 'uuid',
  })
  @Expose()
  tenantId: string | undefined;

  @ApiPropertyOptional({
    description: '组织ID',
    example: 'org-456',
    format: 'uuid',
  })
  @Expose()
  organizationId?: string;

  @ApiPropertyOptional({
    description: '部门ID列表',
    example: ['dept-789', 'dept-101'],
    type: [String],
    format: 'uuid',
  })
  @Expose()
  departmentIds: string[] | undefined;

  @ApiProperty({
    description: '数据隐私级别',
    example: 'PROTECTED',
    enum: DataPrivacyLevel,
  })
  @Expose()
  dataPrivacyLevel: DataPrivacyLevel | undefined;

  @ApiPropertyOptional({
    description: '用户档案信息',
    type: UserProfileResponseDto,
  })
  @Expose()
  @Type(() => UserProfileResponseDto)
  profile?: UserProfileResponseDto;

  @ApiProperty({
    description: '创建时间',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  @Expose()
  @Transform(({ value }) => (value ? new Date(value).toISOString() : undefined))
  createdAt: Date | undefined;

  @ApiProperty({
    description: '更新时间',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  @Expose()
  @Transform(({ value }) => (value ? new Date(value).toISOString() : undefined))
  updatedAt: Date | undefined;

  @ApiProperty({
    description: '版本号',
    example: 1,
  })
  @Expose()
  version!: number;
}

/**
 * 用户列表响应DTO
 */
export class UserListResponseDto {
  @ApiProperty({
    description: '用户列表',
    type: [UserResponseDto],
  })
  @Expose()
  users!: UserResponseDto[];

  @ApiProperty({
    description: '总用户数',
    example: 100,
  })
  @Expose()
  total!: number;

  @ApiProperty({
    description: '当前页码',
    example: 1,
  })
  @Expose()
  page!: number;

  @ApiProperty({
    description: '每页大小',
    example: 20,
  })
  @Expose()
  size!: number;

  @ApiProperty({
    description: '总页数',
    example: 5,
  })
  @Expose()
  totalPages!: number;
}

/**
 * 创建用户响应DTO
 */
export class CreateUserResponseDto {
  @ApiProperty({
    description: '操作是否成功',
    example: true,
  })
  @Expose()
  success!: boolean;

  @ApiProperty({
    description: '新创建的用户ID',
    example: 'user-123',
  })
  @Expose()
  userId!: string;

  @ApiProperty({
    description: '新创建的用户名',
    example: 'john.doe',
  })
  @Expose()
  username!: string;

  @ApiProperty({
    description: '新创建的用户邮箱',
    example: 'john.doe@example.com',
  })
  @Expose()
  email!: string;
}

/**
 * 用户更新响应DTO
 */
export class UpdateUserResponseDto {
  @ApiProperty({
    description: '操作是否成功',
    example: true,
  })
  @Expose()
  success!: boolean;

  @ApiProperty({
    description: '用户ID',
    example: 'user-123',
    format: 'uuid',
  })
  @Expose()
  userId!: string;

  @ApiProperty({
    description: '响应消息',
    example: '用户更新成功',
  })
  @Expose()
  message!: string;
}

/**
 * 用户操作响应DTO
 */
export class UserOperationResponseDto {
  @ApiProperty({
    description: '操作是否成功',
    example: true,
  })
  @Expose()
  success!: boolean;

  @ApiProperty({
    description: '响应消息',
    example: '操作成功',
  })
  @Expose()
  message!: string;
}

/**
 * 用户档案响应DTO（独立）
 */
export class UserProfileDetailResponseDto {
  @ApiProperty({
    description: '操作是否成功',
    example: true,
  })
  @Expose()
  success!: boolean;

  @ApiProperty({
    description: '用户档案',
    type: UserProfileResponseDto,
  })
  @Expose()
  @Type(() => UserProfileResponseDto)
  data!: UserProfileResponseDto;

  @ApiProperty({
    description: '响应消息',
    example: '用户档案获取成功',
  })
  @Expose()
  message!: string;
}

/**
 * 用户统计响应DTO
 */
export class UserStatisticsResponseDto {
  @ApiProperty({
    description: '操作是否成功',
    example: true,
  })
  @Expose()
  success!: boolean;

  @ApiProperty({
    description: '统计数据',
    type: 'object',
    additionalProperties: true,
  })
  @Expose()
  data!: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    usersByStatus: Record<string, number>;
    usersByType: Record<string, number>;
    usersByTenant: Record<string, number>;
  };

  @ApiProperty({
    description: '响应消息',
    example: '用户统计获取成功',
  })
  @Expose()
  message!: string;
}

/**
 * 用户详情响应DTO
 */
export class UserDetailResponseDto {
  @ApiProperty({
    description: '操作是否成功',
    example: true,
  })
  @Expose()
  success!: boolean;

  @ApiProperty({
    description: '用户详情数据',
    type: UserResponseDto,
  })
  @Expose()
  @Type(() => UserResponseDto)
  data!: UserResponseDto;

  @ApiProperty({
    description: '响应消息',
    example: '用户详情获取成功',
  })
  @Expose()
  message!: string;
}

/**
 * 用户存在性检查响应DTO
 */
export class UserExistsResponseDto {
  @ApiProperty({
    description: '操作是否成功',
    example: true,
  })
  @Expose()
  success!: boolean;

  @ApiProperty({
    description: '检查结果',
    type: 'object',
    additionalProperties: true,
  })
  @Expose()
  data!: {
    exists: boolean;
    userId?: string;
    message?: string;
  };

  @ApiProperty({
    description: '响应消息',
    example: '用户存在性检查完成',
  })
  @Expose()
  message!: string;
}

/**
 * 用户关系响应DTO
 */
export class UserRelationshipsResponseDto {
  @ApiProperty({
    description: '操作是否成功',
    example: true,
  })
  @Expose()
  success!: boolean;

  @ApiProperty({
    description: '用户关系列表',
    type: 'array',
  })
  @Expose()
  data!: any[];

  @ApiProperty({
    description: '分页信息',
    type: 'object',
    additionalProperties: true,
  })
  @Expose()
  pagination!: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };

  @ApiProperty({
    description: '响应消息',
    example: '用户关系获取成功',
  })
  @Expose()
  message!: string;
}

/**
 * 通用响应DTO
 */
export class GenericResponseDto {
  @ApiProperty({
    description: '操作是否成功',
    example: true,
  })
  @Expose()
  success!: boolean;

  @ApiProperty({
    description: '响应数据',
    type: 'object',
    additionalProperties: true,
  })
  @Expose()
  data?: any;

  @ApiProperty({
    description: '响应消息',
    example: '操作成功',
  })
  @Expose()
  message!: string;
}
