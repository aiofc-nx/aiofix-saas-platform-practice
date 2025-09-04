/**
 * @class InvalidUserStatusException
 * @description
 * 无效用户状态异常，表示用户状态变更操作无效。
 *
 * 原理与机制：
 * 1. 作为领域异常，InvalidUserStatusException用于表示用户状态变更无效的业务场景
 * 2. 继承自Error类，提供标准的异常处理机制
 * 3. 包含详细的错误信息和状态数据
 * 4. 支持异常链和堆栈跟踪
 *
 * 功能与职责：
 * 1. 表示用户状态变更无效
 * 2. 提供详细的状态信息
 * 3. 支持异常处理和恢复
 * 4. 便于调试和日志记录
 *
 * @example
 * ```typescript
 * try {
 *   await userService.changeStatus(userId, newStatus);
 * } catch (error) {
 *   if (error instanceof InvalidUserStatusException) {
 *     // 处理无效状态异常
 *   }
 * }
 * ```
 * @since 1.0.0
 */

import { UserStatus } from '../enums/user-status.enum';

/**
 * 无效用户状态异常
 * @description 表示用户状态变更操作无效
 */
export class InvalidUserStatusException extends Error {
  public readonly name = 'InvalidUserStatusException';
  public readonly code = 'INVALID_USER_STATUS';

  constructor(
    message: string,
    public readonly currentStatus?: UserStatus,
    public readonly targetStatus?: UserStatus,
    public readonly userId?: string,
    public readonly reason?: string,
  ) {
    super(message);
    this.message = message;

    // 设置原型链，确保 instanceof 正常工作
    Object.setPrototypeOf(this, InvalidUserStatusException.prototype);
  }

  /**
   * 创建状态转换无效异常
   * @description 根据当前状态和目标状态创建异常
   * @param {UserStatus} currentStatus 当前状态
   * @param {UserStatus} targetStatus 目标状态
   * @param {string} [userId] 用户ID
   * @param {string} [reason] 无效原因
   * @returns {InvalidUserStatusException} 无效用户状态异常实例
   */
  static invalidTransition(
    currentStatus: UserStatus,
    targetStatus: UserStatus,
    userId?: string,
    reason?: string,
  ): InvalidUserStatusException {
    return new InvalidUserStatusException(
      `无法从状态 ${currentStatus} 转换到状态 ${targetStatus}${reason ? `: ${reason}` : ''}`,
      currentStatus,
      targetStatus,
      userId,
      reason,
    );
  }

  /**
   * 创建状态不匹配异常
   * @description 根据期望状态和实际状态创建异常
   * @param {UserStatus} expectedStatus 期望状态
   * @param {UserStatus} actualStatus 实际状态
   * @param {string} [userId] 用户ID
   * @param {string} [reason] 不匹配原因
   * @returns {InvalidUserStatusException} 无效用户状态异常实例
   */
  static statusMismatch(
    expectedStatus: UserStatus,
    actualStatus: UserStatus,
    userId?: string,
    reason?: string,
  ): InvalidUserStatusException {
    return new InvalidUserStatusException(
      `期望状态 ${expectedStatus}，但实际状态为 ${actualStatus}${reason ? `: ${reason}` : ''}`,
      actualStatus,
      expectedStatus,
      userId,
      reason,
    );
  }

  /**
   * 创建状态操作无效异常
   * @description 根据当前状态和操作创建异常
   * @param {UserStatus} currentStatus 当前状态
   * @param {string} operation 操作名称
   * @param {string} [userId] 用户ID
   * @param {string} [reason] 无效原因
   * @returns {InvalidUserStatusException} 无效用户状态异常实例
   */
  static invalidOperation(
    currentStatus: UserStatus,
    operation: string,
    userId?: string,
    reason?: string,
  ): InvalidUserStatusException {
    return new InvalidUserStatusException(
      `在状态 ${currentStatus} 下无法执行操作 ${operation}${reason ? `: ${reason}` : ''}`,
      currentStatus,
      undefined,
      userId,
      reason,
    );
  }

  /**
   * 创建状态值无效异常
   * @description 根据无效状态值创建异常
   * @param {string} invalidStatus 无效状态值
   * @param {string} [userId] 用户ID
   * @param {string} [reason] 无效原因
   * @returns {InvalidUserStatusException} 无效用户状态异常实例
   */
  static invalidStatusValue(
    invalidStatus: string,
    userId?: string,
    reason?: string,
  ): InvalidUserStatusException {
    return new InvalidUserStatusException(
      `无效的状态值: ${invalidStatus}${reason ? `: ${reason}` : ''}`,
      undefined,
      undefined,
      userId,
      reason,
    );
  }

  /**
   * 获取异常摘要
   * @description 返回异常的简要描述
   * @returns {string} 异常摘要
   */
  getSummary(): string {
    return `无效用户状态: ${this.message}`;
  }

  /**
   * 获取异常详情
   * @description 返回异常的详细信息
   * @returns {object} 异常详情
   */
  getDetails(): object {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      currentStatus: this.currentStatus,
      targetStatus: this.targetStatus,
      userId: this.userId,
      reason: this.reason,
      stack: this.stack,
    };
  }

  /**
   * 获取当前状态
   * @description 返回当前状态
   * @returns {UserStatus | undefined} 当前状态
   */
  getCurrentStatus(): UserStatus | undefined {
    return this.currentStatus;
  }

  /**
   * 获取目标状态
   * @description 返回目标状态
   * @returns {UserStatus | undefined} 目标状态
   */
  getTargetStatus(): UserStatus | undefined {
    return this.targetStatus;
  }

  /**
   * 检查是否为状态转换异常
   * @description 检查是否为状态转换无效异常
   * @returns {boolean} 是否为状态转换异常
   */
  isTransitionException(): boolean {
    return this.currentStatus !== undefined && this.targetStatus !== undefined;
  }

  /**
   * 检查是否为状态不匹配异常
   * @description 检查是否为状态不匹配异常
   * @returns {boolean} 是否为状态不匹配异常
   */
  isStatusMismatchException(): boolean {
    return this.currentStatus !== undefined && this.targetStatus !== undefined;
  }

  /**
   * 检查是否为操作无效异常
   * @description 检查是否为操作无效异常
   * @returns {boolean} 是否为操作无效异常
   */
  isOperationException(): boolean {
    return this.currentStatus !== undefined && this.targetStatus === undefined;
  }
}
