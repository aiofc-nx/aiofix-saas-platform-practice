/**
 * @file base-entity.ts
 * @description 基础实体类
 *
 * 该文件定义了基础实体类，作为所有实体的基类。
 * 基础实体提供了通用的实体属性和方法。
 *
 * 遵循DDD和Clean Architecture原则，提供统一的实体抽象。
 */

import { Uuid } from '../value-objects/uuid.vo';

/**
 * @abstract
 * @class BaseEntity
 * @description 基础实体类
 *
 * 所有实体的基类，提供以下通用功能：
 * - 唯一标识符管理
 * - 创建时间和更新时间
 * - 实体相等性比较
 * - 版本控制支持
 */
export abstract class BaseEntity {
  protected readonly _id: Uuid;
  protected readonly _createdAt: Date;
  protected _updatedAt: Date;
  protected _version: number;

  /**
   * @constructor
   * @description 创建基础实体
   * @param id 实体唯一标识符
   * @param createdAt 创建时间
   * @param updatedAt 更新时间
   * @param version 版本号
   */
  constructor(
    id: Uuid,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    version: number = 1,
  ) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._version = version;
  }

  /**
   * @getter id
   * @description 获取实体ID
   * @returns {Uuid} 实体唯一标识符
   */
  get id(): Uuid {
    return this._id;
  }

  /**
   * @getter createdAt
   * @description 获取创建时间
   * @returns {Date} 创建时间
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * @getter updatedAt
   * @description 获取更新时间
   * @returns {Date} 更新时间
   */
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * @getter version
   * @description 获取版本号
   * @returns {number} 版本号
   */
  get version(): number {
    return this._version;
  }

  /**
   * @method equals
   * @description 比较两个实体是否相等
   * @param other 另一个实体
   * @returns {boolean} 是否相等
   */
  equals(other: BaseEntity): boolean {
    if (this === other) return true;
    return this._id.equals(other._id);
  }

  /**
   * @protected
   * @method updateTimestamp
   * @description 更新实体时间戳
   */
  protected updateTimestamp(): void {
    this._updatedAt = new Date();
    this._version++;
  }

  /**
   * @method isNew
   * @description 判断实体是否为新创建的
   * @returns {boolean} 是否为新实体
   */
  isNew(): boolean {
    return this._version === 1;
  }

  /**
   * @method getAge
   * @description 获取实体年龄（从创建到现在的时间）
   * @returns {number} 年龄（毫秒）
   */
  getAge(): number {
    return Date.now() - this._createdAt.getTime();
  }

  /**
   * @method getTimeSinceLastUpdate
   * @description 获取距离上次更新的时间
   * @returns {number} 时间间隔（毫秒）
   */
  getTimeSinceLastUpdate(): number {
    return Date.now() - this._updatedAt.getTime();
  }
}
