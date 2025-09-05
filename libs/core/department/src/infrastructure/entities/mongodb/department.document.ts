/**
 * @class DepartmentDocument
 * @description MongoDB文档实体，用于部门数据的查询存储
 *
 * 功能与职责：
 * 1. 定义MongoDB集合结构
 * 2. 映射部门领域实体到MongoDB文档
 * 3. 支持MikroORM的MongoDB驱动
 * 4. 提供查询优化字段
 *
 * @example
 * ```typescript
 * const department = new DepartmentDocument();
 * department.id = 'dept-123';
 * department.name = 'Sales Department';
 * ```
 * @since 2.1.0
 */

import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/mongodb';

/**
 * 部门MongoDB文档实体
 */
@Entity({ collection: 'departments' })
@Index({ properties: ['tenantId'] })
@Index({ properties: ['organizationId'] })
@Index({ properties: ['parentDepartmentId'] })
@Index({ properties: ['code', 'tenantId'] })
@Index({ properties: ['name', 'tenantId', 'organizationId'] })
@Index({ properties: ['status'] })
@Index({ properties: ['level'] })
@Index({ properties: ['createdAt'] })
@Index({ properties: ['searchText'] })
@Index({ properties: ['tags'] })
export class DepartmentDocument {
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

  @Property()
  updatedAt!: Date;

  // 查询优化字段
  @Property({ nullable: true })
  searchText?: string;

  @Property({ type: 'array', nullable: true })
  tags?: string[];
}
