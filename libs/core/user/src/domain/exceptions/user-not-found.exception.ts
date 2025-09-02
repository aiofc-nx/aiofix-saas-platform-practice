/**
 * @class UserNotFoundException
 * @description
 * 用户未找到异常，表示在系统中找不到指定的用户。
 *
 * 原理与机制：
 * 1. 作为领域异常，UserNotFoundException用于表示用户查找失败的业务场景
 * 2. 继承自Error类，提供标准的异常处理机制
 * 3. 包含详细的错误信息和上下文数据
 * 4. 支持异常链和堆栈跟踪
 *
 * 功能与职责：
 * 1. 表示用户查找失败
 * 2. 提供详细的错误信息
 * 3. 支持异常处理和恢复
 * 4. 便于调试和日志记录
 *
 * @example
 * ```typescript
 * try {
 *   const user = await userRepository.findById(userId);
 *   if (!user) {
 *     throw new UserNotFoundException(`用户 ${userId} 不存在`);
 *   }
 * } catch (error) {
 *   if (error instanceof UserNotFoundException) {
 *     // 处理用户未找到异常
 *   }
 * }
 * ```
 * @since 1.0.0
 */

/**
 * 用户未找到异常
 * @description 表示在系统中找不到指定的用户
 */
export class UserNotFoundException extends Error {
  public readonly name = 'UserNotFoundException';
  public readonly code = 'USER_NOT_FOUND';

  constructor(
    message: string,
    public readonly userId?: string,
    public readonly tenantId?: string
  ) {
    super(message);
    this.message = message;
    
    // 设置原型链，确保 instanceof 正常工作
    Object.setPrototypeOf(this, UserNotFoundException.prototype);
  }

  /**
   * 创建用户未找到异常
   * @description 根据用户ID创建异常
   * @param {string} userId 用户ID
   * @param {string} [tenantId] 租户ID
   * @returns {UserNotFoundException} 用户未找到异常实例
   */
  static byUserId(userId: string, tenantId?: string): UserNotFoundException {
    return new UserNotFoundException(
      `用户 ${userId} 不存在${tenantId ? ` (租户: ${tenantId})` : ''}`,
      userId,
      tenantId
    );
  }

  /**
   * 创建用户未找到异常
   * @description 根据用户名创建异常
   * @param {string} username 用户名
   * @param {string} [tenantId] 租户ID
   * @returns {UserNotFoundException} 用户未找到异常实例
   */
  static byUsername(username: string, tenantId?: string): UserNotFoundException {
    return new UserNotFoundException(
      `用户名 ${username} 不存在${tenantId ? ` (租户: ${tenantId})` : ''}`,
      undefined,
      tenantId
    );
  }

  /**
   * 创建用户未找到异常
   * @description 根据邮箱创建异常
   * @param {string} email 邮箱
   * @param {string} [tenantId] 租户ID
   * @returns {UserNotFoundException} 用户未找到异常实例
   */
  static byEmail(email: string, tenantId?: string): UserNotFoundException {
    return new UserNotFoundException(
      `邮箱 ${email} 对应的用户不存在${tenantId ? ` (租户: ${tenantId})` : ''}`,
      undefined,
      tenantId
    );
  }

  /**
   * 获取异常摘要
   * @description 返回异常的简要描述
   * @returns {string} 异常摘要
   */
  getSummary(): string {
    return `用户未找到: ${this.message}`;
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
      userId: this.userId,
      tenantId: this.tenantId,
      stack: this.stack
    };
  }
}
