/**
 * @file money.vo.ts
 * @description 货币值对象
 *
 * 该文件定义了货币值对象，用于表示货币金额。
 * 货币值对象是不可变的，通过值来定义相等性。
 * 支持多种货币类型和精确的金额计算。
 *
 * 遵循DDD和Clean Architecture原则，提供统一的货币抽象。
 */

import { BaseValueObject, InvalidValueObjectError } from './base.value-object';

/**
 * @class InvalidMoneyError
 * @description 货币格式错误
 */
export class InvalidMoneyError extends InvalidValueObjectError {
  constructor(message: string, value?: unknown) {
    super(message, 'Money', value);
    this.name = 'InvalidMoneyError';
  }
}

/**
 * @enum Currency
 * @description 货币类型枚举
 */
export enum Currency {
  CNY = 'CNY', // 人民币
  USD = 'USD', // 美元
  EUR = 'EUR', // 欧元
  GBP = 'GBP', // 英镑
  JPY = 'JPY', // 日元
  KRW = 'KRW', // 韩元
  HKD = 'HKD', // 港币
  SGD = 'SGD', // 新加坡元
}

/**
 * @interface MoneyConfig
 * @description 货币配置接口
 */
export interface MoneyConfig {
  currency: Currency;
  precision?: number; // 小数位数，默认2位
  roundingMode?: 'round' | 'floor' | 'ceil'; // 舍入模式
}

/**
 * @class Money
 * @description 货币值对象
 *
 * 表示货币金额，具有以下特性：
 * - 不可变性：创建后不能修改
 * - 值相等性：通过值判断相等
 * - 精确计算：避免浮点数精度问题
 * - 货币类型：支持多种货币
 * - 类型安全：强类型约束
 */
export class Money extends BaseValueObject {
  private readonly _amount: number; // 以最小单位存储（如分）
  private readonly _currency: Currency;
  private readonly _precision: number;
  private readonly _roundingMode: 'round' | 'floor' | 'ceil';

  /**
   * @constructor
   * @description 创建货币值对象
   * @param amount 金额
   * @param currency 货币类型
   * @param config 配置选项
   */
  constructor(
    amount: number,
    currency: Currency = Currency.CNY,
    config?: Partial<MoneyConfig>
  ) {
    super();
    this._currency = currency;
    this._precision = config?.precision ?? 2;
    this._roundingMode = config?.roundingMode ?? 'round';

    this.validateAmount(amount);
    this._amount = this.normalizeAmount(amount);
    this.validateInvariants();
  }

  /**
   * @getter amount
   * @description 获取金额（以最小单位计）
   * @returns {number} 金额
   */
  get amount(): number {
    return this._amount;
  }

  /**
   * @getter currency
   * @description 获取货币类型
   * @returns {Currency} 货币类型
   */
  get currency(): Currency {
    return this._currency;
  }

  /**
   * @getter precision
   * @description 获取精度
   * @returns {number} 精度
   */
  get precision(): number {
    return this._precision;
  }

  /**
   * @method getValue
   * @description 获取显示值（以元为单位）
   * @returns {number} 显示值
   */
  getValue(): number {
    return this._amount / Math.pow(10, this._precision);
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 货币字符串
   */
  toString(): string {
    const value = this.getValue();
    return `${this._currency} ${value.toFixed(this._precision)}`;
  }

  /**
   * @method equals
   * @description 比较两个货币是否相等
   * @param other 另一个货币值对象
   * @returns {boolean} 是否相等
   */
  equals(other: unknown): boolean {
    return (
      other instanceof Money &&
      this._amount === other._amount &&
      this._currency === other._currency
    );
  }

  /**
   * @method toJSON
   * @description 转换为JSON字符串
   * @returns {string} JSON字符串
   */
  toJSON(): string {
    return JSON.stringify({
      amount: this._amount,
      currency: this._currency,
      precision: this._precision,
      roundingMode: this._roundingMode,
    });
  }

  /**
   * @method toObject
   * @description 转换为普通对象
   * @returns {Record<string, unknown>} 普通对象
   */
  toObject(): Record<string, unknown> {
    return {
      amount: this._amount,
      currency: this._currency,
      precision: this._precision,
      roundingMode: this._roundingMode,
      value: this.getValue(),
    };
  }

  /**
   * @method fromJSON
   * @description 从JSON字符串创建货币
   * @param json JSON字符串
   * @returns {Money} 货币值对象
   */
  fromJSON(json: string): this {
    try {
      const data = JSON.parse(json);
      return new Money(
        data.amount / Math.pow(10, data.precision || 2),
        data.currency,
        {
          precision: data.precision,
          roundingMode: data.roundingMode,
        }
      ) as this;
    } catch {
      throw new InvalidMoneyError('Invalid JSON format for Money', json);
    }
  }

  /**
   * @method clone
   * @description 克隆货币值对象
   * @returns {Money} 克隆的货币值对象
   */
  clone(): this {
    return new Money(this.getValue(), this._currency, {
      precision: this._precision,
      roundingMode: this._roundingMode,
    }) as this;
  }

  /**
   * @method add
   * @description 货币相加
   * @param other 另一个货币值对象
   * @returns {Money} 相加结果
   */
  add(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new InvalidMoneyError(
        `Cannot add different currencies: ${this._currency} and ${other._currency}`
      );
    }
    const newAmount = this._amount + other._amount;
    return new Money(
      newAmount / Math.pow(10, this._precision),
      this._currency,
      {
        precision: this._precision,
        roundingMode: this._roundingMode,
      }
    );
  }

  /**
   * @method subtract
   * @description 货币相减
   * @param other 另一个货币值对象
   * @returns {Money} 相减结果
   */
  subtract(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new InvalidMoneyError(
        `Cannot subtract different currencies: ${this._currency} and ${other._currency}`
      );
    }
    const newAmount = this._amount - other._amount;
    return new Money(
      newAmount / Math.pow(10, this._precision),
      this._currency,
      {
        precision: this._precision,
        roundingMode: this._roundingMode,
      }
    );
  }

  /**
   * @method multiply
   * @description 货币乘以系数
   * @param factor 系数
   * @returns {Money} 相乘结果
   */
  multiply(factor: number): Money {
    const newAmount = this._amount * factor;
    return new Money(
      newAmount / Math.pow(10, this._precision),
      this._currency,
      {
        precision: this._precision,
        roundingMode: this._roundingMode,
      }
    );
  }

  /**
   * @method divide
   * @description 货币除以系数
   * @param factor 系数
   * @returns {Money} 相除结果
   */
  divide(factor: number): Money {
    if (factor === 0) {
      throw new InvalidMoneyError('Cannot divide by zero');
    }
    const newAmount = this._amount / factor;
    return new Money(
      newAmount / Math.pow(10, this._precision),
      this._currency,
      {
        precision: this._precision,
        roundingMode: this._roundingMode,
      }
    );
  }

  /**
   * @method isZero
   * @description 判断是否为零
   * @returns {boolean} 是否为零
   */
  isZero(): boolean {
    return this._amount === 0;
  }

  /**
   * @method isPositive
   * @description 判断是否为正数
   * @returns {boolean} 是否为正数
   */
  isPositive(): boolean {
    return this._amount > 0;
  }

  /**
   * @method isNegative
   * @description 判断是否为负数
   * @returns {boolean} 是否为负数
   */
  isNegative(): boolean {
    return this._amount < 0;
  }

  /**
   * @method compareTo
   * @description 比较两个货币
   * @param other 另一个货币值对象
   * @returns {number} 比较结果（-1, 0, 1）
   */
  compareTo(other: Money): number {
    if (this._currency !== other._currency) {
      throw new InvalidMoneyError(
        `Cannot compare different currencies: ${this._currency} and ${other._currency}`
      );
    }
    if (this._amount < other._amount) return -1;
    if (this._amount > other._amount) return 1;
    return 0;
  }

  /**
   * @method isGreaterThan
   * @description 判断是否大于另一个货币
   * @param other 另一个货币值对象
   * @returns {boolean} 是否大于
   */
  isGreaterThan(other: Money): boolean {
    return this.compareTo(other) > 0;
  }

  /**
   * @method isLessThan
   * @description 判断是否小于另一个货币
   * @param other 另一个货币值对象
   * @returns {boolean} 是否小于
   */
  isLessThan(other: Money): boolean {
    return this.compareTo(other) < 0;
  }

  /**
   * @private
   * @method validateAmount
   * @description 验证金额
   * @param amount 金额
   * @throws {InvalidMoneyError} 当金额无效时抛出错误
   */
  private validateAmount(amount: number): void {
    if (typeof amount !== 'number') {
      throw new InvalidMoneyError('Amount must be a number', amount);
    }

    if (!Number.isFinite(amount)) {
      throw new InvalidMoneyError('Amount must be a finite number', amount);
    }

    if (amount < 0) {
      throw new InvalidMoneyError('Amount cannot be negative', amount);
    }
  }

  /**
   * @private
   * @method normalizeAmount
   * @description 标准化金额（转换为最小单位）
   * @param amount 金额
   * @returns {number} 标准化后的金额
   */
  private normalizeAmount(amount: number): number {
    const multiplier = Math.pow(10, this._precision);
    let normalized = amount * multiplier;

    // 根据舍入模式进行舍入
    switch (this._roundingMode) {
      case 'floor':
        normalized = Math.floor(normalized);
        break;
      case 'ceil':
        normalized = Math.ceil(normalized);
        break;
      case 'round':
      default:
        normalized = Math.round(normalized);
        break;
    }

    return normalized;
  }

  /**
   * @protected
   * @method validateInvariants
   * @description 验证值对象不变性条件
   */
  protected override validateInvariants(): void {
    if (this._amount < 0) {
      throw new InvalidMoneyError('Money amount cannot be negative');
    }
  }

  /**
   * @static
   * @method zero
   * @description 创建零金额
   * @param currency 货币类型
   * @returns {Money} 零金额值对象
   */
  static zero(currency: Currency = Currency.CNY): Money {
    return new Money(0, currency);
  }

  /**
   * @static
   * @method fromString
   * @description 从字符串创建货币
   * @param value 货币字符串（如 "CNY 100.50"）
   * @returns {Money} 货币值对象
   */
  static fromString(value: string): Money {
    const match = value.match(/^([A-Z]{3})\s+([0-9]+\.?[0-9]*)$/);
    if (!match) {
      throw new InvalidMoneyError(`Invalid money format: ${value}`, value);
    }

    const currency = match[1] as Currency;
    const amount = parseFloat(match[2]);

    if (!Object.values(Currency).includes(currency)) {
      throw new InvalidMoneyError(`Unsupported currency: ${currency}`, value);
    }

    return new Money(amount, currency);
  }

  /**
   * @static
   * @method isValid
   * @description 验证是否为有效的货币
   * @param amount 金额
   * @param currency 货币类型
   * @returns {boolean} 是否有效
   */
  static isValid(amount: number, currency: Currency = Currency.CNY): boolean {
    try {
      new Money(amount, currency);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @static
   * @method fromJSON
   * @description 从JSON字符串创建货币
   * @param json JSON字符串
   * @returns {Money} 货币值对象
   */
  static fromJSON(json: string): Money {
    return new Money(0).fromJSON(json);
  }
}
