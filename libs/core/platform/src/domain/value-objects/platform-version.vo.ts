/**
 * @description 平台版本值对象
 * @author 江郎
 * @since 2.1.0
 */

import { BaseValueObject, InvalidValueObjectError } from '@aiofix/shared';

/**
 * @class InvalidPlatformVersionError
 * @description 平台版本格式错误
 */
export class InvalidPlatformVersionError extends InvalidValueObjectError {
  constructor(message: string, value?: string) {
    super(message, 'PlatformVersion', value);
    this.name = 'InvalidPlatformVersionError';
  }
}

/**
 * @class PlatformVersion
 * @description 平台版本值对象
 *
 * 功能与职责：
 * 1. 封装平台版本的业务规则和验证逻辑
 * 2. 支持语义化版本控制（Semantic Versioning）
 * 3. 提供版本比较和排序功能
 *
 * @example
 * ```typescript
 * const version = new PlatformVersion('1.2.3');
 * console.log(version.toString()); // '1.2.3'
 * console.log(version.major); // 1
 * console.log(version.minor); // 2
 * console.log(version.patch); // 3
 * ```
 * @since 2.1.0
 */
export class PlatformVersion extends BaseValueObject {
  private readonly _value: string;
  private readonly _major: number;
  private readonly _minor: number;
  private readonly _patch: number;
  private readonly _prerelease?: string;
  private readonly _build?: string;

  /**
   * @constructor
   * @description 创建平台版本值对象
   * @param value 版本字符串，支持语义化版本格式
   */
  constructor(value: string) {
    super();
    this.validatePlatformVersion(value);
    this._value = value.trim();

    const versionParts = this.parseVersion(value);
    this._major = versionParts.major;
    this._minor = versionParts.minor;
    this._patch = versionParts.patch;
    this._prerelease = versionParts.prerelease;
    this._build = versionParts.build;
  }

  /**
   * 获取版本值
   * @returns 版本字符串
   */
  get value(): string {
    return this._value;
  }

  /**
   * 获取主版本号
   * @returns 主版本号
   */
  get major(): number {
    return this._major;
  }

  /**
   * 获取次版本号
   * @returns 次版本号
   */
  get minor(): number {
    return this._minor;
  }

  /**
   * 获取补丁版本号
   * @returns 补丁版本号
   */
  get patch(): number {
    return this._patch;
  }

  /**
   * 获取预发布版本标识
   * @returns 预发布版本标识
   */
  get prerelease(): string | undefined {
    return this._prerelease;
  }

  /**
   * 获取构建版本标识
   * @returns 构建版本标识
   */
  get build(): string | undefined {
    return this._build;
  }

  /**
   * 获取版本字符串表示
   * @returns 版本字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * 比较两个版本是否相等
   * @param other 另一个版本
   * @returns 是否相等
   */
  equals(other: PlatformVersion): boolean {
    return this._value === other._value;
  }

  /**
   * 比较版本大小
   * @param other 另一个版本
   * @returns 比较结果：-1表示小于，0表示等于，1表示大于
   */
  compareTo(other: PlatformVersion): number {
    // 比较主版本号
    if (this._major !== other._major) {
      return this._major - other._major;
    }

    // 比较次版本号
    if (this._minor !== other._minor) {
      return this._minor - other._minor;
    }

    // 比较补丁版本号
    if (this._patch !== other._patch) {
      return this._patch - other._patch;
    }

    // 比较预发布版本
    if (this._prerelease && !other._prerelease) {
      return -1; // 预发布版本小于正式版本
    }
    if (!this._prerelease && other._prerelease) {
      return 1; // 正式版本大于预发布版本
    }
    if (this._prerelease && other._prerelease) {
      return this._prerelease.localeCompare(other._prerelease);
    }

    return 0;
  }

  /**
   * 检查是否大于另一个版本
   * @param other 另一个版本
   * @returns 是否大于
   */
  isGreaterThan(other: PlatformVersion): boolean {
    return this.compareTo(other) > 0;
  }

  /**
   * 检查是否小于另一个版本
   * @param other 另一个版本
   * @returns 是否小于
   */
  isLessThan(other: PlatformVersion): boolean {
    return this.compareTo(other) < 0;
  }

  /**
   * 验证平台版本格式
   * @param value 版本字符串
   * @throws InvalidPlatformVersionError 当版本格式不正确时
   */
  private validatePlatformVersion(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new InvalidPlatformVersionError('平台版本不能为空', value);
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new InvalidPlatformVersionError('平台版本不能为空', value);
    }

    // 语义化版本格式：MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
    const semverRegex =
      /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z\-\.]+))?(?:\+([0-9A-Za-z\-\.]+))?$/;
    if (!semverRegex.test(trimmedValue)) {
      throw new InvalidPlatformVersionError(
        '平台版本必须符合语义化版本格式 (如: 1.2.3, 1.2.3-alpha, 1.2.3+build)',
        value,
      );
    }
  }

  /**
   * 解析版本字符串
   * @param value 版本字符串
   * @returns 解析后的版本信息
   */
  private parseVersion(value: string): {
    major: number;
    minor: number;
    patch: number;
    prerelease?: string;
    build?: string;
  } {
    const semverRegex =
      /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z\-\.]+))?(?:\+([0-9A-Za-z\-\.]+))?$/;
    const match = value.match(semverRegex);

    if (!match) {
      throw new InvalidPlatformVersionError('无法解析版本格式', value);
    }

    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4],
      build: match[5],
    };
  }

  /**
   * 创建新的平台版本实例
   * @param value 版本值
   * @returns 平台版本实例
   */
  static create(value: string): PlatformVersion {
    return new PlatformVersion(value);
  }
}
