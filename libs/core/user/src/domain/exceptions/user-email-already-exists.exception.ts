/**
 * @class UserEmailAlreadyExistsException
 * @description
 * 用户邮箱已存在异常，当尝试创建或更新用户时，如果邮箱已被其他用户使用则抛出此异常。
 *
 * 原理与机制：
 * 1. 继承自UserException基类，提供统一的异常处理机制
 * 2. 包含具体的邮箱信息，便于调试和错误追踪
 * 3. 支持国际化错误消息和多语言支持
 *
 * 功能与职责：
 * 1. 标识用户邮箱重复的业务错误
 * 2. 提供详细的错误信息和上下文
 * 3. 支持错误分类和错误码
 *
 * @example
 * ```typescript
 * // 在业务逻辑中抛出异常
 * if (await userRepository.existsByEmail(email)) {
 *   throw new UserEmailAlreadyExistsException(email);
 * }
 *
 * // 在异常处理器中捕获
 * try {
 *   await createUserUseCase.execute(request);
 * } catch (error) {
 *   if (error instanceof UserEmailAlreadyExistsException) {
 *     // 处理邮箱重复错误
 *     console.log(`邮箱 ${error.email} 已被使用`);
 *   }
 * }
 * ```
 * @since 1.0.0
 */

import { UserException } from './user.exception';

/**
 * 用户邮箱已存在异常
 */
export class UserEmailAlreadyExistsException extends UserException {
  /**
   * 重复的邮箱地址
   */
  public readonly email: string;

  /**
   * 构造函数
   * @param email 重复的邮箱地址
   * @param message 错误消息
   * @param errorCode 错误码
   */
  constructor(
    email: string,
    message?: string,
    errorCode: string = 'USER_EMAIL_ALREADY_EXISTS',
  ) {
    const defaultMessage = `邮箱地址 '${email}' 已被其他用户使用`;
    super(message ?? defaultMessage, errorCode);
    this.email = email;
  }

  /**
   * 获取异常名称
   * @returns 异常类名
   */
  get name(): string {
    return 'UserEmailAlreadyExistsException';
  }

  /**
   * 获取错误详情
   * @returns 错误详情对象
   */
  get details(): Record<string, unknown> {
    return {
      email: this.email,
      errorCode: 'USER_EMAIL_ALREADY_EXISTS',
      message: this.message,
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
      errorCode: 'USER_EMAIL_ALREADY_EXISTS',
      email: this.email,
      stack: this.stack,
    });
  }
}
