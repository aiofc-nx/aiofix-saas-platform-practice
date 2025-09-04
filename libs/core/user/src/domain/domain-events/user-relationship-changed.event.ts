/**
 * @class UserRelationshipChangedEvent
 * @description
 * 用户关系变更领域事件，表示用户关系已发生变更。
 *
 * 原理与机制：
 * 1. 作为领域事件，UserRelationshipChangedEvent记录用户关系变更的重要信息
 * 2. 包含关系变更的类型和状态，用于事件溯源和审计
 * 3. 支持数据隔离和隐私级别的传递
 * 4. 可以被其他模块订阅和处理
 *
 * 功能与职责：
 * 1. 记录用户关系变更事件
 * 2. 传递关系变更的关键信息
 * 3. 支持事件溯源和状态重建
 * 4. 触发相关的业务流程
 *
 * @example
 * ```typescript
 * const event = new UserRelationshipChangedEvent(
 *   'user-123',
 *   'org-456',
 *   'ORGANIZATION',
 *   'MEMBER',
 *   'ACTIVE',
 *   'ACTIVATED',
 *   'tenant-789'
 * );
 * ```
 * @since 1.0.0
 */

import { DomainEvent } from '@aiofix/shared';
import { DataPrivacyLevel, DataIsolationLevel } from '@aiofix/shared';

/**
 * 用户关系变更事件数据接口
 */
export interface UserRelationshipChangedEventData {
  userId: string;
  targetEntityId: string;
  targetEntityType: string;
  relationshipType: string;
  oldStatus: string;
  newStatus: string;
  tenantId: string;
  changedAt: Date;
}

/**
 * 用户关系变更领域事件
 * @description 表示用户关系已发生变更的事件
 */
export class UserRelationshipChangedEvent extends DomainEvent {
  public readonly eventType = 'UserRelationshipChanged';
  public readonly eventVersion = '1.0.0';

  constructor(
    public readonly userId: string,
    public readonly targetEntityId: string,
    public readonly targetEntityType: string,
    public readonly relationshipType: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
    public readonly tenantId: string = '',
    public readonly changedAt: Date = new Date(),
  ) {
    super('UserRelationshipChanged', {
      userId,
      targetEntityId,
      targetEntityType,
      relationshipType,
      oldStatus,
      newStatus,
      tenantId,
      changedAt,
    });
  }

  /**
   * 获取事件数据
   * @description 返回事件的完整数据
   * @returns {UserRelationshipChangedEventData} 事件数据
   */
  public getEventData(): UserRelationshipChangedEventData {
    return {
      userId: this.userId,
      targetEntityId: this.targetEntityId,
      targetEntityType: this.targetEntityType,
      relationshipType: this.relationshipType,
      oldStatus: this.oldStatus,
      newStatus: this.newStatus,
      tenantId: this.tenantId,
      changedAt: this.changedAt,
    };
  }

  /**
   * 获取事件摘要
   * @description 返回事件的简要描述
   * @returns {string} 事件摘要
   */
  public getEventSummary(): string {
    return `User ${this.userId} relationship with ${this.targetEntityType} ${this.targetEntityId} changed from ${this.oldStatus} to ${this.newStatus}`;
  }

  /**
   * 获取数据隔离级别
   * @description 返回事件的数据隔离级别
   * @returns {DataIsolationLevel} 数据隔离级别
   */
  public getDataIsolationLevel(): DataIsolationLevel {
    return DataIsolationLevel.USER;
  }

  /**
   * 获取数据隐私级别
   * @description 返回事件的数据隐私级别
   * @returns {DataPrivacyLevel} 数据隐私级别
   */
  public getDataPrivacyLevel(): DataPrivacyLevel {
    return DataPrivacyLevel.PROTECTED;
  }

  /**
   * 检查是否为关系激活
   * @description 检查关系变更是否为激活
   * @returns {boolean} 是否为关系激活
   */
  public isRelationshipActivated(): boolean {
    return this.newStatus === 'ACTIVE';
  }

  /**
   * 检查是否为关系停用
   * @description 检查关系变更是否为停用
   * @returns {boolean} 是否为关系停用
   */
  public isRelationshipDeactivated(): boolean {
    return this.newStatus === 'INACTIVE' || this.newStatus === 'SUSPENDED';
  }

  /**
   * 检查是否为关系删除
   * @description 检查关系变更是否为删除
   * @returns {boolean} 是否为关系删除
   */
  public isRelationshipDeleted(): boolean {
    return this.newStatus === 'DELETED';
  }

  /**
   * 检查是否为组织关系
   * @description 检查是否为组织相关的关系变更
   * @returns {boolean} 是否为组织关系
   */
  public isOrganizationRelationship(): boolean {
    return this.targetEntityType === 'ORGANIZATION';
  }

  /**
   * 检查是否为部门关系
   * @description 检查是否为部门相关的关系变更
   * @returns {boolean} 是否为部门关系
   */
  public isDepartmentRelationship(): boolean {
    return this.targetEntityType === 'DEPARTMENT';
  }

  /**
   * 检查是否为租户关系
   * @description 检查是否为租户相关的关系变更
   * @returns {boolean} 是否为租户关系
   */
  public isTenantRelationship(): boolean {
    return this.targetEntityType === 'TENANT';
  }
}
