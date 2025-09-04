/**
 * @class UserNotFoundException
 * @description
 * 用户未找到异常，当尝试获取不存在的用户时抛出此异常。
 *
 * 原理与机制：
 * 1. 继承自UserException基类，提供统一的异常处理机制
 * 2. 包含具体的用户ID信息，便于调试和错误追踪
 * 3. 支持国际化错误消息和多语言支持
 *
 * 功能与职责：
 * 1. 标识用户不存在的业务错误
 * 2. 提供详细的错误信息和上下文
 * 3. 支持错误分类和错误码
 *
 * @example
 * ```typescript
 * // 在业务逻辑中抛出异常
 * const user = await userRepository.findById(userId);
 * if (!user) {
 *   throw new UserNotFoundException(userId);
 * }
 *
 * // 在异常处理器中捕获
 * try {
 *   await getUserUseCase.execute(request);
 * } catch (error) {
 *   if (error instanceof UserNotFoundException) {
 *     // 处理用户不存在错误
 *     console.log(`用户 ${error.userId} 不存在`);
 *   }
 * }
 * ```
 * @since 1.0.0
 */

import { UserException } from './user.exception';

/**
 * 用户未找到异常
 */
export class UserNotFoundException extends UserException {
  /**
   * 不存在的用户ID
   */
  public readonly userId: string;

  /**
   * 构造函数
   * @param userId 不存在的用户ID
   * @param message 错误消息
   * @param errorCode 错误码
   */
  constructor(
    userId: string,
    message?: string,
    errorCode: string = 'USER_NOT_FOUND',
  ) {
    const defaultMessage = `用户 '${userId}' 不存在`;
    super(message ?? defaultMessage, errorCode);
    this.userId = userId;
  }

  /**
   * 获取异常名称
   * @returns 异常类名
   */
  get name(): string {
    return 'UserNotFoundException';
  }

  /**
   * 获取错误详情
   * @returns 错误详情对象
   */
  get details(): Record<string, unknown> {
    return {
      userId: this.userId,
      errorCode: 'USER_NOT_FOUND',
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
      errorCode: 'USER_NOT_FOUND',
      userId: this.userId,
      stack: this.stack,
    });
  }
}
