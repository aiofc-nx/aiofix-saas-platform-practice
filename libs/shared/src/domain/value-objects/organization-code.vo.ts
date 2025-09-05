/**
 * @file organization-code.vo.ts
 * @description 组织代码值对象
 *
 * 该值对象封装组织代码的业务规则和验证逻辑。
 * 组织代码具有全局唯一性，用于组织的唯一标识。
 *
 * 通用性说明：
 * 1. 跨领域使用：所有需要组织标识的模块都需要
 * 2. 标准化规则：组织代码格式、长度、唯一性等规则相对统一
 * 3. 无业务依赖：不依赖特定业务逻辑，纯粹的数据验证
 * 4. 频繁复用：在多个子领域中被大量使用
 */

import { BaseValueObject, InvalidValueObjectError } from './base.value-object';

/**
 * @class InvalidOrganizationCodeError
 * @description 组织代码格式错误
 */
export class InvalidOrganizationCodeError extends InvalidValueObjectError {
  constructor(message: string, value?: string) {
    super(message, 'OrganizationCode', value);
    this.name = 'InvalidOrganizationCodeError';
  }
}

/**
 * @class OrganizationCode
 * @description 组织代码值对象
 *
 * 表示组织代码，具有以下特性：
 * - 不可变性：创建后不能修改
 * - 值相等性：通过值判断相等
 * - 格式验证：确保代码格式正确
 * - 类型安全：强类型约束
 * - 全局唯一性：在整个系统中唯一
 */
export class OrganizationCode extends BaseValueObject {
  private readonly _value: string;

  /**
   * @constructor
   * @description 创建组织代码值对象
   * @param value 组织代码字符串
   */
  constructor(value: string) {
    super();
    this.validateOrganizationCode(value);
    this._value = value.toUpperCase().trim();
  }

  /**
   * 获取组织代码值
   * @returns 组织代码字符串
   */
  get value(): string {
    return this._value;
  }

  /**
   * 获取组织代码的字符串表示
   * @returns 组织代码字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * 比较两个组织代码是否相等
   * @param other 另一个组织代码
   * @returns 是否相等
   */
  equals(other: unknown): boolean {
    return other instanceof OrganizationCode && this._value === other._value;
  }

  /**
   * 转换为JSON字符串
   * @returns JSON字符串
   */
  toJSON(): string {
    return JSON.stringify({ value: this._value });
  }

  /**
   * 转换为普通对象
   * @returns 普通对象
   */
  toObject(): Record<string, unknown> {
    return { value: this._value };
  }

  /**
   * 从JSON字符串创建值对象
   * @param json JSON字符串
   * @returns 值对象实例
   */
  fromJSON(json: string): this {
    const data = JSON.parse(json);
    return new OrganizationCode(data.value) as this;
  }

  /**
   * 克隆值对象
   * @returns 克隆的值对象
   */
  clone(): this {
    return new OrganizationCode(this._value) as this;
  }

  /**
   * 验证组织代码格式
   * @param value 组织代码字符串
   * @throws InvalidOrganizationCodeError 当代码格式不正确时
   */
  private validateOrganizationCode(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new InvalidOrganizationCodeError('组织代码不能为空', value);
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new InvalidOrganizationCodeError('组织代码不能为空', value);
    }

    if (trimmedValue.length < 3) {
      throw new InvalidOrganizationCodeError('组织代码至少需要3个字符', value);
    }

    if (trimmedValue.length > 20) {
      throw new InvalidOrganizationCodeError('组织代码不能超过20个字符', value);
    }

    // 只允许字母、数字和下划线
    const validPattern = /^[A-Za-z0-9_]+$/;
    if (!validPattern.test(trimmedValue)) {
      throw new InvalidOrganizationCodeError(
        '组织代码只能包含字母、数字和下划线',
        value,
      );
    }

    // 不能以下划线开头或结尾
    if (trimmedValue.startsWith('_') || trimmedValue.endsWith('_')) {
      throw new InvalidOrganizationCodeError(
        '组织代码不能以下划线开头或结尾',
        value,
      );
    }

    // 不能连续使用下划线
    if (trimmedValue.includes('__')) {
      throw new InvalidOrganizationCodeError(
        '组织代码不能包含连续的下划线',
        value,
      );
    }
  }

  /**
   * 创建新的组织代码实例
   * @param value 组织代码值
   * @returns 组织代码实例
   */
  static create(value: string): OrganizationCode {
    return new OrganizationCode(value);
  }
}
