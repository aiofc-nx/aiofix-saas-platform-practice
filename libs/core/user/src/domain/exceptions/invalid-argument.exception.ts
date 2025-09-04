/**
 * @class InvalidArgumentException
 * @description
 * 无效参数异常，当传入的参数不符合业务规则或验证要求时抛出此异常。
 *
 * 原理与机制：
 * 1. 继承自UserException基类，提供统一的异常处理机制
 * 2. 包含具体的参数信息和验证规则，便于调试和错误追踪
 * 3. 支持参数名和参数值的详细信息
 *
 * 功能与职责：
 * 1. 标识参数验证失败的业务错误
 * 2. 提供详细的错误信息和上下文
 * 3. 支持错误分类和错误码
 *
 * @example
 * ```typescript
 * // 在业务逻辑中抛出异常
 * if (!username || username.trim().length === 0) {
 *   throw new InvalidArgumentException('用户名不能为空', 'username');
 * }
 *
 * if (password.length < 6) {
 *   throw new InvalidArgumentException('密码长度不能少于6位', 'password', password.length);
 * }
 *
 * // 在异常处理器中捕获
 * try {
 *   await createUserUseCase.execute(request);
 * } catch (error) {
 *   if (error instanceof InvalidArgumentException) {
 *     // 处理参数验证错误
 *     console.log(`参数 ${error.parameterName} 验证失败: ${error.message}`);
 *   }
 *   }
 * }
 * ```
 * @since 1.0.0
 */

import { UserException } from './user.exception';

/**
 * 无效参数异常
 */
export class InvalidArgumentException extends UserException {
  /**
   * 参数名称
   */
  public readonly parameterName?: string;

  /**
   * 参数值
   */
  public readonly parameterValue?: unknown;

  /**
   * 构造函数
   * @param message 错误消息
   * @param parameterName 参数名称
   * @param parameterValue 参数值
   * @param errorCode 错误码
   */
  constructor(
    message: string,
    parameterName?: string,
    parameterValue?: unknown,
    errorCode: string = 'INVALID_ARGUMENT',
  ) {
    super(message, errorCode);
    this.parameterName = parameterName;
    this.parameterValue = parameterValue;
  }

  /**
   * 获取异常名称
   * @returns 异常类名
   */
  get name(): string {
    return 'InvalidArgumentException';
  }

  /**
   * 获取错误详情
   * @returns 错误详情对象
   */
  get details(): Record<string, unknown> {
    return {
      parameterName: this.parameterName,
      parameterValue: this.parameterValue,
      errorCode: this.errorCode,
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
      errorCode: 'INVALID_ARGUMENT',
      parameterName: this.parameterName,
      parameterValue: this.parameterValue,
      stack: this.stack,
    });
  }
}
