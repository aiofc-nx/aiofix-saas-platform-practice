/**
 * @description 无效参数异常
 * @author 江郎
 * @since 2.1.0
 */

import { DomainException } from '@aiofix/shared';

export class InvalidArgumentException extends DomainException {
  constructor(
    message: string,
    public readonly argumentName: string,
    public readonly argumentValue?: unknown,
  ) {
    super(message, 'INVALID_ARGUMENT');
    this.name = 'InvalidArgumentException';
  }
}
