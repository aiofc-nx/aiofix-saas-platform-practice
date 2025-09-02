/**
 * @class BaseValueObject
 * @description 抽象值对象基类，强制实现相等性比较和不可变性
 * @rule 所有属性必须为只读
 * @example
 * class Email extends BaseValueObject {
 *   constructor(public readonly value: string) {
 *     super();
 *     this.validateFormat(value);
 *   }
 *   private validateFormat(email: string): void {
 *     if (!/^\S+@\S+\.\S+$/.test(email)) {
 *       throw new InvalidValueObjectError('Email');
 *     }
 *   }
 *   equals(other: unknown): boolean {
 *     return other instanceof Email && this.value === other.value;
 *   }
 * }
 */

/**
 * @class InvalidValueObjectError
 * @description 值对象验证错误
 */
export class InvalidValueObjectError extends Error {
  constructor(
    message: string,
    public readonly valueObjectType: string,
    public readonly value?: unknown
  ) {
    super(message);
    this.name = 'InvalidValueObjectError';
  }
}

/**
 * @interface ValueObjectSerializable
 * @description 值对象序列化接口
 */
export interface ValueObjectSerializable {
  toJSON(): string;
  toObject(): Record<string, unknown>;
  fromJSON(json: string): this;
}

/**
 * @abstract
 * @class BaseValueObject
 * @description 抽象值对象基类
 */
export abstract class BaseValueObject implements ValueObjectSerializable {
  /**
   * @method equals
   * @description 值对象相等性比较必须实现此方法
   * @param other 对比对象
   * @returns 是否逻辑相等
   */
  public abstract equals(other: unknown): boolean;

  /**
   * @method validateInvariants
   * @description 验证值对象不变性条件
   * @throws {InvalidValueObjectError} 当违反业务规则时抛出
   */
  protected validateInvariants(): void {
    // 子类可以重写此方法来实现具体的不变性验证
  }

  /**
   * @method toJSON
   * @description 转换为JSON字符串
   * @returns {string} JSON字符串
   */
  public abstract toJSON(): string;

  /**
   * @method toObject
   * @description 转换为普通对象
   * @returns {Record<string, unknown>} 普通对象
   */
  public abstract toObject(): Record<string, unknown>;

  /**
   * @method fromJSON
   * @description 从JSON字符串创建值对象
   * @param json JSON字符串
   * @returns {this} 值对象实例
   */
  public abstract fromJSON(json: string): this;

  /**
   * @method toString
   * @description 转换为字符串表示
   * @returns {string} 字符串表示
   */
  public abstract toString(): string;

  /**
   * @method clone
   * @description 克隆值对象
   * @returns {this} 克隆的值对象
   */
  public abstract clone(): this;
}
