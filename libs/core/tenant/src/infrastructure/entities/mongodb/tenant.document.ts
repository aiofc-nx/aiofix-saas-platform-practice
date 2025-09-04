/**
 * @class TenantDocument
 * @description
 * 租户MongoDB文档，用于MongoDB数据库的查询和投影存储。
 *
 * 原理与机制：
 * 1. 使用MikroORM的@Entity装饰器定义MongoDB集合结构
 * 2. 通过collection参数指定MongoDB集合名
 * 3. 使用@Property装饰器定义文档字段
 * 4. 支持MongoDB特有的查询和聚合功能
 *
 * 功能与职责：
 * 1. 定义租户数据在MongoDB中的存储结构
 * 2. 提供文档字段映射
 * 3. 支持复杂查询和聚合操作
 * 4. 优化查询性能和数据检索
 *
 * @example
 * ```typescript
 * const tenantEntity = new TenantMongoEntity();
 * tenantEntity.id = 'tenant-123';
 * tenantEntity.name = 'Acme Corporation';
 * tenantEntity.code = 'ACME';
 * tenantEntity.domain = 'acme.example.com';
 * ```
 * @since 1.0.0
 */

import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/mongodb';
import { TenantType, TenantStatus } from '../../../domain/enums';

/**
 * 租户MongoDB实体类
 * @description 租户在MongoDB数据库中的持久化实体
 */
@Entity({ collection: 'tenants' })
@Index({ properties: ['code'] })
@Index({ properties: ['domain'] })
@Index({ properties: ['name'] })
@Index({ properties: ['type'] })
@Index({ properties: ['status'] })
@Index({ properties: ['createdAt'] })
@Index({ properties: ['updatedAt'] })
export class TenantDocument {
  /**
   * 租户ID - 主键
   * @description 租户的唯一标识符
   */
  @PrimaryKey()
  id!: string;

  /**
   * 租户名称
   * @description 租户的显示名称
   */
  @Property({ type: 'string' })
  name!: string;

  /**
   * 租户代码
   * @description 租户的唯一代码，用于标识和引用
   */
  @Property({ type: 'string' })
  code!: string;

  /**
   * 租户域名
   * @description 租户的域名，用于访问和识别
   */
  @Property({ type: 'string' })
  domain!: string;

  /**
   * 租户类型
   * @description 租户的类型（企业、社团组织、合伙团队、个人）
   */
  @Property({ type: 'string' })
  type!: TenantType;

  /**
   * 租户状态
   * @description 租户的当前状态
   */
  @Property({ type: 'string' })
  status!: TenantStatus;

  /**
   * 租户描述
   * @description 租户的详细描述信息
   */
  @Property({ type: 'string', nullable: true })
  description?: string;

  /**
   * 租户配置
   * @description 租户的配置信息，以对象格式存储
   */
  @Property({ type: 'object' })
  config!: Record<string, unknown>;

  /**
   * 最大用户数
   * @description 租户允许的最大用户数量
   */
  @Property({ type: 'number', default: 0 })
  maxUsers!: number;

  /**
   * 最大组织数
   * @description 租户允许的最大组织数量
   */
  @Property({ type: 'number', default: 0 })
  maxOrganizations!: number;

  /**
   * 最大存储空间（GB）
   * @description 租户允许的最大存储空间
   */
  @Property({ type: 'number', default: 0 })
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
  @Property({ type: 'Date', nullable: true })
  subscriptionStartDate?: Date;

  /**
   * 订阅结束时间
   * @description 租户订阅的结束时间
   */
  @Property({ type: 'Date', nullable: true })
  subscriptionEndDate?: Date;

  /**
   * 创建时间
   * @description 租户记录的创建时间
   */
  @Property({ type: 'Date' })
  createdAt!: Date;

  /**
   * 更新时间
   * @description 租户记录的最后更新时间
   */
  @Property({ type: 'Date' })
  updatedAt!: Date;

  /**
   * 版本号
   * @description 用于乐观锁控制的版本号
   */
  @Property({ type: 'number', default: 1 })
  version!: number;
}
