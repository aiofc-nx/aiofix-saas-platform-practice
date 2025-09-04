import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import {
  DataIsolationLevel,
  DataPrivacyLevel,
  UserStatus,
  UserType,
} from '../..';

/**
 * @class UserQueryDto
 * @description 用户查询数据传输对象
 */
export class UserQueryDto {
  @ApiPropertyOptional({
    description: '租户ID',
    example: 'tenant-123',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4', { message: '租户ID必须是有效的UUID格式' })
  @Expose()
  tenantId!: string;

  @ApiPropertyOptional({ description: '用户名（模糊匹配）', example: 'john' })
  @IsOptional()
  @IsString({ message: '用户名必须是字符串' })
  @Expose()
  username?: string;

  @ApiPropertyOptional({
    description: '邮箱（模糊匹配）',
    example: 'john@example.com',
  })
  @IsOptional()
  @IsString({ message: '邮箱必须是字符串' })
  @Expose()
  email?: string;

  @ApiPropertyOptional({
    description: '用户状态',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: '用户状态必须是有效的状态值' })
  @Expose()
  status?: UserStatus;

  @ApiPropertyOptional({
    description: '用户类型',
    enum: UserType,
    example: UserType.TENANT_USER,
  })
  @IsOptional()
  @IsEnum(UserType, { message: '用户类型必须是有效的类型值' })
  @Expose()
  userType?: UserType;

  @ApiPropertyOptional({
    description: '组织ID',
    example: 'org-123',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4', { message: '组织ID必须是有效的UUID格式' })
  @Expose()
  organizationId?: string;

  @ApiPropertyOptional({
    description: '部门ID列表',
    example: ['dept-123', 'dept-456'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: '部门ID列表必须是数组' })
  @IsUUID('4', {
    each: true,
    message: '部门ID列表中的每个元素都必须是有效的UUID格式',
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @Expose()
  departmentIds?: string[];

  @ApiPropertyOptional({
    description: '排除的用户ID',
    example: 'user-123',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4', { message: '排除的用户ID必须是有效的UUID格式' })
  @Expose()
  excludeUserId?: string;

  @ApiPropertyOptional({ description: '页码', example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '页码必须是数字' })
  @Min(1, { message: '页码不能小于1' })
  @Expose()
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页大小',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '每页大小必须是数字' })
  @Min(1, { message: '每页大小不能小于1' })
  @Max(100, { message: '每页大小不能超过100' })
  @Expose()
  size?: number = 20;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'createdAt',
    enum: ['id', 'username', 'email', 'status', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsString({ message: '排序字段必须是字符串' })
  @IsIn(['id', 'username', 'email', 'status', 'createdAt', 'updatedAt'], {
    message: '排序字段必须是有效的字段名',
  })
  @Expose()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: '排序顺序',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString({ message: '排序顺序必须是字符串' })
  @IsIn(['ASC', 'DESC'], { message: '排序顺序必须是ASC或DESC' })
  @Expose()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    description: '数据隔离级别',
    enum: DataIsolationLevel,
    example: DataIsolationLevel.USER,
  })
  @IsOptional()
  @IsEnum(DataIsolationLevel, { message: '数据隔离级别必须是有效的级别值' })
  @Expose()
  dataIsolationLevel?: DataIsolationLevel;

  @ApiPropertyOptional({
    description: '数据隐私级别',
    enum: DataPrivacyLevel,
    example: DataPrivacyLevel.PROTECTED,
  })
  @IsOptional()
  @IsEnum(DataPrivacyLevel, { message: '数据隐私级别必须是有效的级别值' })
  @Expose()
  dataPrivacyLevel?: DataPrivacyLevel;
}

/**
 * @class UserStatisticsQueryDto
 * @description 用户统计查询数据传输对象
 */
export class UserStatisticsQueryDto {
  @ApiProperty({ description: '租户ID', example: 'tenant-123', format: 'uuid' })
  @IsUUID('4', { message: '租户ID必须是有效的UUID格式' })
  @Expose()
  tenantId!: string;

  @ApiPropertyOptional({
    description: '组织ID',
    example: 'org-123',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4', { message: '组织ID必须是有效的UUID格式' })
  @Expose()
  organizationId?: string;

  @ApiPropertyOptional({
    description: '部门ID',
    example: 'dept-123',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4', { message: '部门ID必须是有效的UUID格式' })
  @Expose()
  departmentId?: string;

  @ApiPropertyOptional({
    description: '统计周期',
    example: '30d',
    enum: ['1d', '7d', '30d', '90d', '1y'],
  })
  @IsOptional()
  @IsString({ message: '统计周期必须是字符串' })
  @IsIn(['1d', '7d', '30d', '90d', '1y'], {
    message: '统计周期必须是有效的周期值',
  })
  @Expose()
  period?: string = '30d';

  @ApiPropertyOptional({
    description: '分组方式',
    example: 'organization',
    enum: ['organization', 'department', 'status', 'userType'],
  })
  @IsOptional()
  @IsString({ message: '分组方式必须是字符串' })
  @IsIn(['organization', 'department', 'status', 'userType'], {
    message: '分组方式必须是有效的分组值',
  })
  @Expose()
  groupBy?: string = 'organization';
}

/**
 * 用户存在性查询DTO
 */
export class UserExistenceQueryDto {
  @ApiPropertyOptional({
    description: '用户名',
    example: 'john_doe',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: '用户名必须是字符串' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  username?: string;

  @ApiPropertyOptional({
    description: '电子邮箱',
    example: 'john@example.com',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: '电子邮箱必须是字符串' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email?: string;

  @ApiPropertyOptional({
    description: '电话号码',
    example: '+1234567890',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: '电话号码必须是字符串' })
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @ApiProperty({
    description: '租户ID',
    example: 'tenant-123',
    format: 'uuid',
  })
  @IsUUID('4', { message: '租户ID必须是有效的UUID格式' })
  tenantId!: string;

  @ApiPropertyOptional({
    description: '排除的用户ID',
    example: 'user-123',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4', { message: '排除的用户ID必须是有效的UUID格式' })
  excludeUserId?: string;
}
