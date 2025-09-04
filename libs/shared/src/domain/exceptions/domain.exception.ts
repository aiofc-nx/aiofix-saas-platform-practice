/**
 * @description 领域异常基类
 *
 * 领域异常表示业务规则违反或领域错误。
 * 异常应该具有明确的业务含义，便于错误处理。
 *
 * 原理与机制：
 * 1. 领域异常继承自Error类
 * 2. 包含错误代码和状态码
 * 3. 支持错误详情和上下文信息
 * 4. 便于异常处理和日志记录
 *
 * 功能与职责：
 * 1. 业务规则违反表示
 * 2. 错误分类和编码
 * 3. 错误上下文传递
 * 4. 异常处理支持
 */

/**
 * @description 领域异常基类
 */
export class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'DomainException';
  }

  /**
   * @description 获取错误代码
   * @returns 错误代码
   */
  getCode(): string {
    return this.code;
  }

  /**
   * @description 获取状态码
   * @returns 状态码
   */
  getStatusCode(): number {
    return this.statusCode;
  }

  /**
   * @description 获取错误详情
   * @returns 错误详情
   */
  getDetails(): Record<string, unknown> | undefined {
    return this.details;
  }

  /**
   * @description 转换为JSON
   * @returns JSON对象
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      stack: this.stack,
    };
  }
}
