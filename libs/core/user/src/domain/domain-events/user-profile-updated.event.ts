/**
 * @class UserProfileUpdatedEvent
 * @description
 * 用户档案更新领域事件，表示用户档案已发生更新。
 *
 * 原理与机制：
 * 1. 作为领域事件，UserProfileUpdatedEvent记录用户档案更新的重要信息
 * 2. 包含档案更新的字段和值，用于事件溯源和审计
 * 3. 支持数据隔离和隐私级别的传递
 * 4. 可以被其他模块订阅和处理
 *
 * 功能与职责：
 * 1. 记录用户档案更新事件
 * 2. 传递档案更新的关键信息
 * 3. 支持事件溯源和状态重建
 * 4. 触发相关的业务流程
 *
 * @example
 * ```typescript
 * const event = new UserProfileUpdatedEvent(
 *   'user-123',
 *   'profile-456',
 *   ['displayName', 'avatar'],
 *   { displayName: 'John Smith', avatar: 'new-avatar.jpg' },
 *   'tenant-789'
 * );
 * ```
 * @since 1.0.0
 */

import { DomainEvent } from '@aiofix/shared';
import { DataPrivacyLevel, DataIsolationLevel } from '@aiofix/shared';

/**
 * 用户档案更新事件数据接口
 */
export interface UserProfileUpdatedEventData {
  userId: string;
  profileId: string;
  updatedFields: string[];
  newValues: Record<string, unknown>;
  tenantId: string;
  updatedAt: Date;
}

/**
 * 用户档案更新领域事件
 * @description 表示用户档案已发生更新的事件
 */
export class UserProfileUpdatedEvent extends DomainEvent {
  public readonly eventType = 'UserProfileUpdated';
  public readonly eventVersion = '1.0.0';

  constructor(
    public readonly userId: string,
    public readonly profileId: string,
    public readonly updatedFields: string[],
    public readonly newValues: Record<string, unknown>,
    public readonly tenantId: string = '',
    public readonly updatedAt: Date = new Date()
  ) {
    super('UserProfileUpdated', {
      userId,
      profileId,
      updatedFields,
      newValues,
      tenantId,
      updatedAt
    });
  }

  /**
   * 获取事件数据
   * @description 返回事件的完整数据
   * @returns {UserProfileUpdatedEventData} 事件数据
   */
  public getEventData(): UserProfileUpdatedEventData {
    return {
      userId: this.userId,
      profileId: this.profileId,
      updatedFields: this.updatedFields,
      newValues: this.newValues,
      tenantId: this.tenantId,
      updatedAt: this.updatedAt
    };
  }

  /**
   * 获取事件摘要
   * @description 返回事件的简要描述
   * @returns {string} 事件摘要
   */
  public getEventSummary(): string {
    return `User profile ${this.profileId} updated for user ${this.userId}`;
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
   * 检查是否包含敏感字段更新
   * @description 检查档案更新是否包含敏感字段
   * @returns {boolean} 是否包含敏感字段
   */
  public containsSensitiveFields(): boolean {
    const sensitiveFields = ['phone', 'email', 'address', 'idNumber'];
    return this.updatedFields.some(field => sensitiveFields.includes(field));
  }

  /**
   * 获取特定字段的新值
   * @description 获取指定字段的新值
   * @param {string} field 字段名
   * @returns {unknown} 字段值
   */
  public getFieldValue(field: string): unknown {
    return this.newValues[field];
  }

  /**
   * 检查是否更新了特定字段
   * @description 检查是否更新了指定的字段
   * @param {string} field 字段名
   * @returns {boolean} 是否更新了该字段
   */
  public hasFieldUpdated(field: string): boolean {
    return this.updatedFields.includes(field);
  }
}
