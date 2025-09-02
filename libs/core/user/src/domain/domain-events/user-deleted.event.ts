/**
 * @class UserDeletedEvent
 * @description
 * 用户删除领域事件，表示用户实体已被删除的事件。
 *
 * 原理与机制：
 * 1. 作为领域事件，UserDeletedEvent记录用户删除的重要信息
 * 2. 事件是不可变的，一旦创建就不能修改
 * 3. 包含删除的关键数据，用于审计和追踪
 * 4. 支持事件溯源和系统解耦
 *
 * 功能与职责：
 * 1. 记录用户删除事件
 * 2. 通知其他系统组件用户状态变更
 * 3. 支持审计和追踪
 * 4. 实现系统解耦
 *
 * @example
 * ```typescript
 * const event = new UserDeletedEvent(
 *   'user-123',
 *   true,
 *   '用户主动注销'
 * );
 * ```
 * @since 1.0.0
 */

import { DomainEvent } from '@aiofix/shared';

/**
 * 用户删除事件数据接口
 */
export interface UserDeletedEventData {
  userId: string;
  softDelete: boolean;
  reason?: string;
  deletedBy?: string;
  cascadeDelete: boolean;
  deletedAt: Date;
}

/**
 * 用户删除领域事件
 * @description 表示用户实体已被删除的事件
 */
export class UserDeletedEvent extends DomainEvent {
  public readonly eventType = 'UserDeleted';
  public readonly eventVersion = '1.0.0';
  public readonly aggregateId: string;
  public readonly aggregateType = 'User';
  public readonly version = 1;

  constructor(
    public readonly userId: string,
    public readonly softDelete: boolean,
    public readonly reason?: string,
    public readonly deletedBy?: string,
    public readonly cascadeDelete: boolean = false,
    public readonly success: boolean = true,
    public readonly errorMessage?: string
  ) {
    super('UserDeleted', {
      userId,
      softDelete,
      reason,
      deletedBy,
      cascadeDelete,
      success,
      errorMessage,
      deletedAt: new Date()
    });
    this.aggregateId = userId;
  }

  /**
   * 获取事件数据
   * @description 返回事件的完整数据
   * @returns {UserDeletedEventData} 事件数据
   */
  public getEventData(): UserDeletedEventData {
    return {
      userId: this.userId,
      softDelete: this.softDelete,
      reason: this.reason,
      deletedBy: this.deletedBy,
      cascadeDelete: this.cascadeDelete,
      deletedAt: new Date()
    };
  }

  /**
   * 获取事件摘要
   * @description 返回事件的简要描述
   * @returns {string} 事件摘要
   */
  public getEventSummary(): string {
    const deleteType = this.softDelete ? '软删除' : '硬删除';
    const reasonText = this.reason ? `，原因: ${this.reason}` : '';
    const cascadeText = this.cascadeDelete ? '，启用级联删除' : '';
    return `User ${this.userId} ${deleteType}${reasonText}${cascadeText}`;
  }

  /**
   * 检查是否为软删除
   * @description 检查是否使用软删除方式
   * @returns {boolean} 是否为软删除
   */
  public isSoftDelete(): boolean {
    return this.softDelete;
  }

  /**
   * 检查是否为硬删除
   * @description 检查是否使用硬删除方式
   * @returns {boolean} 是否为硬删除
   */
  public isHardDelete(): boolean {
    return !this.softDelete;
  }

  /**
   * 检查是否级联删除
   * @description 检查是否级联删除相关数据
   * @returns {boolean} 是否级联删除
   */
  public isCascadeDelete(): boolean {
    return this.cascadeDelete;
  }

  /**
   * 获取删除类型描述
   * @description 返回删除类型的描述
   * @returns {string} 删除类型描述
   */
  public getDeleteTypeDescription(): string {
    if (this.softDelete) {
      return '软删除 - 标记为已删除，保留数据';
    } else {
      return '硬删除 - 物理删除数据';
    }
  }

  /**
   * 检查删除是否成功
   * @description 检查用户删除是否成功
   * @returns {boolean} 是否成功
   */
  public isSuccess(): boolean {
    return this.success;
  }

  /**
   * 获取错误信息
   * @description 返回删除失败时的错误信息
   * @returns {string | undefined} 错误信息
   */
  public getErrorMessage(): string | undefined {
    return this.errorMessage;
  }
}
