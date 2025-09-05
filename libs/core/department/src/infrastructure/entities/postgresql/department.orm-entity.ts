/**
 * @class DepartmentOrmEntity
 * @description PostgreSQL ORM实体，用于部门数据的持久化存储
 *
 * 功能与职责：
 * 1. 定义PostgreSQL表结构
 * 2. 映射部门领域实体到数据库表
 * 3. 支持MikroORM的PostgreSQL驱动
 * 4. 提供数据库索引和约束
 *
 * @example
 * ```typescript
 * const department = new DepartmentOrmEntity();
 * department.id = 'dept-123';
 * department.name = 'Sales Department';
 * ```
 * @since 2.1.0
 */

import {
  Entity,
  PrimaryKey,
  Property,
  Index,
  ManyToOne,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
// import { TenantOrmEntity } from '@aiofix/tenant';
// import { OrganizationOrmEntity } from '@aiofix/organization';

/**
 * 部门PostgreSQL ORM实体
 */
@Entity({ tableName: 'departments' })
@Index({ properties: ['tenantId'] })
@Index({ properties: ['organizationId'] })
@Index({ properties: ['parentDepartmentId'] })
@Index({ properties: ['code', 'tenantId'] })
@Index({ properties: ['name', 'tenantId', 'organizationId'] })
@Index({ properties: ['status'] })
@Index({ properties: ['level'] })
@Index({ properties: ['createdAt'] })
export class DepartmentOrmEntity {
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

  @Property()
  tenantId!: string;

  @Property()
  organizationId!: string;

  @Property({ nullable: true })
  parentDepartmentId?: string;

  @Property({ nullable: true })
  managerId?: string;

  @Property()
  level!: number;

  @Property()
  path!: string;

  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @Property()
  createdBy!: string;

  @Property({ nullable: true })
  updatedBy?: string;

  @Property()
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;

  // 关联关系
  // @ManyToOne(() => TenantOrmEntity, { fieldName: 'tenantId' })
  // tenant!: TenantOrmEntity;

  // @ManyToOne(() => OrganizationOrmEntity, { fieldName: 'organizationId' })
  // organization!: OrganizationOrmEntity;

  @ManyToOne(() => DepartmentOrmEntity, {
    fieldName: 'parentDepartmentId',
    nullable: true,
  })
  parentDepartment?: DepartmentOrmEntity;

  @OneToMany(() => DepartmentOrmEntity, dept => dept.parentDepartment)
  childDepartments = new Collection<DepartmentOrmEntity>(this);
}
