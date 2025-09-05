/**
 * @class InvalidArgumentException
 * @description 无效参数异常
 *
 * 当传入的参数无效时抛出此异常。
 *
 * @example
 * ```typescript
 * throw new InvalidArgumentException('部门名称不能为空');
 * ```
 * @since 2.1.0
 */

export class InvalidArgumentException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidArgumentException';
  }
}
