/**
 * @file platform-aware.entity.ts
 * @description 平台感知实体基类
 *
 * 该文件定义了平台感知实体基类，为所有需要平台级访问能力的实体提供基础能力。
 * 平台感知实体是支持平台级数据访问控制的核心基础设施。
 *
 * 主要功能：
 * 1. 平台级数据访问控制
 * 2. 平台级权限验证
 * 3. 隐私级别管理
 * 4. 平台级数据一致性验证
 *
 * 遵循DDD和Clean Architecture原则，提供统一的平台感知抽象。
 */

import { BaseEntity } from './base-entity';
import { Uuid } from '../value-objects/uuid.vo';
import { DataPrivacyLevel } from './data-isolation-aware.entity';

/**
 * @class PlatformAccessDeniedError
 * @description 平台访问被拒绝异常
 */
export class PlatformAccessDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlatformAccessDeniedError';
  }
}

/**
 * @abstract
 * @class PlatformAwareEntity
 * @description 平台感知实体基类
 *
 * 所有需要平台级访问能力的实体的基类，提供以下功能：
 * - 平台级数据访问控制
 * - 平台级权限验证
 * - 隐私级别管理
 * - 平台级数据一致性验证
 *
 * 使用场景：
 * - 需要平台级访问控制的配置数据
 * - 需要平台级权限验证的公共数据
 * - 系统级安全实体
 * - 平台级安全设置
 *
 * 注意：这个基类不管理平台业务逻辑，只是标识实体具有平台感知能力
 */
export abstract class PlatformAwareEntity extends BaseEntity {
  protected _dataPrivacyLevel: DataPrivacyLevel;

  /**
   * @constructor
   * @description 创建平台感知实体
   * @param id 实体唯一标识符
   * @param dataPrivacyLevel 数据隐私级别
   */
  constructor(
    id?: Uuid,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
  ) {
    super(id ?? Uuid.generate());
    this._dataPrivacyLevel = dataPrivacyLevel;
  }

  /**
   * @getter dataPrivacyLevel
   * @description 获取数据隐私级别
   * @returns {DataPrivacyLevel} 数据隐私级别
   */
  get dataPrivacyLevel(): DataPrivacyLevel {
    return this._dataPrivacyLevel;
  }

  /**
   * @method canAccess
   * @description 检查当前实体是否有权限访问目标平台感知对象
   * @param target 目标平台感知对象
   * @returns 是否允许访问
   */
  public canAccess(target: PlatformAwareEntity): boolean {
    try {
      // 如果目标对象是可共享数据，则允许访问
      if (target._dataPrivacyLevel === DataPrivacyLevel.SHARED) {
        return true;
      }

      // 如果目标对象是受保护数据，则需要平台管理员权限
      if (target._dataPrivacyLevel === DataPrivacyLevel.PROTECTED) {
        return this.isPlatformAdmin();
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * @abstract
   * @method isPlatformAdmin
   * @description 检查当前实体是否具有平台管理员权限
   * @returns 是否具有平台管理员权限
   *
   * 注意：这是一个抽象方法，子类必须实现具体的权限检查逻辑
   */
  protected abstract isPlatformAdmin(): boolean;

  /**
   * @method setDataPrivacyLevel
   * @description 设置数据隐私级别
   * @param level 数据隐私级别
   */
  protected setDataPrivacyLevel(level: DataPrivacyLevel): void {
    this._dataPrivacyLevel = level;
    this.updateTimestamp();
  }

  /**
   * @method isSharedData
   * @description 判断是否为可共享数据
   * @returns 是否为可共享数据
   */
  public isSharedData(): boolean {
    return this._dataPrivacyLevel === DataPrivacyLevel.SHARED;
  }

  /**
   * @method isProtectedData
   * @description 判断是否为受保护数据
   * @returns 是否为受保护数据
   */
  public isProtectedData(): boolean {
    return this._dataPrivacyLevel === DataPrivacyLevel.PROTECTED;
  }

  /**
   * @method assertPlatformAccess
   * @description 断言平台级访问权限
   * @param target 目标平台感知对象
   * @throws {PlatformAccessDeniedError} 访问被拒绝时抛出
   */
  protected assertPlatformAccess(target: PlatformAwareEntity): void {
    if (!this.canAccess(target)) {
      throw new PlatformAccessDeniedError(
        `平台级访问被拒绝: 目标对象隐私级别为${target._dataPrivacyLevel}`,
      );
    }
  }
}
