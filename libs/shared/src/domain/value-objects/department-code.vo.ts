/**
 * @file department-code.vo.ts
 * @description 部门代码值对象
 *
 * 该值对象封装部门代码的业务规则和验证逻辑。
 * 部门代码具有全局唯一性，用于部门的唯一标识。
 *
 * 通用性说明：
 * 1. 跨领域使用：所有需要部门标识的模块都需要
 * 2. 标准化规则：部门代码格式、长度、唯一性等规则相对统一
 * 3. 无业务依赖：不依赖特定业务逻辑，纯粹的数据验证
 * 4. 频繁复用：在多个子领域中被大量使用
 */

import { BaseValueObject, InvalidValueObjectError } from './base.value-object';

/**
 * @class InvalidDepartmentCodeError
 * @description 部门代码格式错误
 */
export class InvalidDepartmentCodeError extends InvalidValueObjectError {
  constructor(message: string, value?: string) {
    super(message, 'DepartmentCode', value);
    this.name = 'InvalidDepartmentCodeError';
  }
}

/**
 * @class DepartmentCode
 * @description 部门代码值对象
 *
 * 表示部门代码，具有以下特性：
 * - 不可变性：创建后不能修改
 * - 值相等性：通过值判断相等
 * - 格式验证：确保代码格式正确
 * - 类型安全：强类型约束
 * - 全局唯一性：在整个系统中唯一
 */
export class DepartmentCode extends BaseValueObject {
  private readonly _value: string;

  /**
   * @constructor
   * @description 创建部门代码值对象
   * @param value 部门代码字符串
   */
  constructor(value: string) {
    super();
    this.validateDepartmentCode(value);
    this._value = value.toUpperCase().trim();
  }

  /**
   * 获取部门代码值
   * @returns 部门代码字符串
   */
  get value(): string {
    return this._value;
  }

  /**
   * 获取部门代码的字符串表示
   * @returns 部门代码字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * 比较两个部门代码是否相等
   * @param other 另一个部门代码
   * @returns 是否相等
   */
  equals(other: unknown): boolean {
    return other instanceof DepartmentCode && this._value === other._value;
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
    return new DepartmentCode(data.value) as this;
  }

  /**
   * 克隆值对象
   * @returns 克隆的值对象
   */
  clone(): this {
    return new DepartmentCode(this._value) as this;
  }

  /**
   * 验证部门代码格式
   * @param value 部门代码字符串
   * @throws InvalidDepartmentCodeError 当代码格式不正确时
   */
  private validateDepartmentCode(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new InvalidDepartmentCodeError('部门代码不能为空', value);
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new InvalidDepartmentCodeError('部门代码不能为空', value);
    }

    if (trimmedValue.length < 2) {
      throw new InvalidDepartmentCodeError('部门代码至少需要2个字符', value);
    }

    if (trimmedValue.length > 20) {
      throw new InvalidDepartmentCodeError('部门代码不能超过20个字符', value);
    }

    // 只允许字母、数字和下划线
    const validPattern = /^[A-Za-z0-9_]+$/;
    if (!validPattern.test(trimmedValue)) {
      throw new InvalidDepartmentCodeError(
        '部门代码只能包含字母、数字和下划线',
        value,
      );
    }

    // 不能以下划线开头或结尾
    if (trimmedValue.startsWith('_') || trimmedValue.endsWith('_')) {
      throw new InvalidDepartmentCodeError(
        '部门代码不能以下划线开头或结尾',
        value,
      );
    }

    // 不能连续使用下划线
    if (trimmedValue.includes('__')) {
      throw new InvalidDepartmentCodeError(
        '部门代码不能包含连续的下划线',
        value,
      );
    }
  }

  /**
   * 创建新的部门代码实例
   * @param value 部门代码值
   * @returns 部门代码实例
   */
  static create(value: string): DepartmentCode {
    return new DepartmentCode(value);
  }
}
