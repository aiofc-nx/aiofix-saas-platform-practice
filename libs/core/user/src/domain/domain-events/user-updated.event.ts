/**
 * @class UserUpdatedEvent
 * @description
 * 用户更新领域事件，表示用户实体已被更新的事件。
 *
 * 原理与机制：
 * 1. 作为领域事件，UserUpdatedEvent记录用户更新的重要信息
 * 2. 事件是不可变的，一旦创建就不能修改
 * 3. 包含更新前后的关键数据，用于审计和追踪
 * 4. 支持事件溯源和系统解耦
 *
 * 功能与职责：
 * 1. 记录用户更新事件
 * 2. 通知其他系统组件用户状态变更
 * 3. 支持审计和追踪
 * 4. 实现系统解耦
 *
 * @example
 * ```typescript
 * const event = new UserUpdatedEvent(
 *   'user-123',
 *   ['email', 'profile'],
 *   'newemail@example.com'
 * );
 * ```
 * @since 1.0.0
 */

import { DomainEvent } from '@aiofix/shared';
import { UserType } from '../enums/user-type.enum';
import { DataPrivacyLevel } from '@aiofix/shared';

/**
 * 用户更新事件数据接口
 */
export interface UserUpdatedEventData {
  userId: string;
  updatedFields: string[];
  email?: string;
  phone?: string;
  userType?: UserType;
  dataPrivacyLevel?: DataPrivacyLevel;
  organizationId?: string;
  departmentIds?: string[];
  profile?: {
    displayName?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
  };
  updatedAt: Date;
}

/**
 * 用户更新领域事件
 * @description 表示用户实体已被更新的事件
 */
export class UserUpdatedEvent extends DomainEvent {
  public readonly eventType = 'UserUpdated';
  public readonly eventVersion = '1.0.0';
  public readonly aggregateId: string;
  public readonly aggregateType = 'User';
  public readonly version = 1;

  constructor(
    public readonly userId: string,
    public readonly updatedFields: string[],
    public readonly email?: string,
    public readonly phone?: string,
    public readonly userType?: UserType,
    public readonly dataPrivacyLevel?: DataPrivacyLevel,
    public readonly organizationId?: string,
    public readonly departmentIds?: string[],
    public readonly profile?: {
      displayName?: string;
      avatar?: string;
      bio?: string;
      location?: string;
      website?: string;
    },
    public readonly success: boolean = true,
    public readonly errorMessage?: string,
  ) {
    super('UserUpdated', {
      userId,
      updatedFields,
      email,
      phone,
      userType,
      dataPrivacyLevel,
      organizationId,
      departmentIds,
      profile,
      success,
      errorMessage,
      updatedAt: new Date(),
    });
    this.aggregateId = userId;
  }

  /**
   * 获取事件数据
   * @description 返回事件的完整数据
   * @returns {UserUpdatedEventData} 事件数据
   */
  public getEventData(): UserUpdatedEventData {
    return {
      userId: this.userId,
      updatedFields: this.updatedFields,
      email: this.email,
      phone: this.phone,
      userType: this.userType,
      dataPrivacyLevel: this.dataPrivacyLevel,
      organizationId: this.organizationId,
      departmentIds: this.departmentIds,
      profile: this.profile,
      updatedAt: new Date(),
    };
  }

  /**
   * 获取事件摘要
   * @description 返回事件的简要描述
   * @returns {string} 事件摘要
   */
  public getEventSummary(): string {
    const fieldCount = this.updatedFields.length;
    const fieldList = this.updatedFields.join(', ');
    return `User ${this.userId} updated ${fieldCount} field(s): ${fieldList}`;
  }

  /**
   * 检查是否包含特定字段更新
   * @description 检查事件是否包含特定字段的更新
   * @param {string} field 字段名
   * @returns {boolean} 是否包含该字段更新
   */
  public hasFieldUpdate(field: string): boolean {
    return this.updatedFields.includes(field);
  }

  /**
   * 获取更新的字段数量
   * @description 返回更新的字段数量
   * @returns {number} 字段数量
   */
  public getUpdatedFieldCount(): number {
    return this.updatedFields.length;
  }

  /**
   * 检查更新是否成功
   * @description 检查用户更新是否成功
   * @returns {boolean} 是否成功
   */
  public isSuccess(): boolean {
    return this.success;
  }

  /**
   * 获取错误信息
   * @description 返回更新失败时的错误信息
   * @returns {string | undefined} 错误信息
   */
  public getErrorMessage(): string | undefined {
    return this.errorMessage;
  }
}
