/**
 * @class UserProfileAggregate
 * @description
 * 用户档案聚合根，负责管理用户档案实体和相关的业务规则。
 *
 * 原理与机制：
 * 1. 作为聚合根，UserProfileAggregate管理用户档案实体的一致性边界
 * 2. 封装用户档案相关的业务规则和验证逻辑
 * 3. 管理未提交的领域事件
 * 4. 确保用户档案数据的完整性和一致性
 *
 * 功能与职责：
 * 1. 管理用户档案实体的生命周期
 * 2. 执行用户档案相关的业务规则
 * 3. 发布领域事件
 * 4. 维护用户档案数据的一致性
 *
 * @example
 * ```typescript
 * const profileAggregate = UserProfileAggregate.create(
 *   'profile-123',
 *   'John Doe',
 *   'tenant-456'
 * );
 * profileAggregate.updateDisplayName('John Smith');
 * profileAggregate.setPreference('theme', 'dark');
 * ```
 * @since 1.0.0
 */

import { UserProfileEntity } from '../entities/user-profile.entity';
import { UserId, TenantId } from '@aiofix/shared';
import { DataPrivacyLevel } from '@aiofix/shared';

/**
 * 用户档案聚合根类
 * @description 管理用户档案实体和相关的业务规则
 */
export class UserProfileAggregate {
  private _profile!: UserProfileEntity;
  private _uncommittedEvents: any[] = [];

  /**
   * 私有构造函数
   * @description 防止外部直接创建实例
   */
  private constructor() {}

  /**
   * 静态工厂方法，创建用户档案聚合根
   * @description 创建新的用户档案聚合根实例
   * @param {string} id 档案ID
   * @param {string} displayName 显示名称
   * @param {string} tenantId 租户ID
   * @param {string} userId 用户ID
   * @param {string} [organizationId] 组织ID
   * @param {string[]} [departmentIds] 部门ID列表
   * @param {DataPrivacyLevel} [dataPrivacyLevel] 数据隐私级别
   * @returns {UserProfileAggregate} 用户档案聚合根实例
   */
  static create(
    id: string,
    displayName: string,
    tenantId: string,
    userId: string,
    organizationId?: string,
    departmentIds: string[] = [],
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED
  ): UserProfileAggregate {
    const aggregate = new UserProfileAggregate();
    
    // 创建用户档案实体
    aggregate._profile = UserProfileEntity.createPrivateProfile(
      id,
      displayName,
      tenantId,
      userId,
      organizationId,
      departmentIds
    );

    return aggregate;
  }

  /**
   * 从现有用户档案创建聚合根
   * @description 从现有的用户档案实体创建聚合根
   * @param {UserProfileEntity} profile 用户档案实体
   * @returns {UserProfileAggregate} 用户档案聚合根实例
   */
  static fromExisting(profile: UserProfileEntity): UserProfileAggregate {
    const aggregate = new UserProfileAggregate();
    aggregate._profile = profile;
    return aggregate;
  }

  /**
   * 更新显示名称
   * @description 更新用户的显示名称
   * @param {string} displayName 新的显示名称
   */
  public updateDisplayName(displayName: string): void {
    this._profile.updateDisplayName(displayName);
    // 这里可以添加显示名称变更的业务规则验证
    // 例如：检查名称是否包含敏感词汇
  }

  /**
   * 更新头像
   * @description 更新用户的头像
   * @param {string} avatar 新的头像URL
   */
  public updateAvatar(avatar: string): void {
    this._profile.updateAvatar(avatar);
    // 这里可以添加头像更新的业务规则验证
    // 例如：检查头像文件大小和格式
  }

  /**
   * 更新个人简介
   * @description 更新用户的个人简介
   * @param {string} bio 新的个人简介
   */
  public updateBio(bio: string): void {
    this._profile.updateBio(bio);
    // 这里可以添加个人简介更新的业务规则验证
    // 例如：检查内容长度和敏感词汇
  }

  /**
   * 更新位置信息
   * @description 更新用户的位置信息
   * @param {string} location 新的位置信息
   */
  public updateLocation(location: string): void {
    this._profile.updateLocation(location);
  }

  /**
   * 更新网站信息
   * @description 更新用户的网站信息
   * @param {string} website 新的网站URL
   */
  public updateWebsite(website: string): void {
    this._profile.updateWebsite(website);
    // 这里可以添加网站URL的业务规则验证
    // 例如：检查URL格式和安全性
  }

  /**
   * 设置用户偏好
   * @description 设置用户的个人偏好
   * @param {string} key 偏好键
   * @param {unknown} value 偏好值
   */
  public setPreference(key: string, value: unknown): void {
    this._profile.setPreference(key, value);
  }

  /**
   * 获取用户偏好
   * @description 获取用户的特定偏好
   * @param {string} key 偏好键
   * @returns {unknown} 偏好值
   */
  public getPreference(key: string): unknown {
    return this._profile.getPreference(key);
  }

  /**
   * 获取所有偏好
   * @description 获取用户的所有偏好设置
   * @returns {Record<string, unknown>} 所有偏好设置
   */
  public getAllPreferences(): Record<string, unknown> {
    return this._profile.preferences;
  }

  /**
   * 获取用户档案实体
   * @description 获取聚合根中的用户档案实体
   * @returns {UserProfileEntity} 用户档案实体
   */
  public get profile(): UserProfileEntity {
    return this._profile;
  }

  /**
   * 获取未提交的事件
   * @description 获取聚合根中未提交的领域事件
   * @returns {any[]} 未提交的领域事件列表
   */
  public get uncommittedEvents(): any[] {
    return [...this._uncommittedEvents];
  }

  /**
   * 标记事件为已提交
   * @description 清空未提交的领域事件列表
   */
  public markEventsAsCommitted(): void {
    this._uncommittedEvents = [];
  }

  /**
   * 应用领域事件
   * @description 将领域事件添加到未提交事件列表
   * @param {any} event 领域事件
   */
  protected apply(event: any): void {
    this._uncommittedEvents.push(event);
  }
}
