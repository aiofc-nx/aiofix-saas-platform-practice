/**
 * @class OrganizationAggregate
 * @description 组织聚合根
 *
 * 原理与机制：
 * 1. 继承AggregateRoot，管理一致性边界
 * 2. 封装组织相关的业务规则和验证逻辑
 * 3. 使用事件管理功能
 * 4. 确保数据完整性和一致性
 *
 * 功能与职责：
 * 1. 管理组织的生命周期
 * 2. 执行相关的业务规则
 * 3. 发布领域事件
 * 4. 维护数据的一致性
 *
 * @example
 * ```typescript
 * const aggregate = OrganizationAggregate.create(
 *   'org-123',
 *   'Sales Department',
 *   'SALES',
 *   'tenant-456'
 * );
 * aggregate.activate();
 * ```
 * @since 2.1.0
 */

import { AggregateRoot } from '@aiofix/shared';
import { OrganizationEntity } from '../entities/organization.entity';
import { OrganizationCreatedEvent } from '../domain-events/organization-created.event';
import { OrganizationActivatedEvent } from '../domain-events/organization-activated.event';
import { OrganizationSuspendedEvent } from '../domain-events/organization-suspended.event';
import { OrganizationDeactivatedEvent } from '../domain-events/organization-deactivated.event';
import { OrganizationUpdatedEvent } from '../domain-events/organization-updated.event';
import {
  OrganizationId,
  OrganizationName,
  OrganizationCode,
} from '../value-objects';
import { OrganizationType } from '../enums';

/**
 * 组织聚合根类
 */
export class OrganizationAggregate extends AggregateRoot<string> {
  private _organization!: OrganizationEntity;

  constructor(id: string) {
    super(id);
    // 聚合根构造函数，用于事件溯源重建
  }

  /**
   * 从历史事件加载聚合根
   * @param events 历史事件或实体
   */
  loadFromHistory(events: OrganizationEntity[]): void {
    // 如果传入的是实体而不是事件，直接设置
    if (events.length > 0) {
      this._organization = events[0];
    }
  }

  /**
   * 静态工厂方法 - 创建组织聚合根
   * @param organizationId 组织ID
   * @param name 组织名称
   * @param code 组织代码
   * @param type 组织类型
   * @param tenantId 租户ID
   * @param departmentIds 部门ID列表（可选）
   * @param description 组织描述（可选）
   * @param parentOrganizationId 父组织ID（可选）
   * @param managerId 管理员ID（可选）
   * @param createdBy 创建者
   * @returns 组织聚合根
   */
  static create(
    organizationId: OrganizationId,
    name: OrganizationName,
    code: OrganizationCode,
    type: OrganizationType,
    tenantId: string,
    departmentIds: string[] = [],
    description?: string,
    parentOrganizationId?: OrganizationId,
    managerId?: string,
    createdBy: string = 'system',
  ): OrganizationAggregate {
    const aggregate = new OrganizationAggregate(organizationId.toString());

    // 创建组织实体
    aggregate._organization = OrganizationEntity.create(
      organizationId,
      name,
      code,
      type,
      tenantId,
      departmentIds,
      description,
      parentOrganizationId,
      managerId,
      createdBy,
    );

    // 应用创建事件
    aggregate.addDomainEvent(
      new OrganizationCreatedEvent(
        organizationId.toString(),
        name.toString(),
        code.toString(),
        type,
        tenantId,
        createdBy,
      ),
    );

    return aggregate;
  }

  /**
   * 激活组织
   * @param updatedBy 更新者
   */
  activate(updatedBy: string): void {
    this._organization.activate(updatedBy);

    // 发布激活事件
    this.addDomainEvent(
      new OrganizationActivatedEvent(
        this._organization.organizationId.toString(),
        updatedBy,
      ),
    );
  }

  /**
   * 暂停组织
   * @param updatedBy 更新者
   */
  suspend(updatedBy: string): void {
    this._organization.suspend(updatedBy);

    // 发布暂停事件
    this.addDomainEvent(
      new OrganizationSuspendedEvent(
        this._organization.organizationId.toString(),
        updatedBy,
      ),
    );
  }

  /**
   * 停用组织
   * @param updatedBy 更新者
   */
  deactivate(updatedBy: string): void {
    this._organization.deactivate(updatedBy);

    // 发布停用事件
    this.addDomainEvent(
      new OrganizationDeactivatedEvent(
        this._organization.organizationId.toString(),
        updatedBy,
      ),
    );
  }

  /**
   * 更新组织信息
   * @param name 新名称（可选）
   * @param description 新描述（可选）
   * @param managerId 新管理员ID（可选）
   * @param updatedBy 更新者
   */
  updateInfo(
    name?: OrganizationName,
    description?: string,
    managerId?: string,
    updatedBy: string = 'system',
  ): void {
    const oldName = this._organization.name.toString();
    const oldDescription = this._organization.description;
    const oldManagerId = this._organization.managerId;

    this._organization.updateInfo(name, description, managerId, updatedBy);

    // 发布更新事件
    this.addDomainEvent(
      new OrganizationUpdatedEvent(
        this._organization.organizationId.toString(),
        {
          name: { old: oldName, new: name?.toString() },
          description: { old: oldDescription, new: description },
          managerId: { old: oldManagerId, new: managerId },
        },
        updatedBy,
      ),
    );
  }

  /**
   * 设置元数据
   * @param key 元数据键
   * @param value 元数据值
   * @param updatedBy 更新者
   */
  setMetadata(key: string, value: unknown, updatedBy: string = 'system'): void {
    this._organization.setMetadata(key, value, updatedBy);

    // 发布元数据更新事件
    this.addDomainEvent(
      new OrganizationUpdatedEvent(
        this._organization.organizationId.toString(),
        {
          [`metadata.${key}`]: {
            old: this._organization.getMetadata(key),
            new: value,
          },
        },
        updatedBy,
      ),
    );
  }

  /**
   * 获取组织实体
   * @returns 组织实体
   */
  get organization(): OrganizationEntity {
    return this._organization;
  }

  /**
   * 检查组织是否有效
   * @returns 是否有效
   */
  isValid(): boolean {
    return this._organization.isValid();
  }

  /**
   * 检查组织是否可以提供服务
   * @returns 是否可以提供服务
   */
  canProvideService(): boolean {
    return this._organization.canProvideService();
  }

  /**
   * 检查组织是否已过期
   * @returns 是否已过期
   */
  isExpired(): boolean {
    return this._organization.isExpired();
  }
}
