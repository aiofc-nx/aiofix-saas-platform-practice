/**
 * @file organization.document.ts
 * @description 组织MongoDB文档实体
 *
 * 该文件定义了组织在MongoDB数据库中的文档实体映射。
 * 使用MikroORM的MongoDB驱动进行文档映射，支持复杂查询和聚合。
 *
 * 主要功能：
 * 1. 组织数据查询优化
 * 2. 复杂聚合查询支持
 * 3. 全文搜索支持
 * 4. 数据投影和转换
 *
 * 遵循DDD和Clean Architecture原则，作为基础设施层的查询实体。
 */

import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';

/**
 * 组织MongoDB文档实体类
 */
@Entity({ collection: 'organizations' })
@Index({ properties: ['tenantId'] })
@Index({ properties: ['tenantId', 'name'] })
@Index({ properties: ['tenantId', 'code'] })
@Index({ properties: ['tenantId', 'status'] })
@Index({ properties: ['tenantId', 'type'] })
@Index({ properties: ['managerId'] })
@Index({ properties: ['parentOrganizationId'] })
@Index({ properties: ['searchText'] })
@Index({ properties: ['tags'] })
export class OrganizationDocument {
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

  @Property()
  updatedAt!: Date;

  @Property({ default: 1 })
  version!: number;

  // 查询优化字段
  @Property({ nullable: true })
  searchText?: string;

  @Property({ type: 'json', nullable: true })
  tags?: string[];

  @Property({ nullable: true })
  category?: string;

  @Property({ nullable: true })
  priority?: number;

  /**
   * 构造函数
   * @param data 实体数据
   */
  constructor(data?: Partial<OrganizationDocument>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  /**
   * 更新实体
   * @param data 更新数据
   */
  update(data: Partial<OrganizationDocument>): void {
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

  /**
   * 生成搜索文本
   */
  generateSearchText(): void {
    this.searchText = [this.name, this.code, this.description, this.type]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
  }

  /**
   * 添加标签
   * @param tag 标签
   */
  addTag(tag: string): void {
    this.tags ??= [];
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  /**
   * 移除标签
   * @param tag 标签
   */
  removeTag(tag: string): void {
    if (this.tags) {
      this.tags = this.tags.filter(t => t !== tag);
    }
  }
}
