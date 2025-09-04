/**
 * @class UserProfileEntity
 * @description
 * 用户档案领域实体，代表系统中用户的档案信息，包含用户的扩展信息和偏好设置。
 *
 * 原理与机制：
 * 1. 作为领域层的实体，UserProfileEntity聚合了与用户档案相关的属性（如显示名称、头像、个人简介等）。
 * 2. 继承DataIsolationAwareEntity，支持多层级数据隔离（用户级数据隔离）。
 * 3. 实体的唯一性由id属性保证，所有与用户档案相关的业务规则应在该实体内实现，确保领域一致性。
 * 4. 使用值对象封装复杂属性，确保领域概念的完整性。
 *
 * 功能与职责：
 * 1. 表达用户档案的核心业务属性和行为
 * 2. 封装与用户档案相关的业务规则
 * 3. 保证用户档案实体的一致性和完整性
 * 4. 提供领域事件发布能力
 * 5. 支持用户级数据隔离和访问控制
 *
 * @example
 * ```typescript
 * const profile = new UserProfileEntity(
 *   'profile-123',
 *   'John Doe',
 *   'tenant-456',
 *   'user-789'
 * );
 * profile.updateDisplayName('John Smith');
 * profile.setPreference('language', 'zh-CN');
 * ```
 * @since 1.0.0
 */

import {
  DataIsolationAwareEntity,
  DataIsolationLevel,
  DataPrivacyLevel,
  Uuid,
} from '@aiofix/shared';

/**
 * 用户档案数据接口
 * @description 定义用户档案的数据结构
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
 * 用户档案实体类
 * @description 继承DataIsolationAwareEntity，支持用户级数据隔离
 */
export class UserProfileEntity extends DataIsolationAwareEntity {
  /**
   * 显示名称
   * @description 用户的显示名称，用于界面展示
   */
  private _displayName: string;

  /**
   * 头像
   * @description 用户的头像URL或路径
   */
  private _avatar?: string;

  /**
   * 个人简介
   * @description 用户的个人简介或描述
   */
  private _bio?: string;

  /**
   * 位置
   * @description 用户的地理位置信息
   */
  private _location?: string;

  /**
   * 网站
   * @description 用户的个人网站URL
   */
  private _website?: string;

  /**
   * 社交链接
   * @description 用户的社交媒体链接
   */
  private _socialLinks: Record<string, string> = {};

  /**
   * 偏好设置
   * @description 用户的个人偏好设置
   */
  private _preferences: Record<string, unknown> = {};

  /**
   * 构造函数，初始化用户档案实体
   * @description 创建用户档案实体实例，设置基本属性并验证数据有效性
   * @param {string} id 档案唯一标识，必须为非空字符串
   * @param {string} displayName 显示名称，长度在2-100个字符之间
   * @param {string} tenantId 租户ID，用于数据隔离
   * @param {string} userId 用户ID，关联到用户实体
   * @param {string} [organizationId] 组织ID，可选
   * @param {string[]} [departmentIds] 部门ID列表，可选
   * @param {DataPrivacyLevel} [dataPrivacyLevel] 数据隐私级别，默认为受保护
   * @throws {InvalidArgumentException} 当参数无效时抛出异常
   */
  constructor(
    id: string,
    displayName: string,
    tenantId: string,
    userId: string,
    organizationId?: string,
    departmentIds: string[] = [],
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
  ) {
    // 调用父类构造函数，设置数据隔离信息
    super(
      new Uuid(tenantId),
      DataIsolationLevel.USER,
      dataPrivacyLevel,
      new Uuid(id),
      organizationId ? new Uuid(organizationId) : undefined,
      departmentIds.map(deptId => new Uuid(deptId)),
      new Uuid(userId),
    );

    this._displayName = displayName;
  }

  /**
   * 静态工厂方法，创建公开档案
   * @description 创建可共享的用户档案实体
   * @param {string} id 档案ID
   * @param {string} displayName 显示名称
   * @param {string} tenantId 租户ID
   * @param {string} userId 用户ID
   * @param {string} [organizationId] 组织ID
   * @param {string[]} [departmentIds] 部门ID列表
   * @returns {UserProfileEntity} 公开用户档案实体
   */
  static createPublicProfile(
    id: string,
    displayName: string,
    tenantId: string,
    userId: string,
    organizationId?: string,
    departmentIds: string[] = [],
  ): UserProfileEntity {
    return new UserProfileEntity(
      id,
      displayName,
      tenantId,
      userId,
      organizationId,
      departmentIds,
      DataPrivacyLevel.SHARED,
    );
  }

  /**
   * 静态工厂方法，创建私有档案
   * @description 创建受保护的用户档案实体
   * @param {string} id 档案ID
   * @param {string} displayName 显示名称
   * @param {string} tenantId 租户ID
   * @param {string} userId 用户ID
   * @param {string} [organizationId] 组织ID
   * @param {string[]} [departmentIds] 部门ID列表
   * @returns {UserProfileEntity} 私有用户档案实体
   */
  static createPrivateProfile(
    id: string,
    displayName: string,
    tenantId: string,
    userId: string,
    organizationId?: string,
    departmentIds: string[] = [],
  ): UserProfileEntity {
    return new UserProfileEntity(
      id,
      displayName,
      tenantId,
      userId,
      organizationId,
      departmentIds,
      DataPrivacyLevel.PROTECTED,
    );
  }

  /**
   * 更新显示名称
   * @description 更新用户的显示名称
   * @param {string} displayName 新的显示名称
   */
  public updateDisplayName(displayName: string): void {
    if (displayName.length < 2 || displayName.length > 100) {
      throw new Error('显示名称长度必须在2-100个字符之间');
    }
    this._displayName = displayName;
  }

  /**
   * 更新头像
   * @description 更新用户的头像
   * @param {string} avatar 新的头像URL或路径
   */
  public updateAvatar(avatar: string): void {
    this._avatar = avatar;
  }

  /**
   * 更新个人简介
   * @description 更新用户的个人简介
   * @param {string} bio 新的个人简介
   */
  public updateBio(bio: string): void {
    if (bio.length > 500) {
      throw new Error('个人简介长度不能超过500个字符');
    }
    this._bio = bio;
  }

  /**
   * 更新位置
   * @description 更新用户的地理位置
   * @param {string} location 新的位置信息
   */
  public updateLocation(location: string): void {
    this._location = location;
  }

  /**
   * 更新网站
   * @description 更新用户的个人网站
   * @param {string} website 新的网站URL
   */
  public updateWebsite(website: string): void {
    // 简单的URL格式验证
    if (
      website &&
      !website.startsWith('http://') &&
      !website.startsWith('https://')
    ) {
      throw new Error('网站URL必须以http://或https://开头');
    }
    this._website = website;
  }

  /**
   * 添加社交链接
   * @description 添加用户的社交媒体链接
   * @param {string} platform 平台名称
   * @param {string} url 链接地址
   */
  public addSocialLink(platform: string, url: string): void {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('社交链接URL必须以http://或https://开头');
    }
    this._socialLinks[platform] = url;
  }

  /**
   * 移除社交链接
   * @description 移除用户的社交媒体链接
   * @param {string} platform 平台名称
   */
  public removeSocialLink(platform: string): void {
    delete this._socialLinks[platform];
  }

  /**
   * 设置偏好
   * @description 设置用户的个人偏好
   * @param {string} key 偏好键
   * @param {unknown} value 偏好值
   */
  public setPreference(key: string, value: unknown): void {
    this._preferences[key] = value;
  }

  /**
   * 获取偏好
   * @description 获取用户的个人偏好
   * @param {string} key 偏好键
   * @returns {unknown} 偏好值
   */
  public getPreference(key: string): unknown {
    return this._preferences[key];
  }

  /**
   * 移除偏好
   * @description 移除用户的个人偏好
   * @param {string} key 偏好键
   */
  public removePreference(key: string): void {
    delete this._preferences[key];
  }

  /**
   * 转换为数据对象
   * @description 将实体转换为数据对象，用于数据传输
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

  // Getters
  public get displayName(): string {
    return this._displayName;
  }

  public get avatar(): string | undefined {
    return this._avatar;
  }

  public get bio(): string | undefined {
    return this._bio;
  }

  public get location(): string | undefined {
    return this._location;
  }

  public get website(): string | undefined {
    return this._website;
  }

  public get socialLinks(): Record<string, string> {
    return { ...this._socialLinks };
  }

  public get preferences(): Record<string, unknown> {
    return { ...this._preferences };
  }
}
