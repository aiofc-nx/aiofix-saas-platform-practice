/**
 * @file email-subject.vo.ts
 * @description 邮件主题值对象
 *
 * 该值对象负责封装邮件主题的业务逻辑，包括：
 * - 邮件主题格式验证
 * - 邮件主题长度限制
 * - 邮件主题内容过滤
 *
 * 遵循DDD原则，确保值对象的不可变性和值相等性。
 */

/**
 * @class EmailSubject
 * @description 邮件主题值对象
 *
 * 主要原理与机制：
 * 1. 不可变性：创建后不能修改
 * 2. 值相等性：通过值判断相等
 * 3. 业务规则封装：主题格式验证
 * 4. 类型安全：强类型约束
 *
 * 功能与业务规则：
 * 1. 邮件主题长度限制（最大998字符）
 * 2. 邮件主题格式验证
 * 3. 邮件主题内容过滤（去除危险字符）
 * 4. 邮件主题标准化处理
 */
export class EmailSubject {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = this.normalize(value);
  }

  /**
   * @method get value
   * @description 获取邮件主题值
   * @returns {string} 邮件主题
   */
  get value(): string {
    return this._value;
  }

  /**
   * @method get length
   * @description 获取邮件主题长度
   * @returns {number} 主题长度
   */
  get length(): number {
    return this._value.length;
  }

  /**
   * @method isEmpty
   * @description 判断邮件主题是否为空
   * @returns {boolean} 是否为空
   */
  isEmpty(): boolean {
    return this._value.length === 0;
  }

  /**
   * @method equals
   * @description 判断两个邮件主题是否相等
   * @param other 另一个邮件主题值对象
   * @returns {boolean} 是否相等
   */
  equals(other: EmailSubject | null | undefined): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 邮件主题字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * @private
   * @method validate
   * @description 验证邮件主题格式
   * @param value 邮件主题值
   */
  private validate(value: string): void {
    if (typeof value !== 'string') {
      throw new Error('邮件主题必须是字符串类型');
    }

    if (!value) {
      throw new Error('邮件主题不能为空');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new Error('邮件主题不能为空');
    }

    if (trimmedValue.length > 998) {
      throw new Error('邮件主题长度不能超过998字符');
    }

    // 检查是否包含危险字符
    const dangerousChars = /[<>"'&]/;
    if (dangerousChars.test(trimmedValue)) {
      throw new Error('邮件主题包含不允许的字符');
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
        throw new Error('邮件主题包含控制字符');
      }
    }
  }

  /**
   * @private
   * @method normalize
   * @description 标准化邮件主题
   * @param value 邮件主题值
   * @returns {string} 标准化后的邮件主题
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
   * @description 创建邮件主题值对象
   * @param value 邮件主题值
   * @returns {EmailSubject} 邮件主题值对象
   */
  static create(value: string): EmailSubject {
    return new EmailSubject(value);
  }

  /**
   * @static
   * @method createEmpty
   * @description 创建空邮件主题值对象
   * @returns {EmailSubject} 空邮件主题值对象
   */
  static createEmpty(): EmailSubject {
    return new EmailSubject('无主题');
  }
}
