/**
 * @class UserRelationshipAggregate
 * @description
 * 用户关系聚合根，负责管理用户关系实体和相关的业务规则。
 *
 * 原理与机制：
 * 1. 作为聚合根，UserRelationshipAggregate管理用户关系实体的一致性边界
 * 2. 继承AggregateRoot基类，支持事件溯源和版本管理
 * 3. 封装用户关系相关的业务规则和验证逻辑
 * 4. 管理未提交的领域事件
 * 5. 确保用户关系数据的完整性和一致性
 *
 * 功能与职责：
 * 1. 管理用户关系实体的生命周期
 * 2. 执行用户关系相关的业务规则
 * 3. 发布领域事件
 * 4. 维护用户关系数据的一致性
 * 5. 支持事件溯源和状态重建
 *
 * @example
 * ```typescript
 * const relationshipAggregate = UserRelationshipAggregate.create(
 *   'rel-123',
 *   'user-456',
 *   'tenant-789',
 *   'TENANT_MEMBER',
 *   'ACTIVE'
 * );
 * relationshipAggregate.activate();
 * relationshipAggregate.grantPermission('READ');
 * ```
 * @since 1.0.0
 */

import { AggregateRoot } from '@aiofix/shared';
import { UserRelationshipEntity } from '../entities/user-relationship.entity';
import {
  RelationshipType,
  RelationshipStatus,
} from '../entities/user-relationship.entity';
import {
  UserRelationshipCreatedEvent,
  UserRelationshipUpdatedEvent,
} from '../domain-events';

/**
 * 用户关系聚合根类
 * @description 继承AggregateRoot，支持事件溯源和版本管理
 */
export class UserRelationshipAggregate extends AggregateRoot<string> {
  private _relationship!: UserRelationshipEntity;

  constructor(id: string) {
    super(id);
  }

  /**
   * 静态工厂方法，创建用户关系聚合根
   * @description 创建新的用户关系聚合根实例
   * @param {string} id 关系ID
   * @param {string} userId 用户ID
   * @param {string} targetEntityId 目标实体ID
   * @param {RelationshipType} relationshipType 关系类型
   * @param {RelationshipStatus} [status] 关系状态
   * @param {string} [tenantId] 租户ID
   * @param {string} [organizationId] 组织ID
   * @param {string[]} [departmentIds] 部门ID列表
   * @returns {UserRelationshipAggregate} 用户关系聚合根实例
   */
  static create(
    id: string,
    userId: string,
    targetEntityId: string,
    relationshipType: RelationshipType,
    status: RelationshipStatus = RelationshipStatus.ACTIVE,
    tenantId?: string,
    organizationId?: string,
    departmentIds: string[] = [],
  ): UserRelationshipAggregate {
    const aggregate = new UserRelationshipAggregate(id);

    // 创建用户关系实体
    aggregate._relationship = UserRelationshipEntity.create(
      id,
      userId,
      targetEntityId,
      relationshipType,
      status,
      tenantId,
      organizationId,
      departmentIds,
    );

    // 应用用户关系创建事件
    aggregate.addDomainEvent(
      new UserRelationshipCreatedEvent(
        id,
        userId,
        targetEntityId,
        relationshipType,
        status,
        tenantId,
        organizationId,
        departmentIds,
      ),
    );

    return aggregate;
  }

  /**
   * 从现有用户关系创建聚合根
   * @description 从现有的用户关系实体创建聚合根
   * @param {UserRelationshipEntity} relationship 用户关系实体
   * @returns {UserRelationshipAggregate} 用户关系聚合根实例
   */
  static fromExisting(
    relationship: UserRelationshipEntity,
  ): UserRelationshipAggregate {
    const aggregate = new UserRelationshipAggregate(relationship.id.toString());
    aggregate._relationship = relationship;
    return aggregate;
  }

  /**
   * 激活关系
   * @description 将用户关系状态设置为激活
   */
  public activate(): void {
    if (!this._relationship) {
      throw new Error('用户关系未初始化');
    }

    const oldStatus = this._relationship.status;
    this._relationship.activate();

    // 应用关系状态更新事件
    this.addDomainEvent(
      new UserRelationshipUpdatedEvent(
        this._relationship.id.toString(),
        'status',
        RelationshipStatus.ACTIVE,
        oldStatus,
      ),
    );
  }

  /**
   * 停用关系
   * @description 将用户关系状态设置为停用
   */
  public deactivate(): void {
    if (!this._relationship) {
      throw new Error('用户关系未初始化');
    }

    const oldStatus = this._relationship.status;
    this._relationship.deactivate();

    // 应用关系状态更新事件
    this.addDomainEvent(
      new UserRelationshipUpdatedEvent(
        this._relationship.id.toString(),
        'status',
        RelationshipStatus.INACTIVE,
        oldStatus,
      ),
    );
  }

  /**
   * 暂停关系
   * @description 将用户关系状态设置为暂停
   */
  public suspend(): void {
    if (!this._relationship) {
      throw new Error('用户关系未初始化');
    }

    const oldStatus = this._relationship.status;
    this._relationship.suspend();

    // 应用关系状态更新事件
    this.addDomainEvent(
      new UserRelationshipUpdatedEvent(
        this._relationship.id.toString(),
        'status',
        RelationshipStatus.SUSPENDED,
        oldStatus,
      ),
    );
  }

  /**
   * 终止关系
   * @description 将用户关系状态设置为终止
   */
  public terminate(): void {
    if (!this._relationship) {
      throw new Error('用户关系未初始化');
    }

    const oldStatus = this._relationship.status;
    this._relationship.terminate();

    // 应用关系状态更新事件
    this.addDomainEvent(
      new UserRelationshipUpdatedEvent(
        this._relationship.id.toString(),
        'status',
        RelationshipStatus.TERMINATED,
        oldStatus,
      ),
    );
  }

  /**
   * 授予权限
   * @description 向用户关系授予指定权限
   * @param {string} permission 权限名称
   */
  public grantPermission(permission: string): void {
    if (!this._relationship) {
      throw new Error('用户关系未初始化');
    }

    const oldPermissions = [...this._relationship.permissions];
    this._relationship.grantPermission(permission);

    // 应用权限授予事件
    this.addDomainEvent(
      new UserRelationshipUpdatedEvent(
        this._relationship.id.toString(),
        'permissions',
        this._relationship.permissions,
        oldPermissions,
      ),
    );
  }

  /**
   * 撤销权限
   * @description 从用户关系撤销指定权限
   * @param {string} permission 权限名称
   */
  public revokePermission(permission: string): void {
    if (!this._relationship) {
      throw new Error('用户关系未初始化');
    }

    const oldPermissions = [...this._relationship.permissions];
    this._relationship.revokePermission(permission);

    // 应用权限撤销事件
    this.addDomainEvent(
      new UserRelationshipUpdatedEvent(
        this._relationship.id.toString(),
        'permissions',
        this._relationship.permissions,
        oldPermissions,
      ),
    );
  }

  /**
   * 设置关系属性
   * @description 设置用户关系的自定义属性
   * @param {string} key 属性键
   * @param {unknown} value 属性值
   */
  public setAttribute(key: string, value: unknown): void {
    if (!this._relationship) {
      throw new Error('用户关系未初始化');
    }

    const oldAttributes = { ...this._relationship.attributes };
    this._relationship.setAttribute(key, value);

    // 应用属性设置事件
    this.addDomainEvent(
      new UserRelationshipUpdatedEvent(
        this._relationship.id.toString(),
        'attributes',
        this._relationship.attributes,
        oldAttributes,
      ),
    );
  }

  /**
   * 移除关系属性
   * @description 移除用户关系的指定属性
   * @param {string} key 属性键
   */
  public removeAttribute(key: string): void {
    if (!this._relationship) {
      throw new Error('用户关系未初始化');
    }

    const oldAttributes = { ...this._relationship.attributes };
    this._relationship.removeAttribute(key);

    // 应用属性移除事件
    this.addDomainEvent(
      new UserRelationshipUpdatedEvent(
        this._relationship.id.toString(),
        'attributes',
        this._relationship.attributes,
        oldAttributes,
      ),
    );
  }

  /**
   * 更新关系类型
   * @description 更新用户关系的类型
   * @param {RelationshipType} newType 新的关系类型
   */
  public updateRelationshipType(newType: RelationshipType): void {
    if (!this._relationship) {
      throw new Error('用户关系未初始化');
    }

    const oldType = this._relationship.relationshipType;
    this._relationship.updateRelationshipType(newType);

    // 应用关系类型更新事件
    this.addDomainEvent(
      new UserRelationshipUpdatedEvent(
        this._relationship.id.toString(),
        'relationshipType',
        newType,
        oldType,
      ),
    );
  }

  /**
   * 批量更新关系
   * @description 批量更新用户关系的多个属性
   * @param {Partial<{
   *   status: RelationshipStatus;
   *   permissions: string[];
   *   attributes: Record<string, unknown>;
   * }>} updates 要更新的属性
   */
  public batchUpdate(
    updates: Partial<{
      status: RelationshipStatus;
      permissions: string[];
      attributes: Record<string, unknown>;
    }>,
  ): void {
    if (!this._relationship) {
      throw new Error('用户关系未初始化');
    }

    const oldValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};

    // 记录旧值并应用更新
    if (updates.status !== undefined) {
      oldValues.status = this._relationship.status;
      this._relationship.updateStatus(updates.status);
      newValues.status = updates.status;
    }

    if (updates.permissions !== undefined) {
      oldValues.permissions = [...this._relationship.permissions];
      // 清除现有权限并重新设置
      this._relationship.clearPermissions();
      updates.permissions.forEach(permission => {
        this._relationship.grantPermission(permission);
      });
      newValues.permissions = updates.permissions;
    }

    if (updates.attributes !== undefined) {
      oldValues.attributes = { ...this._relationship.attributes };
      // 清除现有属性并重新设置
      this._relationship.clearAttributes();
      Object.entries(updates.attributes).forEach(([key, value]) => {
        this._relationship.setAttribute(key, value);
      });
      newValues.attributes = updates.attributes;
    }

    // 应用批量更新事件
    if (Object.keys(newValues).length > 0) {
      this.addDomainEvent(
        new UserRelationshipUpdatedEvent(
          this._relationship.id.toString(),
          'batch',
          newValues,
          oldValues,
        ),
      );
    }
  }

  /**
   * 获取用户关系实体
   * @description 获取聚合根管理的用户关系实体
   * @returns {UserRelationshipEntity} 用户关系实体
   */
  public get relationship(): UserRelationshipEntity {
    if (!this._relationship) {
      throw new Error('用户关系未初始化');
    }
    return this._relationship;
  }

  /**
   * 获取关系ID
   * @description 获取用户关系的唯一标识符
   * @returns {string} 关系ID
   */
  public get id(): string {
    if (!this._relationship) {
      throw new Error('用户关系未初始化');
    }
    return this._relationship.id.toString();
  }

  /**
   * 获取用户ID
   * @description 获取关系所属用户的ID
   * @returns {string} 用户ID
   */
  public get userId(): string {
    if (!this._relationship) {
      throw new Error('用户关系未初始化');
    }
    return this._relationship.userId.toString();
  }

  /**
   * 获取目标实体ID
   * @description 获取关系目标实体的ID
   * @returns {string} 目标实体ID
   */
  public get targetEntityId(): string {
    if (!this._relationship) {
      throw new Error('用户关系未初始化');
    }
    return this._relationship.targetEntityId.toString();
  }

  /**
   * 获取关系类型
   * @description 获取用户关系的类型
   * @returns {RelationshipType} 关系类型
   */
  public get relationshipType(): RelationshipType {
    if (!this._relationship) {
      throw new Error('用户关系未初始化');
    }
    return this._relationship.relationshipType;
  }

  /**
   * 获取关系状态
   * @description 获取用户关系的状态
   * @returns {RelationshipStatus} 关系状态
   */
  public get status(): RelationshipStatus {
    if (!this._relationship) {
      throw new Error('用户关系未初始化');
    }
    return this._relationship.status;
  }

  /**
   * 获取租户ID
   * @description 获取关系所属租户的ID
   * @returns {string | undefined} 租户ID
   */
  public get tenantId(): string | undefined {
    if (!this._relationship) {
      throw new Error('用户关系未初始化');
    }
    return this._relationship.tenantId?.toString();
  }

  /**
   * 获取组织ID
   * @description 获取关系所属组织的ID
   * @returns {string | undefined} 组织ID
   */
  public get organizationId(): string | undefined {
    if (!this._relationship) {
      throw new Error('用户关系未初始化');
    }
    return this._relationship.organizationId?.toString();
  }

  /**
   * 获取部门ID列表
   * @description 获取关系所属部门的ID列表
   * @returns {string[]} 部门ID列表
   */
  public get departmentIds(): string[] {
    if (!this._relationship) {
      throw new Error('用户关系未初始化');
    }
    return this._relationship.departmentIds.map(id => id.toString());
  }
}
