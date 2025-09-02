/**
 * @file uuid.vo.ts
 * @description UUID v4值对象
 *
 * 该文件定义了UUID v4值对象，用于表示实体的唯一标识符。
 * UUID v4值对象是不可变的，通过值来定义相等性。
 * 使用RFC 4122标准的UUID v4格式，确保全局唯一性。
 *
 * 遵循DDD和Clean Architecture原则，提供统一的标识符抽象。
 */

import { BaseValueObject, InvalidValueObjectError } from './base.value-object';

/**
 * @class InvalidUuidError
 * @description UUID格式错误
 */
export class InvalidUuidError extends InvalidValueObjectError {
  constructor(message: string, value?: string) {
    super(message, 'Uuid', value);
    this.name = 'InvalidUuidError';
  }
}

/**
 * @class Uuid
 * @description UUID v4值对象
 *
 * 表示实体的唯一标识符，使用RFC 4122标准的UUID v4格式，具有以下特性：
 * - 不可变性：创建后不能修改
 * - 值相等性：通过值判断相等
 * - 唯一性：全局唯一标识（基于随机数生成）
 * - 类型安全：强类型约束
 * - 版本控制：严格遵循UUID v4格式规范
 */
export class Uuid extends BaseValueObject {
  private readonly _value: string;

  /**
   * @constructor
   * @description 创建UUID值对象
   * @param value UUID字符串值
   */
  constructor(value: string) {
    super();
    this.validateUuid(value);
    this._value = value;
    this.validateInvariants();
  }

  /**
   * @getter value
   * @description 获取UUID值
   * @returns {string} UUID字符串
   */
  get value(): string {
    return this._value;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} UUID字符串
   */
  toString(): string {
    return this.value;
  }

  /**
   * @method equals
   * @description 比较两个UUID是否相等
   * @param other 另一个UUID值对象
   * @returns {boolean} 是否相等
   */
  equals(other: unknown): boolean {
    return other instanceof Uuid && this.value === other.value;
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
   * @description 从JSON字符串创建UUID
   * @param json JSON字符串
   * @returns {Uuid} UUID值对象
   */
  fromJSON(json: string): this {
    try {
      const data = JSON.parse(json);
      return new Uuid(data.value) as this;
    } catch {
      throw new InvalidUuidError('Invalid JSON format for UUID', json);
    }
  }

  /**
   * @method clone
   * @description 克隆UUID值对象
   * @returns {Uuid} 克隆的UUID值对象
   */
  clone(): this {
    return new Uuid(this._value) as this;
  }

  /**
   * @private
   * @method validateUuid
   * @description 验证UUID v4格式
   * @param value UUID字符串
   * @throws {InvalidUuidError} 当UUID格式无效时抛出错误
   */
  private validateUuid(value: string): void {
    if (!value) {
      throw new InvalidUuidError('UUID cannot be empty', value);
    }

    if (typeof value !== 'string') {
      throw new InvalidUuidError('UUID must be a string', value);
    }

    // UUID v4格式验证：版本位必须是4，变体位必须是8、9、a或b
    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidV4Regex.test(value)) {
      throw new InvalidUuidError(`Invalid UUID v4 format: ${value}`, value);
    }
  }

  /**
   * @protected
   * @method validateInvariants
   * @description 验证值对象不变性条件
   */
  protected override validateInvariants(): void {
    if (!this._value || this._value.length === 0) {
      throw new InvalidUuidError('UUID value cannot be empty');
    }
  }

  /**
   * @static
   * @method generate
   * @description 生成新的UUID v4
   * @returns {Uuid} 新的UUID v4值对象
   */
  static generate(): Uuid {
    // 使用crypto.randomUUID()生成符合RFC 4122标准的UUID v4
    const uuid = crypto.randomUUID();
    return new Uuid(uuid);
  }

  /**
   * @static
   * @method fromString
   * @description 从字符串创建UUID v4
   * @param value UUID v4字符串
   * @returns {Uuid} UUID v4值对象
   */
  static fromString(value: string): Uuid {
    return new Uuid(value);
  }

  /**
   * @static
   * @method isValid
   * @description 验证字符串是否为有效的UUID v4
   * @param value 待验证的字符串
   * @returns {boolean} 是否为有效的UUID v4
   */
  static isValid(value: string): boolean {
    try {
      new Uuid(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @static
   * @method fromJSON
   * @description 从JSON字符串创建UUID
   * @param json JSON字符串
   * @returns {Uuid} UUID值对象
   */
  static fromJSON(json: string): Uuid {
    return new Uuid('').fromJSON(json);
  }
}
