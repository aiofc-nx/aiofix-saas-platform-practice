/**
 * @file organization.orm-entity.ts
 * @description 组织PostgreSQL ORM实体
 *
 * 该文件定义了组织在PostgreSQL数据库中的ORM实体映射。
 * 使用MikroORM进行ORM映射，支持多租户数据隔离。
 *
 * 主要功能：
 * 1. 组织数据持久化
 * 2. 多租户数据隔离
 * 3. 关系映射
 * 4. 索引优化
 *
 * 遵循DDD和Clean Architecture原则，作为基础设施层的持久化实体。
 */

import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';

/**
 * 组织PostgreSQL ORM实体类
 */
@Entity({ tableName: 'organizations' })
@Index({ properties: ['tenantId'] })
@Index({ properties: ['tenantId', 'name'] })
@Index({ properties: ['tenantId', 'code'] })
@Index({ properties: ['tenantId', 'status'] })
@Index({ properties: ['tenantId', 'type'] })
@Index({ properties: ['managerId'] })
@Index({ properties: ['parentOrganizationId'] })
export class OrganizationOrmEntity {
  @PrimaryKey()
  id!: string;

  @Property()
  name!: string;

  @Property()
  code!: string;

  @Property()
  type!: string;

  @Property()
  status!: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  parentOrganizationId?: string;

  @Property({ nullable: true })
  managerId?: string;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown>;

  @Property()
  tenantId!: string;

  @Property({ nullable: true })
  organizationId?: string;

  @Property({ type: 'json', nullable: true })
  departmentIds?: string[];

  @Property()
  dataPrivacyLevel!: string;

  @Property()
  createdBy!: string;

  @Property({ nullable: true })
  updatedBy?: string;

  @Property()
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;

  @Property({ default: 1 })
  version!: number;

  /**
   * 构造函数
   * @param data 实体数据
   */
  constructor(data?: Partial<OrganizationOrmEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  /**
   * 更新实体
   * @param data 更新数据
   */
  update(data: Partial<OrganizationOrmEntity>): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
    this.version += 1;
  }

  /**
   * 检查是否为活跃状态
   * @returns 是否活跃
   */
  isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  /**
   * 检查是否为初始化状态
   * @returns 是否初始化
   */
  isInitializing(): boolean {
    return this.status === 'INITIALIZING';
  }

  /**
   * 检查是否为暂停状态
   * @returns 是否暂停
   */
  isSuspended(): boolean {
    return this.status === 'SUSPENDED';
  }

  /**
   * 检查是否为停用状态
   * @returns 是否停用
   */
  isInactive(): boolean {
    return this.status === 'INACTIVE';
  }

  /**
   * 检查是否为删除状态
   * @returns 是否删除
   */
  isDeleted(): boolean {
    return this.status === 'DELETED';
  }
}
