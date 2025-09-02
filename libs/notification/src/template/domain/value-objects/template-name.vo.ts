/**
 * @file template-name.vo.ts
 * @description 模板名称值对象
 *
 * 该值对象负责封装模板名称的业务逻辑，包括：
 * - 模板名称格式验证
 * - 模板名称长度限制
 * - 模板名称唯一性约束
 *
 * 遵循DDD原则，确保值对象的不可变性和值相等性。
 */

/**
 * @class TemplateName
 * @description 模板名称值对象
 *
 * 主要原理与机制：
 * 1. 不可变性：创建后不能修改
 * 2. 值相等性：通过值判断相等
 * 3. 业务规则封装：模板名称格式验证
 * 4. 类型安全：强类型约束
 *
 * 功能与业务规则：
 * 1. 模板名称长度限制（2-100字符）
 * 2. 模板名称格式验证（字母、数字、中文、下划线、连字符）
 * 3. 模板名称标准化处理（去除多余空格）
 * 4. 模板名称唯一性约束（在同一租户内）
 */
export class TemplateName {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = this.normalize(value);
  }

  /**
   * @method get value
   * @description 获取模板名称值
   * @returns {string} 模板名称
   */
  get value(): string {
    return this._value;
  }

  /**
   * @method get length
   * @description 获取模板名称长度
   * @returns {number} 名称长度
   */
  get length(): number {
    return this._value.length;
  }

  /**
   * @method isEmpty
   * @description 判断模板名称是否为空
   * @returns {boolean} 是否为空
   */
  isEmpty(): boolean {
    return this._value.length === 0;
  }

  /**
   * @method equals
   * @description 判断两个模板名称是否相等
   * @param other 另一个模板名称值对象
   * @returns {boolean} 是否相等
   */
  equals(other: TemplateName | null | undefined): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 模板名称字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * @method toSlug
   * @description 转换为URL友好的slug格式
   * @returns {string} slug格式的模板名称
   */
  toSlug(): string {
    return this._value
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * @method toUpperCase
   * @description 转换为大写格式
   * @returns {string} 大写格式的模板名称
   */
  toUpperCase(): string {
    return this._value.toUpperCase();
  }

  /**
   * @method toLowerCase
   * @description 转换为小写格式
   * @returns {string} 小写格式的模板名称
   */
  toLowerCase(): string {
    return this._value.toLowerCase();
  }

  /**
   * @private
   * @method validate
   * @description 验证模板名称格式
   * @param value 模板名称值
   */
  private validate(value: string): void {
    if (!value) {
      throw new Error('模板名称不能为空');
    }

    if (typeof value !== 'string') {
      throw new Error('模板名称必须是字符串类型');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new Error('模板名称不能为空');
    }

    if (trimmedValue.length < 2) {
      throw new Error('模板名称长度不能少于2个字符');
    }

    if (trimmedValue.length > 100) {
      throw new Error('模板名称长度不能超过100个字符');
    }

    // 检查是否包含不允许的字符
    const invalidChars = /[<>"'&]/;
    if (invalidChars.test(trimmedValue)) {
      throw new Error('模板名称包含不允许的字符');
    }

    // 检查是否包含控制字符
    for (let i = 0; i < trimmedValue.length; i++) {
      const charCode = trimmedValue.charCodeAt(i);
      if (
        (charCode >= 0x00 && charCode <= 0x08) ||
        charCode === 0x0b ||
        charCode === 0x0c ||
        (charCode >= 0x0e && charCode <= 0x1f) ||
        charCode === 0x7f
      ) {
        throw new Error('模板名称包含控制字符');
      }
    }

    // 检查是否以数字开头
    if (/^\d/.test(trimmedValue)) {
      throw new Error('模板名称不能以数字开头');
    }

    // 检查是否包含连续的空格
    if (/\s{2,}/.test(trimmedValue)) {
      throw new Error('模板名称不能包含连续的空格');
    }
  }

  /**
   * @private
   * @method normalize
   * @description 标准化模板名称
   * @param value 模板名称值
   * @returns {string} 标准化后的模板名称
   */
  private normalize(value: string): string {
    let normalized = value.trim();

    // 移除多余的空格
    normalized = normalized.replace(/\s+/g, ' ');

    // 移除首尾空格
    normalized = normalized.trim();

    return normalized;
  }

  /**
   * @static
   * @method create
   * @description 创建模板名称值对象
   * @param value 模板名称值
   * @returns {TemplateName} 模板名称值对象
   */
  static create(value: string): TemplateName {
    return new TemplateName(value);
  }

  /**
   * @static
   * @method createFromSlug
   * @description 从slug创建模板名称值对象
   * @param slug slug格式的模板名称
   * @returns {TemplateName} 模板名称值对象
   */
  static createFromSlug(slug: string): TemplateName {
    // 将slug转换为可读的名称
    const name = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return new TemplateName(name);
  }

  /**
   * @static
   * @method isValid
   * @description 验证模板名称是否有效
   * @param value 模板名称值
   * @returns {boolean} 是否有效
   */
  static isValid(value: string): boolean {
    try {
      new TemplateName(value);
      return true;
    } catch {
      return false;
    }
  }
}
