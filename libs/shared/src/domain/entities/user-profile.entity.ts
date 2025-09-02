/**
 * @file user-profile.entity.ts
 * @description 用户档案实体
 *
 * 该文件定义了用户档案实体，展示如何使用DataIsolationAwareEntity的用户级功能。
 * 用户档案实体用于管理用户级别的个人信息。
 *
 * 主要功能：
 * 1. 用户级数据管理
 * 2. 用户级数据隔离
 * 3. 隐私级别控制
 * 4. 用户级访问控制
 *
 * 遵循DDD和Clean Architecture原则，提供统一的用户档案管理。
 */

import {
  DataIsolationAwareEntity,
  DataIsolationLevel,
  DataPrivacyLevel,
} from './data-isolation-aware.entity';
import { Uuid } from '../value-objects/uuid.vo';

/**
 * @interface UserProfileData
 * @description 用户档案数据接口
 */
export interface UserProfileData {
  displayName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  preferences?: Record<string, unknown>;
}

/**
 * @class UserProfile
 * @description 用户档案实体
 *
 * 用户档案实体用于管理用户级别的个人信息，包括：
 * - 基本信息
 * - 个人设置
 * - 偏好配置
 * - 社交信息
 *
 * 使用场景：
 * - 用户个人信息管理
 * - 用户偏好设置
 * - 用户档案展示
 * - 用户数据隐私保护
 */
export class UserProfile extends DataIsolationAwareEntity {
  private _displayName: string;
  private _avatar?: string;
  private _bio?: string;
  private _location?: string;
  private _website?: string;
  private _socialLinks: Record<string, string> = {};
  private _preferences: Record<string, unknown> = {};

  /**
   * @constructor
   * @description 创建用户档案实体
   * @param tenantId 租户ID
   * @param userId 用户ID
   * @param displayName 显示名称
   * @param dataPrivacyLevel 数据隐私级别
   * @param id 实体唯一标识符
   * @param organizationId 组织ID（可选）
   * @param departmentIds 部门ID列表（可选）
   */
  constructor(
    tenantId: Uuid,
    userId: Uuid,
    displayName: string,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
    id?: Uuid,
    organizationId?: Uuid,
    departmentIds: Uuid[] = [],
  ) {
    super(
      tenantId,
      DataIsolationLevel.USER,
      dataPrivacyLevel,
      id,
      organizationId,
      departmentIds,
      userId,
    );
    this._displayName = displayName;
  }

  /**
   * @getter displayName
   * @description 获取显示名称
   * @returns {string} 显示名称
   */
  get displayName(): string {
    return this._displayName;
  }

  /**
   * @getter avatar
   * @description 获取头像
   * @returns {string|undefined} 头像
   */
  get avatar(): string | undefined {
    return this._avatar;
  }

  /**
   * @getter bio
   * @description 获取个人简介
   * @returns {string|undefined} 个人简介
   */
  get bio(): string | undefined {
    return this._bio;
  }

  /**
   * @getter location
   * @description 获取位置
   * @returns {string|undefined} 位置
   */
  get location(): string | undefined {
    return this._location;
  }

  /**
   * @getter website
   * @description 获取网站
   * @returns {string|undefined} 网站
   */
  get website(): string | undefined {
    return this._website;
  }

  /**
   * @getter socialLinks
   * @description 获取社交链接
   * @returns {Record<string, string>} 社交链接
   */
  get socialLinks(): Record<string, string> {
    return { ...this._socialLinks };
  }

  /**
   * @getter preferences
   * @description 获取偏好设置
   * @returns {Record<string, unknown>} 偏好设置
   */
  get preferences(): Record<string, unknown> {
    return { ...this._preferences };
  }

  /**
   * @method updateDisplayName
   * @description 更新显示名称
   * @param displayName 新的显示名称
   */
  public updateDisplayName(displayName: string): void {
    this._displayName = displayName;
    this.updateTimestamp();
  }

  /**
   * @method updateAvatar
   * @description 更新头像
   * @param avatar 新的头像
   */
  public updateAvatar(avatar: string): void {
    this._avatar = avatar;
    this.updateTimestamp();
  }

  /**
   * @method updateBio
   * @description 更新个人简介
   * @param bio 新的个人简介
   */
  public updateBio(bio: string): void {
    this._bio = bio;
    this.updateTimestamp();
  }

  /**
   * @method updateLocation
   * @description 更新位置
   * @param location 新的位置
   */
  public updateLocation(location: string): void {
    this._location = location;
    this.updateTimestamp();
  }

  /**
   * @method updateWebsite
   * @description 更新网站
   * @param website 新的网站
   */
  public updateWebsite(website: string): void {
    this._website = website;
    this.updateTimestamp();
  }

  /**
   * @method addSocialLink
   * @description 添加社交链接
   * @param platform 平台名称
   * @param url 链接地址
   */
  public addSocialLink(platform: string, url: string): void {
    this._socialLinks[platform] = url;
    this.updateTimestamp();
  }

  /**
   * @method removeSocialLink
   * @description 移除社交链接
   * @param platform 平台名称
   */
  public removeSocialLink(platform: string): void {
    delete this._socialLinks[platform];
    this.updateTimestamp();
  }

  /**
   * @method setPreference
   * @description 设置偏好
   * @param key 偏好键
   * @param value 偏好值
   */
  public setPreference(key: string, value: unknown): void {
    this._preferences[key] = value;
    this.updateTimestamp();
  }

  /**
   * @method getPreference
   * @description 获取偏好
   * @param key 偏好键
   * @returns {unknown} 偏好值
   */
  public getPreference(key: string): unknown {
    return this._preferences[key];
  }

  /**
   * @method removePreference
   * @description 移除偏好
   * @param key 偏好键
   */
  public removePreference(key: string): void {
    delete this._preferences[key];
    this.updateTimestamp();
  }

  /**
   * @method toData
   * @description 转换为数据对象
   * @returns {UserProfileData} 用户档案数据对象
   */
  public toData(): UserProfileData {
    return {
      displayName: this._displayName,
      avatar: this._avatar,
      bio: this._bio,
      location: this._location,
      website: this._website,
      socialLinks: { ...this._socialLinks },
      preferences: { ...this._preferences },
    };
  }

  /**
   * @static
   * @method createPublicProfile
   * @description 创建公开档案
   * @param tenantId 租户ID
   * @param userId 用户ID
   * @param displayName 显示名称
   * @param organizationId 组织ID（可选）
   * @param departmentIds 部门ID列表（可选）
   * @returns {UserProfile} 用户档案实体
   */
  static createPublicProfile(
    tenantId: Uuid,
    userId: Uuid,
    displayName: string,
    organizationId?: Uuid,
    departmentIds: Uuid[] = [],
  ): UserProfile {
    return new UserProfile(
      tenantId,
      userId,
      displayName,
      DataPrivacyLevel.SHARED, // 公开档案为可共享
      undefined,
      organizationId,
      departmentIds,
    );
  }

  /**
   * @static
   * @method createPrivateProfile
   * @description 创建私有档案
   * @param tenantId 租户ID
   * @param userId 用户ID
   * @param displayName 显示名称
   * @param organizationId 组织ID（可选）
   * @param departmentIds 部门ID列表（可选）
   * @returns {UserProfile} 用户档案实体
   */
  static createPrivateProfile(
    tenantId: Uuid,
    userId: Uuid,
    displayName: string,
    organizationId?: Uuid,
    departmentIds: Uuid[] = [],
  ): UserProfile {
    return new UserProfile(
      tenantId,
      userId,
      displayName,
      DataPrivacyLevel.PROTECTED, // 私有档案为受保护
      undefined,
      organizationId,
      departmentIds,
    );
  }
}
