/**
 * @file email-address.vo.ts
 * @description 邮箱地址值对象
 *
 * 该值对象负责封装邮箱地址的业务逻辑，包括：
 * - 邮箱地址格式验证（RFC 5322标准）
 * - 邮箱地址标准化处理
 * - 邮箱地址比较和相等性判断
 *
 * 遵循DDD原则，确保值对象的不可变性和值相等性。
 * 该值对象为共享领域组件，可在所有需要邮箱验证的模块中使用。
 */

import { BaseValueObject } from './base.value-object';

/**
 * @class EmailAddress
 * @description 邮箱地址值对象
 *
 * 主要原理与机制：
 * 1. 不可变性：创建后不能修改
 * 2. 值相等性：通过值判断相等
 * 3. 业务规则封装：邮箱格式验证
 * 4. 类型安全：强类型约束
 * 5. 继承BaseValueObject：获得值对象基础功能
 *
 * 功能与业务规则：
 * 1. 邮箱地址格式验证（RFC 5322标准）
 * 2. 邮箱地址长度限制（最大254字符）
 * 3. 邮箱地址标准化（小写转换）
 * 4. 邮箱地址解析（本地部分和域名部分）
 * 5. 支持国际化邮箱地址
 */
export class EmailAddress extends BaseValueObject {
  private readonly _value: string;

  constructor(value: string) {
    super();
    this.validate(value);
    this._value = value.toLowerCase().trim();
    this.validateInvariants();
  }

  /**
   * @method get value
   * @description 获取邮箱地址值
   * @returns {string} 邮箱地址
   */
  get value(): string {
    return this._value;
  }

  /**
   * @method get domain
   * @description 获取邮箱域名部分
   * @returns {string} 邮箱域名
   */
  get domain(): string {
    return this._value.split('@')[1];
  }

  /**
   * @method get localPart
   * @description 获取邮箱本地部分
   * @returns {string} 邮箱本地部分
   */
  get localPart(): string {
    return this._value.split('@')[0];
  }

  /**
   * @method equals
   * @description 判断两个邮箱地址是否相等
   * @param other 另一个邮箱地址值对象
   * @returns {boolean} 是否相等
   */
  equals(other: unknown): boolean {
    if (!(other instanceof EmailAddress)) return false;
    return this._value === other._value;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 邮箱地址字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * @method toJSON
   * @description 转换为JSON字符串
   * @returns {string} JSON字符串
   */
  toJSON(): string {
    return JSON.stringify(this.toObject());
  }

  /**
   * @method toObject
   * @description 转换为普通对象
   * @returns {Record<string, unknown>} 普通对象
   */
  toObject(): Record<string, unknown> {
    return {
      value: this._value,
      domain: this.domain,
      localPart: this.localPart,
    };
  }

  /**
   * @method fromJSON
   * @description 从JSON字符串创建值对象
   * @param json JSON字符串
   * @returns {this} 邮箱地址值对象
   */
  fromJSON(json: string): this {
    try {
      const data = JSON.parse(json) as { value: string };

      if (typeof data.value !== 'string') {
        throw new Error('Invalid JSON format: value must be a string');
      }

      return new EmailAddress(data.value) as this;
    } catch {
      throw new Error('Failed to parse Email Address from JSON');
    }
  }

  /**
   * @method clone
   * @description 克隆值对象
   * @returns {this} 克隆的邮箱地址值对象
   */
  clone(): this {
    return new EmailAddress(this._value) as this;
  }

  /**
   * @private
   * @method validate
   * @description 验证邮箱地址格式
   * @param value 邮箱地址值
   */
  private validate(value: string): void {
    if (!value) {
      throw new Error('邮箱地址不能为空');
    }

    if (typeof value !== 'string') {
      throw new Error('邮箱地址必须是字符串类型');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new Error('邮箱地址不能为空');
    }

    if (trimmedValue.length > 254) {
      throw new Error('邮箱地址长度不能超过254字符');
    }

    // RFC 5322 邮箱格式验证
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(trimmedValue)) {
      throw new Error('邮箱地址格式无效');
    }

    // 检查域名部分
    const parts = trimmedValue.split('@');
    if (parts.length !== 2) {
      throw new Error('邮箱地址格式无效');
    }

    const [, domain] = parts;
    if (!domain || domain.length === 0) {
      throw new Error('邮箱地址域名部分不能为空');
    }

    if (domain.length > 253) {
      throw new Error('邮箱地址域名部分过长');
    }

    // 检查域名格式
    const domainRegex =
      /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!domainRegex.test(domain)) {
      throw new Error('邮箱地址域名格式无效');
    }
  }

  /**
   * @protected
   * @method validateInvariants
   * @description 验证值对象不变性条件
   */
  protected override validateInvariants(): void {
    if (!this._value || this._value.length === 0) {
      throw new Error('邮箱地址值不能为空');
    }
  }

  /**
   * @static
   * @method create
   * @description 创建邮箱地址值对象
   * @param value 邮箱地址值
   * @returns {EmailAddress} 邮箱地址值对象
   */
  static create(value: string): EmailAddress {
    return new EmailAddress(value);
  }

  /**
   * @static
   * @method isValid
   * @description 验证邮箱地址是否有效
   * @param value 邮箱地址值
   * @returns {boolean} 是否有效
   */
  static isValid(value: string): boolean {
    try {
      new EmailAddress(value);
      return true;
    } catch {
      return false;
    }
  }
}
