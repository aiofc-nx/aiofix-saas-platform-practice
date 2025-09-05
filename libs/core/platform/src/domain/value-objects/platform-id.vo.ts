/**
 * @description 平台ID值对象
 * @author 江郎
 * @since 2.1.0
 */

import { Uuid } from '@aiofix/shared';

/**
 * @class PlatformId
 * @description 平台ID值对象
 *
 * 功能与职责：
 * 1. 封装平台实例的唯一标识符
 * 2. 提供类型安全的ID操作
 * 3. 支持平台实例的识别和引用
 *
 * 注意：直接使用Uuid作为基础，因为平台ID本质上就是一个UUID
 *
 * @example
 * ```typescript
 * const platformId = new PlatformId('550e8400-e29b-41d4-a716-446655440000');
 * console.log(platformId.toString()); // '550e8400-e29b-41d4-a716-446655440000'
 * ```
 * @since 2.1.0
 */
export class PlatformId extends Uuid {
  constructor(value: string) {
    super(value);
  }

  /**
   * 比较两个平台ID是否相等
   * @param other 另一个平台ID
   * @returns 是否相等
   */
  equals(other: PlatformId): boolean {
    return this.value === other.value;
  }

  /**
   * 创建新的平台ID实例
   * @param value 平台ID值
   * @returns 平台ID实例
   */
  static create(value: string): PlatformId {
    return new PlatformId(value);
  }
}
