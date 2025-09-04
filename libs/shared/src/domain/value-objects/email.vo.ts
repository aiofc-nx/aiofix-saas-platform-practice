/**
 * @file email.vo.ts
 * @description 邮箱值对象
 *
 * 该文件定义了邮箱值对象，用于表示邮箱地址。
 * 邮箱值对象是不可变的，通过值来定义相等性。
 *
 * 遵循DDD和Clean Architecture原则，提供统一的邮箱地址抽象。
 */

import { BaseValueObject, InvalidValueObjectError } from './base.value-object';

/**
 * @class InvalidEmailError
 * @description 邮箱格式错误
 */
export class InvalidEmailError extends InvalidValueObjectError {
  constructor(message: string, value?: string) {
    super(message, 'Email', value);
    this.name = 'InvalidEmailError';
  }
}

/**
 * @class Email
 * @description 邮箱值对象
 *
 * 表示邮箱地址，具有以下特性：
 * - 不可变性：创建后不能修改
 * - 值相等性：通过值判断相等
 * - 格式验证：确保邮箱格式正确
 * - 类型安全：强类型约束
 */
export class Email extends BaseValueObject {
  private readonly _value: string;

  /**
   * @constructor
   * @description 创建邮箱值对象
   * @param value 邮箱地址字符串
   */
  constructor(value: string) {
    super();
    this.validateEmail(value);
    this._value = value.toLowerCase(); // 标准化为小写
    this.validateInvariants();
  }

  /**
   * @getter value
   * @description 获取邮箱值
   * @returns {string} 邮箱字符串
   */
  get value(): string {
    return this._value;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 邮箱字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * @method equals
   * @description 比较两个邮箱是否相等
   * @param other 另一个邮箱值对象
   * @returns {boolean} 是否相等
   */
  equals(other: unknown): boolean {
    return other instanceof Email && this._value === other._value;
  }

  /**
   * @method toJSON
   * @description 转换为JSON字符串
   * @returns {string} JSON字符串
   */
  toJSON(): string {
    return JSON.stringify({ value: this._value });
  }

  /**
   * @method toObject
   * @description 转换为普通对象
   * @returns {Record<string, unknown>} 普通对象
   */
  toObject(): Record<string, unknown> {
    return { value: this._value };
  }

  /**
   * @method fromJSON
   * @description 从JSON字符串创建邮箱
   * @param json JSON字符串
   * @returns {this} 邮箱值对象
   */
  fromJSON(json: string): this {
    try {
      const data = JSON.parse(json);
      return new Email(data.value) as this;
    } catch {
      throw new InvalidEmailError('Invalid JSON format for Email', json);
    }
  }

  /**
   * @method clone
   * @description 克隆邮箱值对象
   * @returns {this} 克隆的邮箱值对象
   */
  clone(): this {
    return new Email(this._value) as this;
  }

  /**
   * @method getDomain
   * @description 获取邮箱域名部分
   * @returns {string} 域名
   */
  getDomain(): string {
    return this._value.split('@')[1];
  }

  /**
   * @method getLocalPart
   * @description 获取邮箱本地部分
   * @returns {string} 本地部分
   */
  getLocalPart(): string {
    return this._value.split('@')[0];
  }

  /**
   * @method isDisposable
   * @description 判断是否为一次性邮箱
   * @returns {boolean} 是否为一次性邮箱
   */
  isDisposable(): boolean {
    const disposableDomains = [
      '10minutemail.com',
      'guerrillamail.com',
      'mailinator.com',
      'tempmail.org',
      'throwaway.email',
      'yopmail.com',
    ];
    return disposableDomains.includes(this.getDomain());
  }

  /**
   * @method isCorporate
   * @description 判断是否为企业邮箱
   * @returns {boolean} 是否为企业邮箱
   */
  isCorporate(): boolean {
    const personalDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      '163.com',
      'qq.com',
      '126.com',
    ];
    return !personalDomains.includes(this.getDomain());
  }

  /**
   * @private
   * @method validateEmail
   * @description 验证邮箱格式
   * @param value 邮箱字符串
   * @throws {InvalidEmailError} 当邮箱格式无效时抛出错误
   */
  private validateEmail(value: string): void {
    if (!value) {
      throw new InvalidEmailError('Email cannot be empty', value);
    }

    if (typeof value !== 'string') {
      throw new InvalidEmailError('Email must be a string', value);
    }

    if (value.length > 254) {
      throw new InvalidEmailError(
        'Email is too long (max 254 characters)',
        value,
      );
    }

    // 基本的邮箱格式验证
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(value)) {
      throw new InvalidEmailError(`Invalid email format: ${value}`, value);
    }

    // 检查本地部分长度
    const localPart = value.split('@')[0];
    if (localPart.length > 64) {
      throw new InvalidEmailError(
        'Email local part is too long (max 64 characters)',
        value,
      );
    }

    // 检查域名部分长度
    const domainPart = value.split('@')[1];
    if (domainPart.length > 253) {
      throw new InvalidEmailError(
        'Email domain part is too long (max 253 characters)',
        value,
      );
    }
  }

  /**
   * @protected
   * @method validateInvariants
   * @description 验证值对象不变性条件
   */
  protected override validateInvariants(): void {
    if (!this._value || this._value.length === 0) {
      throw new InvalidEmailError('Email value cannot be empty');
    }
  }

  /**
   * @static
   * @method fromString
   * @description 从字符串创建邮箱
   * @param value 邮箱字符串
   * @returns {Email} 邮箱值对象
   */
  static fromString(value: string): Email {
    return new Email(value);
  }

  /**
   * @static
   * @method isValid
   * @description 验证字符串是否为有效的邮箱
   * @param value 待验证的字符串
   * @returns {boolean} 是否为有效的邮箱
   */
  static isValid(value: string): boolean {
    try {
      new Email(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @static
   * @method fromJSON
   * @description 从JSON字符串创建邮箱
   * @param json JSON字符串
   * @returns {Email} 邮箱值对象
   */
  static fromJSON(json: string): Email {
    return new Email('').fromJSON(json);
  }
}
