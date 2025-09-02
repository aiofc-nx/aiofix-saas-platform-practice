/**
 * @class UserAlreadyExistsException
 * @description
 * 用户已存在异常，表示在系统中已经存在指定的用户。
 *
 * 原理与机制：
 * 1. 作为领域异常，UserAlreadyExistsException用于表示用户创建冲突的业务场景
 * 2. 继承自Error类，提供标准的异常处理机制
 * 3. 包含详细的错误信息和冲突数据
 * 4. 支持异常链和堆栈跟踪
 *
 * 功能与职责：
 * 1. 表示用户创建冲突
 * 2. 提供详细的冲突信息
 * 3. 支持异常处理和恢复
 * 4. 便于调试和日志记录
 *
 * @example
 * ```typescript
 * try {
 *   await userService.createUser(userData);
 * } catch (error) {
 *   if (error instanceof UserAlreadyExistsException) {
 *     // 处理用户已存在异常
 *   }
 * }
 * ```
 * @since 1.0.0
 */

/**
 * 用户已存在异常
 * @description 表示在系统中已经存在指定的用户
 */
export class UserAlreadyExistsException extends Error {
  public readonly name = 'UserAlreadyExistsException';
  public readonly code = 'USER_ALREADY_EXISTS';

  constructor(
    message: string,
    public readonly conflictField?: string,
    public readonly conflictValue?: string,
    public readonly tenantId?: string
  ) {
    super(message);
    this.message = message;
    
    // 设置原型链，确保 instanceof 正常工作
    Object.setPrototypeOf(this, UserAlreadyExistsException.prototype);
  }

  /**
   * 创建用户名冲突异常
   * @description 根据用户名创建异常
   * @param {string} username 用户名
   * @param {string} [tenantId] 租户ID
   * @returns {UserAlreadyExistsException} 用户已存在异常实例
   */
  static byUsername(username: string, tenantId?: string): UserAlreadyExistsException {
    return new UserAlreadyExistsException(
      `用户名 ${username} 已存在${tenantId ? ` (租户: ${tenantId})` : ''}`,
      'username',
      username,
      tenantId
    );
  }

  /**
   * 创建邮箱冲突异常
   * @description 根据邮箱创建异常
   * @param {string} email 邮箱
   * @param {string} [tenantId] 租户ID
   * @returns {UserAlreadyExistsException} 用户已存在异常实例
   */
  static byEmail(email: string, tenantId?: string): UserAlreadyExistsException {
    return new UserAlreadyExistsException(
      `邮箱 ${email} 已存在${tenantId ? ` (租户: ${tenantId})` : ''}`,
      'email',
      email,
      tenantId
    );
  }

  /**
   * 创建手机号冲突异常
   * @description 根据手机号创建异常
   * @param {string} phone 手机号
   * @param {string} [tenantId] 租户ID
   * @returns {UserAlreadyExistsException} 用户已存在异常实例
   */
  static byPhone(phone: string, tenantId?: string): UserAlreadyExistsException {
    return new UserAlreadyExistsException(
      `手机号 ${phone} 已存在${tenantId ? ` (租户: ${tenantId})` : ''}`,
      'phone',
      phone,
      tenantId
    );
  }

  /**
   * 创建用户ID冲突异常
   * @description 根据用户ID创建异常
   * @param {string} userId 用户ID
   * @param {string} [tenantId] 租户ID
   * @returns {UserAlreadyExistsException} 用户已存在异常实例
   */
  static byUserId(userId: string, tenantId?: string): UserAlreadyExistsException {
    return new UserAlreadyExistsException(
      `用户ID ${userId} 已存在${tenantId ? ` (租户: ${tenantId})` : ''}`,
      'userId',
      userId,
      tenantId
    );
  }

  /**
   * 获取异常摘要
   * @description 返回异常的简要描述
   * @returns {string} 异常摘要
   */
  getSummary(): string {
    return `用户已存在: ${this.message}`;
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
      conflictField: this.conflictField,
      conflictValue: this.conflictValue,
      tenantId: this.tenantId,
      stack: this.stack
    };
  }

  /**
   * 获取冲突字段
   * @description 返回冲突的字段名
   * @returns {string | undefined} 冲突字段名
   */
  getConflictField(): string | undefined {
    return this.conflictField;
  }

  /**
   * 获取冲突值
   * @description 返回冲突的字段值
   * @returns {string | undefined} 冲突字段值
   */
  getConflictValue(): string | undefined {
    return this.conflictValue;
  }

  /**
   * 检查是否为特定字段冲突
   * @description 检查是否为指定字段的冲突
   * @param {string} field 字段名
   * @returns {boolean} 是否为指定字段冲突
   */
  isConflictField(field: string): boolean {
    return this.conflictField === field;
  }
}
