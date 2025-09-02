/**
 * @file date-range.vo.ts
 * @description 日期范围值对象
 *
 * 该文件定义了日期范围值对象，用于表示时间区间。
 * 日期范围值对象是不可变的，通过值来定义相等性。
 * 支持日期范围的计算、比较和验证。
 *
 * 遵循DDD和Clean Architecture原则，提供统一的日期范围抽象。
 */

import { BaseValueObject, InvalidValueObjectError } from './base.value-object';

/**
 * @class InvalidDateRangeError
 * @description 日期范围格式错误
 */
export class InvalidDateRangeError extends InvalidValueObjectError {
  constructor(message: string, value?: unknown) {
    super(message, 'DateRange', value);
    this.name = 'InvalidDateRangeError';
  }
}

/**
 * @enum DateRangeUnit
 * @description 日期范围单位枚举
 */
export enum DateRangeUnit {
  DAY = 'day',
  DAYS = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  YEARS = 'year',
}

/**
 * @interface DateRangeConfig
 * @description 日期范围配置接口
 */
export interface DateRangeConfig {
  includeStart?: boolean; // 是否包含开始日期
  includeEnd?: boolean; // 是否包含结束日期
  timezone?: string; // 时区
}

/**
 * @class DateRange
 * @description 日期范围值对象
 *
 * 表示日期范围，具有以下特性：
 * - 不可变性：创建后不能修改
 * - 值相等性：通过值判断相等
 * - 日期验证：确保开始日期不晚于结束日期
 * - 时区支持：支持不同时区的日期处理
 * - 类型安全：强类型约束
 */
export class DateRange extends BaseValueObject {
  private readonly _startDate: Date;
  private readonly _endDate: Date;
  private readonly _includeStart: boolean;
  private readonly _includeEnd: boolean;
  private readonly _timezone: string;

  /**
   * @constructor
   * @description 创建日期范围值对象
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param config 配置选项
   */
  constructor(
    startDate: Date | string,
    endDate: Date | string,
    config?: Partial<DateRangeConfig>
  ) {
    super();
    this._includeStart = config?.includeStart ?? true;
    this._includeEnd = config?.includeEnd ?? true;
    this._timezone = config?.timezone ?? 'UTC';

    this._startDate = this.normalizeDate(startDate);
    this._endDate = this.normalizeDate(endDate);

    this.validateDateRange();
    this.validateInvariants();
  }

  /**
   * @getter startDate
   * @description 获取开始日期
   * @returns {Date} 开始日期
   */
  get startDate(): Date {
    return new Date(this._startDate);
  }

  /**
   * @getter endDate
   * @description 获取结束日期
   * @returns {Date} 结束日期
   */
  get endDate(): Date {
    return new Date(this._endDate);
  }

  /**
   * @getter includeStart
   * @description 获取是否包含开始日期
   * @returns {boolean} 是否包含开始日期
   */
  get includeStart(): boolean {
    return this._includeStart;
  }

  /**
   * @getter includeEnd
   * @description 获取是否包含结束日期
   * @returns {boolean} 是否包含结束日期
   */
  get includeEnd(): boolean {
    return this._includeEnd;
  }

  /**
   * @getter timezone
   * @description 获取时区
   * @returns {string} 时区
   */
  get timezone(): string {
    return this._timezone;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 日期范围字符串
   */
  toString(): string {
    const startStr = this._startDate.toISOString().split('T')[0];
    const endStr = this._endDate.toISOString().split('T')[0];
    return `${startStr} to ${endStr}`;
  }

  /**
   * @method equals
   * @description 比较两个日期范围是否相等
   * @param other 另一个日期范围值对象
   * @returns {boolean} 是否相等
   */
  equals(other: unknown): boolean {
    return (
      other instanceof DateRange &&
      this._startDate.getTime() === other._startDate.getTime() &&
      this._endDate.getTime() === other._endDate.getTime() &&
      this._includeStart === other._includeStart &&
      this._includeEnd === other._includeEnd &&
      this._timezone === other._timezone
    );
  }

  /**
   * @method toJSON
   * @description 转换为JSON字符串
   * @returns {string} JSON字符串
   */
  toJSON(): string {
    return JSON.stringify({
      startDate: this._startDate.toISOString(),
      endDate: this._endDate.toISOString(),
      includeStart: this._includeStart,
      includeEnd: this._includeEnd,
      timezone: this._timezone,
    });
  }

  /**
   * @method toObject
   * @description 转换为普通对象
   * @returns {Record<string, unknown>} 普通对象
   */
  toObject(): Record<string, unknown> {
    return {
      startDate: this._startDate.toISOString(),
      endDate: this._endDate.toISOString(),
      includeStart: this._includeStart,
      includeEnd: this._includeEnd,
      timezone: this._timezone,
      durationInDays: this.getDurationInDays(),
      durationInWeeks: this.getDurationInWeeks(),
      durationInMonths: this.getDurationInMonths(),
      durationInYears: this.getDurationInYears(),
    };
  }

  /**
   * @method getDuration
   * @description 获取持续时间（毫秒）
   * @returns {number}
   */
  getDuration(): number {
    return this._endDate.getTime() - this._startDate.getTime();
  }

  /**
   * @method fromJSON
   * @description 从JSON字符串创建日期范围
   * @param json JSON字符串
   * @returns {this} 日期范围值对象
   */
  fromJSON(json: string): this {
    try {
      const data = JSON.parse(json);
      return new DateRange(data.startDate, data.endDate, {
        includeStart: data.includeStart,
        includeEnd: data.includeEnd,
        timezone: data.timezone,
      }) as this;
    } catch {
      throw new InvalidDateRangeError(
        'Invalid JSON format for DateRange',
        json
      );
    }
  }

  /**
   * @method clone
   * @description 克隆日期范围值对象
   * @returns {this} 克隆的日期范围值对象
   */
  clone(): this {
    return new DateRange(this._startDate, this._endDate, {
      includeStart: this._includeStart,
      includeEnd: this._includeEnd,
      timezone: this._timezone,
    }) as this;
  }

  /**
   * @method contains
   * @description 判断是否包含指定日期
   * @param date 指定日期
   * @returns {boolean} 是否包含
   */
  contains(date: Date): boolean {
    const targetDate = this.normalizeDate(date);

    if (this._includeStart && this._includeEnd) {
      return targetDate >= this._startDate && targetDate <= this._endDate;
    } else if (this._includeStart && !this._includeEnd) {
      return targetDate >= this._startDate && targetDate < this._endDate;
    } else if (!this._includeStart && this._includeEnd) {
      return targetDate > this._startDate && targetDate <= this._endDate;
    } else {
      return targetDate > this._startDate && targetDate < this._endDate;
    }
  }

  /**
   * @method overlaps
   * @description 判断是否与另一个日期范围重叠
   * @param other 另一个日期范围
   * @returns {boolean} 是否重叠
   */
  overlaps(other: DateRange): boolean {
    return (
      this._startDate <= other._endDate && this._endDate >= other._startDate
    );
  }

  /**
   * @method getOverlap
   * @description 获取与另一个日期范围的重叠部分
   * @param other 另一个日期范围
   * @returns {DateRange|null} 重叠的日期范围，如果没有重叠则返回null
   */
  getOverlap(other: DateRange): DateRange | null {
    if (!this.overlaps(other)) {
      return null;
    }

    const overlapStart =
      this._startDate > other._startDate ? this._startDate : other._startDate;
    const overlapEnd =
      this._endDate < other._endDate ? this._endDate : other._endDate;

    return new DateRange(overlapStart, overlapEnd, {
      includeStart: this._includeStart,
      includeEnd: this._includeEnd,
      timezone: this._timezone,
    });
  }

  /**
   * @method intersection
   * @description 与另一个日期范围的交集（别名）
   */
  intersection(other: DateRange): DateRange | null {
    return this.getOverlap(other);
  }

  /**
   * @method union
   * @description 与另一个日期范围的并集（若不相交且不相邻则抛错）
   * @throws {InvalidDateRangeError}
   */
  union(other: DateRange): DateRange {
    const overlap = this.getOverlap(other);
    const adjacent =
      this._endDate.getTime() === other._startDate.getTime() ||
      other._endDate.getTime() === this._startDate.getTime();

    if (!overlap && !adjacent) {
      throw new InvalidDateRangeError('Date ranges are not mergeable');
    }

    const start = this._startDate < other._startDate ? this._startDate : other._startDate;
    const end = this._endDate > other._endDate ? this._endDate : other._endDate;

    return new DateRange(start, end, {
      includeStart: this._includeStart,
      includeEnd: this._includeEnd,
      timezone: this._timezone,
    });
  }

  /**
   * @method getDurationInDays
   * @description 获取持续天数
   * @returns {number} 持续天数
   */
  getDurationInDays(): number {
    const diffTime = this._endDate.getTime() - this._startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * @method getDurationInWeeks
   * @description 获取持续周数
   * @returns {number} 持续周数
   */
  getDurationInWeeks(): number {
    return Math.ceil(this.getDurationInDays() / 7);
  }

  /**
   * @method getDurationInMonths
   * @description 获取持续月数
   * @returns {number} 持续月数
   */
  getDurationInMonths(): number {
    const yearDiff =
      this._endDate.getFullYear() - this._startDate.getFullYear();
    const monthDiff = this._endDate.getMonth() - this._startDate.getMonth();
    return yearDiff * 12 + monthDiff;
  }

  /**
   * @method getDurationInYears
   * @description 获取持续年数
   * @returns {number} 持续年数
   */
  getDurationInYears(): number {
    return this._endDate.getFullYear() - this._startDate.getFullYear();
  }

  /**
   * @method isPast
   * @description 判断是否为过去的时间范围
   * @returns {boolean} 是否为过去的时间范围
   */
  isPast(): boolean {
    return this._endDate < new Date();
  }

  /**
   * @method isFuture
   * @description 判断是否为未来的时间范围
   * @returns {boolean} 是否为未来的时间范围
   */
  isFuture(): boolean {
    return this._startDate > new Date();
  }

  /**
   * @method isCurrent
   * @description 判断是否为当前的时间范围
   * @returns {boolean} 是否为当前的时间范围
   */
  isCurrent(): boolean {
    const now = new Date();
    return this.contains(now);
  }

  /** 判断是否是今天范围 */
  isToday(): boolean {
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDate = now.getDate();
    const isSameDay = (d: Date) =>
      d.getFullYear() === todayYear &&
      d.getMonth() === todayMonth &&
      d.getDate() === todayDate;
    return isSameDay(this._startDate) && isSameDay(this._endDate);
  }

  /** 判断是否是本周范围 */
  isThisWeek(): boolean {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return (
      this._startDate >= startOfWeek && this._endDate <= endOfWeek
    );
  }

  /** 判断是否是本月范围 */
  isThisMonth(): boolean {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const inMonth = (d: Date) => d.getFullYear() === y && d.getMonth() === m;
    return inMonth(this._startDate) && inMonth(this._endDate);
  }

  /** 判断是否是本年范围 */
  isThisYear(): boolean {
    const y = new Date().getFullYear();
    const inYear = (d: Date) => d.getFullYear() === y;
    return inYear(this._startDate) && inYear(this._endDate);
  }

  /**
   * @method isSingleDay
   * @description 判断是否为单天范围
   * @returns {boolean} 是否为单天范围
   */
  isSingleDay(): boolean {
    return this._startDate.toDateString() === this._endDate.toDateString();
  }

  /**
   * @method isWeekend
   * @description 判断是否包含周末
   * @returns {boolean} 是否包含周末
   */
  isWeekend(): boolean {
    const startDay = this._startDate.getDay();
    const endDay = this._endDate.getDay();
    return startDay === 0 || startDay === 6 || endDay === 0 || endDay === 6;
  }

  /**
   * @method getWorkingDays
   * @description 获取工作日数量
   * @returns {number} 工作日数量
   */
  getWorkingDays(): number {
    let workingDays = 0;
    const currentDate = new Date(this._startDate);

    while (currentDate <= this._endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }

  /**
   * @private
   * @method normalizeDate
   * @description 标准化日期
   * @param date 日期
   * @returns {Date} 标准化后的日期
   */
  private normalizeDate(date: Date | string): Date {
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new InvalidDateRangeError(`Invalid date format: ${date}`, date);
      }
      return parsedDate;
    }
    return new Date(date);
  }

  /**
   * @private
   * @method validateDateRange
   * @description 验证日期范围
   * @throws {InvalidDateRangeError} 当日期范围无效时抛出错误
   */
  private validateDateRange(): void {
    if (this._startDate > this._endDate) {
      throw new InvalidDateRangeError(
        'Start date cannot be later than end date',
        { startDate: this._startDate, endDate: this._endDate }
      );
    }
  }

  /**
   * @protected
   * @method validateInvariants
   * @description 验证值对象不变性条件
   */
  protected override validateInvariants(): void {
    if (this._startDate > this._endDate) {
      throw new InvalidDateRangeError(
        'Start date cannot be later than end date'
      );
    }
  }

  /**
   * @static
   * @method today
   * @description 创建今天的日期范围
   * @returns {DateRange} 今天的日期范围
   */
  static today(): DateRange {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    );
    return new DateRange(startOfDay, endOfDay);
  }

  /**
   * @static
   * @method thisWeek
   * @description 创建本周的日期范围
   * @returns {DateRange} 本周的日期范围
   */
  static thisWeek(): DateRange {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return new DateRange(startOfWeek, endOfWeek);
  }

  /**
   * @static
   * @method thisMonth
   * @description 创建本月的日期范围
   * @returns {DateRange} 本月的日期范围
   */
  static thisMonth(): DateRange {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    return new DateRange(startOfMonth, endOfMonth);
  }

  /**
   * @static
   * @method thisYear
   * @description 创建本年的日期范围
   * @returns {DateRange} 本年的日期范围
   */
  static thisYear(): DateRange {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
    return new DateRange(startOfYear, endOfYear);
  }

  /**
   * @static
   * @method fromString
   * @description 从字符串创建日期范围
   * @param value 日期范围字符串（如 "2024-01-01 to 2024-12-31"）
   * @returns {DateRange} 日期范围值对象
   */
  static fromString(value: string): DateRange {
    const match = value.match(
      /^(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})$/
    );
    if (!match) {
      throw new InvalidDateRangeError(
        `Invalid date range format: ${value}`,
        value
      );
    }

    const startDate = new Date(match[1]);
    const endDate = new Date(match[2]);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new InvalidDateRangeError(`Invalid date in range: ${value}`, value);
    }

    return new DateRange(startDate, endDate);
  }

  /**
   * @static
   * @method isValid
   * @description 验证是否为有效的日期范围
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns {boolean} 是否有效
   */
  static isValid(startDate: Date | string, endDate: Date | string): boolean {
    try {
      new DateRange(startDate, endDate);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @static
   * @method fromJSON
   * @description 从JSON字符串创建日期范围
   * @param json JSON字符串
   * @returns {DateRange} 日期范围值对象
   */
  static fromJSON(json: string): DateRange {
    return new DateRange(new Date(), new Date()).fromJSON(json);
  }

  /**
   * @static
   * @method fromDuration
   * @description 从起始日期和数量+单位创建范围
   */
  static fromDuration(start: Date, amount: number, unit: DateRangeUnit): DateRange {
    const s = new Date(start);
    const e = new Date(start);
    switch (unit) {
      case DateRangeUnit.DAY:
      case DateRangeUnit.DAYS:
        e.setDate(e.getDate() + amount);
        break;
      case DateRangeUnit.WEEK:
        e.setDate(e.getDate() + amount * 7);
        break;
      case DateRangeUnit.MONTH:
        e.setMonth(e.getMonth() + amount);
        break;
      case DateRangeUnit.QUARTER:
        e.setMonth(e.getMonth() + amount * 3);
        break;
      case DateRangeUnit.YEAR:
      case DateRangeUnit.YEARS:
        e.setFullYear(e.getFullYear() + amount);
        break;
      default:
        e.setDate(e.getDate() + amount);
    }
    return new DateRange(s, e);
  }
}
