/**
 * @class TenantOrmEntity
 * @description
 * 租户PostgreSQL实体，用于PostgreSQL数据库的持久化存储。
 *
 * 原理与机制：
 * 1. 使用MikroORM的@Entity装饰器定义PostgreSQL表结构
 * 2. 通过tableName参数指定数据库表名
 * 3. 使用@Property装饰器定义表字段
 * 4. 支持索引、约束等数据库特性
 *
 * 功能与职责：
 * 1. 定义租户数据在PostgreSQL中的存储结构
 * 2. 提供数据库字段映射
 * 3. 支持数据库查询和操作
 * 4. 确保数据完整性和一致性
 *
 * @example
 * ```typescript
 * const tenantEntity = new TenantPostgresEntity();
 * tenantEntity.id = 'tenant-123';
 * tenantEntity.name = 'Acme Corporation';
 * tenantEntity.code = 'ACME';
 * tenantEntity.domain = 'acme.example.com';
 * ```
 * @since 1.0.0
 */

import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';
import { TenantType } from '../../../domain/enums/tenant-type.enum';
import { TenantStatus } from '../../../domain/enums/tenant-status.enum';

/**
 * 租户PostgreSQL实体类
 * @description 租户在PostgreSQL数据库中的持久化实体
 */
@Entity({ tableName: 'tenants' })
@Index({ properties: ['code'], options: { unique: true } })
@Index({ properties: ['domain'], options: { unique: true } })
@Index({ properties: ['name'] })
@Index({ properties: ['type'] })
@Index({ properties: ['status'] })
@Index({ properties: ['createdAt'] })
@Index({ properties: ['updatedAt'] })
export class TenantOrmEntity {
  /**
   * 租户ID - 主键
   * @description 租户的唯一标识符
   */
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  /**
   * 租户名称
   * @description 租户的显示名称
   */
  @Property({ type: 'varchar', length: 255 })
  name!: string;

  /**
   * 租户代码
   * @description 租户的唯一代码，用于标识和引用
   */
  @Property({ type: 'varchar', length: 50, unique: true })
  code!: string;

  /**
   * 租户域名
   * @description 租户的域名，用于访问和识别
   */
  @Property({ type: 'varchar', length: 255, unique: true })
  domain!: string;

  /**
   * 租户类型
   * @description 租户的类型（企业、社团组织、合伙团队、个人）
   */
  @Property({ type: 'varchar', length: 50 })
  type!: TenantType;

  /**
   * 租户状态
   * @description 租户的当前状态
   */
  @Property({ type: 'varchar', length: 50 })
  status!: TenantStatus;

  /**
   * 租户描述
   * @description 租户的详细描述信息
   */
  @Property({ type: 'text', nullable: true })
  description?: string;

  /**
   * 租户配置
   * @description 租户的配置信息，以JSON格式存储
   */
  @Property({ type: 'jsonb', default: '{}' })
  config!: Record<string, any>;

  /**
   * 最大用户数
   * @description 租户允许的最大用户数量
   */
  @Property({ type: 'int', default: 0 })
  maxUsers!: number;

  /**
   * 最大组织数
   * @description 租户允许的最大组织数量
   */
  @Property({ type: 'int', default: 0 })
  maxOrganizations!: number;

  /**
   * 最大存储空间（GB）
   * @description 租户允许的最大存储空间
   */
  @Property({ type: 'int', default: 0 })
  maxStorageGB!: number;

  /**
   * 高级功能是否启用
   * @description 是否启用高级功能
   */
  @Property({ type: 'boolean', default: false })
  advancedFeaturesEnabled!: boolean;

  /**
   * 自定义功能是否启用
   * @description 是否启用自定义功能
   */
  @Property({ type: 'boolean', default: false })
  customizationEnabled!: boolean;

  /**
   * API访问是否启用
   * @description 是否启用API访问
   */
  @Property({ type: 'boolean', default: false })
  apiAccessEnabled!: boolean;

  /**
   * 单点登录是否启用
   * @description 是否启用单点登录
   */
  @Property({ type: 'boolean', default: false })
  ssoEnabled!: boolean;

  /**
   * 订阅开始时间
   * @description 租户订阅的开始时间
   */
  @Property({ type: 'timestamp', nullable: true })
  subscriptionStartDate?: Date;

  /**
   * 订阅结束时间
   * @description 租户订阅的结束时间
   */
  @Property({ type: 'timestamp', nullable: true })
  subscriptionEndDate?: Date;

  /**
   * 创建时间
   * @description 租户记录的创建时间
   */
  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  /**
   * 更新时间
   * @description 租户记录的最后更新时间
   */
  @Property({
    type: 'timestamp',
    defaultRaw: 'CURRENT_TIMESTAMP',
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  /**
   * 版本号
   * @description 用于乐观锁控制的版本号
   */
  @Property({ type: 'int', default: 1 })
  version!: number;
}
