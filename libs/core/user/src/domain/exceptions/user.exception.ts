/**
 * @class UserException
 * @description
 * 用户异常基类，为所有用户相关异常提供统一的基类和错误处理机制。
 *
 * 原理与机制：
 * 1. 继承自标准Error类，提供完整的错误处理能力
 * 2. 支持错误码和错误分类，便于错误处理和国际化
 * 3. 提供统一的错误详情和序列化方法
 *
 * 功能与职责：
 * 1. 作为所有用户相关异常的基类
 * 2. 提供统一的错误码管理
 * 3. 支持错误详情和序列化
 *
 * @example
 * ```typescript
 * // 继承UserException创建自定义异常
 * export class UserNotFoundException extends UserException {
 *   constructor(userId: string) {
 *     super(`用户 ${userId} 不存在`, 'USER_NOT_FOUND');
 *   }
 * }
 * ```
 * @since 1.0.0
 */

export class UserException extends Error {
  /**
   * 错误码
   */
  public readonly errorCode: string;

  /**
   * 构造函数
   * @param message 错误消息
   * @param errorCode 错误码
   */
  constructor(message: string, errorCode: string = 'USER_ERROR') {
    super(message);
    this.errorCode = errorCode;

    // 设置原型链，确保instanceof正常工作
    Object.setPrototypeOf(this, UserException.prototype);

    // 设置错误名称
    this.name = this.constructor.name;
  }

  /**
   * 获取错误详情
   * @returns 错误详情对象
   */
  get details(): Record<string, unknown> {
    return {
      errorCode: this.errorCode,
      message: this.message,
      name: this.name,
    };
  }

  /**
   * 转换为JSON格式
   * @returns JSON字符串
   */
  toJSON(): string {
    return JSON.stringify({
      name: this.name,
      message: this.message,
      errorCode: this.errorCode,
      stack: this.stack,
    });
  }
}
