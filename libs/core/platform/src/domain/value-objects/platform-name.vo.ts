/**
 * @description 平台名称值对象
 * @author 江郎
 * @since 2.1.0
 */

import { BaseValueObject, InvalidValueObjectError } from '@aiofix/shared';

/**
 * @class InvalidPlatformNameError
 * @description 平台名称格式错误
 */
export class InvalidPlatformNameError extends InvalidValueObjectError {
  constructor(message: string, value?: string) {
    super(message, 'PlatformName', value);
    this.name = 'InvalidPlatformNameError';
  }
}

/**
 * @class PlatformName
 * @description 平台名称值对象
 *
 * 功能与职责：
 * 1. 封装平台名称的业务规则和验证逻辑
 * 2. 确保平台名称格式正确
 * 3. 提供类型安全的名称操作
 *
 * @example
 * ```typescript
 * const platformName = new PlatformName('Aiofix SaaS Platform');
 * console.log(platformName.toString()); // 'Aiofix SaaS Platform'
 * ```
 * @since 2.1.0
 */
export class PlatformName extends BaseValueObject {
  private readonly _value: string;

  /**
   * @constructor
   * @description 创建平台名称值对象
   * @param value 平台名称字符串
   */
  constructor(value: string) {
    super();
    this.validatePlatformName(value);
    this._value = value.trim();
  }

  /**
   * 获取平台名称值
   * @returns 平台名称字符串
   */
  get value(): string {
    return this._value;
  }

  /**
   * 获取平台名称的字符串表示
   * @returns 平台名称字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * 比较两个平台名称是否相等
   * @param other 另一个平台名称
   * @returns 是否相等
   */
  equals(other: PlatformName): boolean {
    return this._value === other._value;
  }

  /**
   * 验证平台名称格式
   * @param value 平台名称字符串
   * @throws InvalidPlatformNameError 当名称格式不正确时
   */
  private validatePlatformName(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new InvalidPlatformNameError('平台名称不能为空', value);
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new InvalidPlatformNameError('平台名称不能为空', value);
    }

    if (trimmedValue.length < 2) {
      throw new InvalidPlatformNameError('平台名称至少需要2个字符', value);
    }

    if (trimmedValue.length > 100) {
      throw new InvalidPlatformNameError('平台名称不能超过100个字符', value);
    }

    // 检查是否包含非法字符
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(trimmedValue)) {
      throw new InvalidPlatformNameError(
        '平台名称不能包含以下字符: < > : " / \\ | ? *',
        value,
      );
    }
  }

  /**
   * 创建新的平台名称实例
   * @param value 平台名称值
   * @returns 平台名称实例
   */
  static create(value: string): PlatformName {
    return new PlatformName(value);
  }
}
