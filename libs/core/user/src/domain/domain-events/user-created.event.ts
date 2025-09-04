/**
 * @class UserCreatedEvent
 * @description
 * 用户创建领域事件，表示用户实体已被创建。
 *
 * 原理与机制：
 * 1. 作为领域事件，UserCreatedEvent记录用户创建的重要信息
 * 2. 包含用户创建时的所有关键数据，用于事件溯源和审计
 * 3. 支持数据隔离和隐私级别的传递
 * 4. 可以被其他模块订阅和处理
 *
 * 功能与职责：
 * 1. 记录用户创建事件
 * 2. 传递用户创建的关键信息
 * 3. 支持事件溯源和状态重建
 * 4. 触发相关的业务流程
 *
 * @example
 * ```typescript
 * const event = new UserCreatedEvent(
 *   'user-123',
 *   'john_doe',
 *   'john@example.com',
 *   'tenant-456',
 *   'org-789',
 *   ['dept-1', 'dept-2'],
 *   UserType.TENANT_USER,
 *   DataPrivacyLevel.PROTECTED
 * );
 * ```
 * @since 1.0.0
 */

import { DomainEvent } from '@aiofix/shared';
import { UserType } from '../enums/user-type.enum';
import { DataPrivacyLevel, DataIsolationLevel } from '@aiofix/shared';

/**
 * 用户创建事件数据接口
 */
export interface UserCreatedEventData {
  userId: string;
  username: string;
  email: string;
  tenantId: string;
  organizationId?: string;
  departmentIds: string[];
  userType: UserType;
  dataPrivacyLevel: DataPrivacyLevel;
  createdAt: Date;
}

/**
 * 用户创建领域事件
 * @description 表示用户实体已被创建的事件
 */
export class UserCreatedEvent extends DomainEvent {
  public readonly eventType = 'UserCreated';
  public readonly eventVersion = '1.0.0';
  public readonly aggregateId: string;
  public readonly aggregateType = 'User';
  public readonly version = 1;

  constructor(
    public readonly userId: string,
    public readonly username: string,
    public readonly email: string,
    public readonly tenantId: string,
    public readonly organizationId?: string,
    public readonly departmentIds: string[] = [],
    public readonly userType: UserType = UserType.TENANT_USER,
    public readonly dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
    public readonly createdAt: Date = new Date(),
  ) {
    super('UserCreated', {
      userId,
      username,
      email,
      tenantId,
      organizationId,
      departmentIds,
      userType,
      dataPrivacyLevel,
      createdAt,
    });
    this.aggregateId = userId;
  }

  /**
   * 获取事件数据
   * @description 返回事件的完整数据
   * @returns {UserCreatedEventData} 事件数据
   */
  public getEventData(): UserCreatedEventData {
    return {
      userId: this.userId,
      username: this.username,
      email: this.email,
      tenantId: this.tenantId,
      organizationId: this.organizationId,
      departmentIds: this.departmentIds,
      userType: this.userType,
      dataPrivacyLevel: this.dataPrivacyLevel,
      createdAt: this.createdAt,
    };
  }

  /**
   * 获取事件摘要
   * @description 返回事件的简要描述
   * @returns {string} 事件摘要
   */
  public getEventSummary(): string {
    return `User ${this.username} (${this.userId}) created in tenant ${this.tenantId}`;
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
    return this.dataPrivacyLevel;
  }
}
