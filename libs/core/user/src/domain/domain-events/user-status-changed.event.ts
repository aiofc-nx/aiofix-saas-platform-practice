/**
 * @class UserStatusChangedEvent
 * @description
 * 用户状态变更领域事件，表示用户状态已发生变更。
 *
 * 原理与机制：
 * 1. 作为领域事件，UserStatusChangedEvent记录用户状态变更的重要信息
 * 2. 包含状态变更前后的值，用于事件溯源和审计
 * 3. 支持数据隔离和隐私级别的传递
 * 4. 可以被其他模块订阅和处理
 *
 * 功能与职责：
 * 1. 记录用户状态变更事件
 * 2. 传递状态变更的关键信息
 * 3. 支持事件溯源和状态重建
 * 4. 触发相关的业务流程
 *
 * @example
 * ```typescript
 * const event = new UserStatusChangedEvent(
 *   'user-123',
 *   'ACTIVE',
 *   'SUSPENDED',
 *   'Account suspended due to policy violation',
 *   'tenant-456'
 * );
 * ```
 * @since 1.0.0
 */

import { DomainEvent } from '@aiofix/shared';
import { UserStatus } from '../enums/user-status.enum';
import { DataPrivacyLevel, DataIsolationLevel } from '@aiofix/shared';

/**
 * 用户状态变更事件数据接口
 */
export interface UserStatusChangedEventData {
  userId: string;
  oldStatus: UserStatus;
  newStatus: UserStatus;
  reason?: string;
  tenantId: string;
  changedAt: Date;
}

/**
 * 用户状态变更领域事件
 * @description 表示用户状态已发生变更的事件
 */
export class UserStatusChangedEvent extends DomainEvent {
  public readonly eventType = 'UserStatusChanged';
  public readonly eventVersion = '1.0.0';

  constructor(
    public readonly userId: string,
    public readonly oldStatus: UserStatus,
    public readonly newStatus: UserStatus,
    public readonly reason?: string,
    public readonly tenantId: string = '',
    public readonly changedAt: Date = new Date()
  ) {
    super('UserStatusChanged', {
      userId,
      oldStatus,
      newStatus,
      reason,
      tenantId,
      changedAt
    });
  }

  /**
   * 获取事件数据
   * @description 返回事件的完整数据
   * @returns {UserStatusChangedEventData} 事件数据
   */
  public getEventData(): UserStatusChangedEventData {
    return {
      userId: this.userId,
      oldStatus: this.oldStatus,
      newStatus: this.newStatus,
      reason: this.reason,
      tenantId: this.tenantId,
      changedAt: this.changedAt
    };
  }

  /**
   * 获取事件摘要
   * @description 返回事件的简要描述
   * @returns {string} 事件摘要
   */
  public getEventSummary(): string {
    return `User ${this.userId} status changed from ${this.oldStatus} to ${this.newStatus}`;
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
   * 检查是否为激活状态变更
   * @description 检查状态变更是否为激活相关的变更
   * @returns {boolean} 是否为激活状态变更
   */
  public isActivationChange(): boolean {
    return this.newStatus === UserStatus.ACTIVE;
  }

  /**
   * 检查是否为停用状态变更
   * @description 检查状态变更是否为停用相关的变更
   * @returns {boolean} 是否为停用状态变更
   */
  public isDeactivationChange(): boolean {
    return this.newStatus === UserStatus.INACTIVE || this.newStatus === UserStatus.SUSPENDED;
  }

  /**
   * 检查是否为删除状态变更
   * @description 检查状态变更是否为删除相关的变更
   * @returns {boolean} 是否为删除状态变更
   */
  public isDeletionChange(): boolean {
    return this.newStatus === UserStatus.DELETED;
  }
}
