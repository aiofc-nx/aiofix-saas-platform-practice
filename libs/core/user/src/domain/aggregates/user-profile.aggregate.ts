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

import { AggregateRoot } from '@aiofix/shared';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { UserProfileUpdatedEvent } from '../domain-events';

/**
 * 用户档案数据类型定义
 */
interface UserProfileData {
  displayName: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  socialLinks: Record<string, string>;
  preferences: Record<string, unknown>;
}

/**
 * 用户档案聚合根类
 * @description 继承AggregateRoot，支持事件溯源和版本管理
 */
export class UserProfileAggregate extends AggregateRoot<string> {
  private _profile!: UserProfileEntity;

  constructor(id: string) {
    super(id);
  }

  /**
   * 静态工厂方法，创建用户档案聚合根
   * @description 创建新的用户档案聚合根实例
   * @param {string} id 档案ID
   * @param {string} displayName 显示名称
   * @param {string} tenantId 租户ID
   * @param {string} userId 用户ID
   * @param {string} [avatar] 头像URL
   * @param {string} [bio] 个人简介
   * @param {string} [location] 位置信息
   * @param {string} [website] 网站URL
   * @returns {UserProfileAggregate} 用户档案聚合根实例
   */
  static create(
    id: string,
    displayName: string,
    tenantId: string,
    userId: string,
    avatar?: string,
    bio?: string,
    location?: string,
    website?: string,
  ): UserProfileAggregate {
    const aggregate = new UserProfileAggregate(id);

    // 创建用户档案实体
    aggregate._profile = UserProfileEntity.createPrivateProfile(
      id,
      displayName,
      tenantId,
      userId,
    );

    // 设置其他属性
    if (avatar) aggregate._profile.updateAvatar(avatar);
    if (bio) aggregate._profile.updateBio(bio);
    if (location) aggregate._profile.updateLocation(location);
    if (website) aggregate._profile.updateWebsite(website);

    return aggregate;
  }

  /**
   * 从现有用户档案创建聚合根
   * @description 从现有的用户档案实体创建聚合根
   * @param {UserProfileEntity} profile 用户档案实体
   * @returns {UserProfileAggregate} 用户档案聚合根实例
   */
  static fromExisting(profile: UserProfileEntity): UserProfileAggregate {
    const aggregate = new UserProfileAggregate(profile.id.toString());
    aggregate._profile = profile;
    return aggregate;
  }

  /**
   * 更新显示名称
   * @description 更新用户的显示名称
   * @param {string} newDisplayName 新的显示名称
   */
  public updateDisplayName(newDisplayName: string): void {
    const oldDisplayName = this._profile.displayName;
    this._profile.updateDisplayName(newDisplayName);

    // 应用显示名称更新事件
    this.addDomainEvent(
      new UserProfileUpdatedEvent(
        this._profile.id.toString(),
        'displayName',
        newDisplayName,
        oldDisplayName,
      ),
    );
  }

  /**
   * 更新头像
   * @description 更新用户的头像URL
   * @param {string} newAvatar 新的头像URL
   */
  public updateAvatar(newAvatar: string): void {
    const oldAvatar = this._profile.avatar;
    this._profile.updateAvatar(newAvatar);

    // 应用头像更新事件
    this.addDomainEvent(
      new UserProfileUpdatedEvent(
        this._profile.id.toString(),
        'avatar',
        newAvatar,
        oldAvatar,
      ),
    );
  }

  /**
   * 更新个人简介
   * @description 更新用户的个人简介
   * @param {string} newBio 新的个人简介
   */
  public updateBio(newBio: string): void {
    const oldBio = this._profile.bio;
    this._profile.updateBio(newBio);

    // 应用个人简介更新事件
    this.addDomainEvent(
      new UserProfileUpdatedEvent(
        this._profile.id.toString(),
        'bio',
        newBio,
        oldBio,
      ),
    );
  }

  /**
   * 更新位置信息
   * @description 更新用户的地理位置信息
   * @param {string} newLocation 新的位置信息
   */
  public updateLocation(newLocation: string): void {
    const oldLocation = this._profile.location;
    this._profile.updateLocation(newLocation);

    // 应用位置更新事件
    this.addDomainEvent(
      new UserProfileUpdatedEvent(
        this._profile.id.toString(),
        'location',
        newLocation,
        oldLocation,
      ),
    );
  }

  /**
   * 更新网站URL
   * @description 更新用户的个人网站URL
   * @param {string} newWebsite 新的网站URL
   */
  public updateWebsite(newWebsite: string): void {
    const oldWebsite = this._profile.website;
    this._profile.updateWebsite(newWebsite);

    // 应用网站更新事件
    this.addDomainEvent(
      new UserProfileUpdatedEvent(
        this._profile.id.toString(),
        'website',
        newWebsite,
        oldWebsite,
      ),
    );
  }

  /**
   * 设置社交链接
   * @description 设置用户的社交媒体链接
   * @param {string} platform 社交平台名称
   * @param {string} url 社交链接URL
   */
  public setSocialLink(platform: string, url: string): void {
    if (!this._profile) {
      throw new Error('用户档案未初始化');
    }

    const oldUrl = this._profile.socialLinks[platform];
    this._profile.addSocialLink(platform, url);

    // 应用社交链接更新事件
    this.addDomainEvent(
      new UserProfileUpdatedEvent(
        this._profile.id.toString(),
        'socialLinks',
        { platform, url },
        { platform, url: oldUrl },
      ),
    );
  }

  /**
   * 移除社交链接
   * @description 移除用户的指定社交链接
   * @param {string} platform 社交平台名称
   */
  public removeSocialLink(platform: string): void {
    if (!this._profile) {
      throw new Error('用户档案未初始化');
    }

    const oldUrl = this._profile.socialLinks[platform];
    this._profile.removeSocialLink(platform);

    // 应用社交链接移除事件
    this.addDomainEvent(
      new UserProfileUpdatedEvent(
        this._profile.id.toString(),
        'socialLinks',
        undefined,
        { platform, url: oldUrl },
      ),
    );
  }

  /**
   * 设置偏好
   * @description 设置用户的个人偏好
   * @param {string} key 偏好键
   * @param {unknown} value 偏好值
   */
  public setPreference(key: string, value: unknown): void {
    if (!this._profile) {
      throw new Error('用户档案未初始化');
    }

    const oldValue = this._profile.preferences[key];
    this._profile.setPreference(key, value);

    // 应用偏好设置事件
    this.addDomainEvent(
      new UserProfileUpdatedEvent(
        this._profile.id.toString(),
        'preferences',
        { key, value },
        { key, value: oldValue },
      ),
    );
  }

  /**
   * 移除偏好
   * @description 移除用户的指定偏好设置
   * @param {string} key 偏好键
   */
  public removePreference(key: string): void {
    if (!this._profile) {
      throw new Error('用户档案未初始化');
    }

    const oldValue = this._profile.preferences[key];
    this._profile.removePreference(key);

    // 应用偏好移除事件
    this.addDomainEvent(
      new UserProfileUpdatedEvent(
        this._profile.id.toString(),
        'preferences',
        undefined,
        { key, value: oldValue },
      ),
    );
  }

  /**
   * 批量更新档案信息
   * @description 批量更新用户的档案信息
   * @param {Partial<UserProfileData>} updates 要更新的档案信息
   */
  public batchUpdate(updates: Partial<UserProfileData>): void {
    if (!this._profile) {
      throw new Error('用户档案未初始化');
    }

    const oldValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};

    // 记录旧值并应用更新
    if (updates.displayName !== undefined) {
      oldValues.displayName = this._profile.displayName;
      this._profile.updateDisplayName(updates.displayName);
      newValues.displayName = updates.displayName;
    }

    if (updates.avatar !== undefined) {
      oldValues.avatar = this._profile.avatar;
      this._profile.updateAvatar(updates.avatar);
      newValues.avatar = updates.avatar;
    }

    if (updates.bio !== undefined) {
      oldValues.bio = this._profile.bio;
      this._profile.updateBio(updates.bio);
      newValues.bio = updates.bio;
    }

    if (updates.location !== undefined) {
      oldValues.location = this._profile.location;
      this._profile.updateLocation(updates.location);
      newValues.location = updates.location;
    }

    if (updates.website !== undefined) {
      oldValues.website = this._profile.website;
      this._profile.updateWebsite(updates.website);
      newValues.website = updates.website;
    }

    if (updates.socialLinks !== undefined) {
      oldValues.socialLinks = { ...this._profile.socialLinks };
      Object.entries(updates.socialLinks).forEach(([platform, url]) => {
        this._profile.addSocialLink(platform, url);
      });
      newValues.socialLinks = updates.socialLinks;
    }

    if (updates.preferences !== undefined) {
      oldValues.preferences = { ...this._profile.preferences };
      Object.entries(updates.preferences).forEach(([key, value]) => {
        this._profile.setPreference(key, value);
      });
      newValues.preferences = updates.preferences;
    }

    // 应用批量更新事件
    if (Object.keys(newValues).length > 0) {
      this.addDomainEvent(
        new UserProfileUpdatedEvent(
          this._profile.id.toString(),
          'batch',
          newValues,
          oldValues,
        ),
      );
    }
  }

  /**
   * 获取用户档案实体
   * @description 获取聚合根管理的用户档案实体
   * @returns {UserProfileEntity} 用户档案实体
   */
  public get profile(): UserProfileEntity {
    if (!this._profile) {
      throw new Error('用户档案未初始化');
    }
    return this._profile;
  }

  /**
   * 获取档案ID
   * @description 获取用户档案的唯一标识符
   * @returns {string} 档案ID
   */
  public get id(): string {
    if (!this._profile) {
      throw new Error('用户档案未初始化');
    }
    return this._profile.id.toString();
  }

  /**
   * 获取用户ID
   * @description 获取档案所属用户的ID
   * @returns {string} 用户ID
   */
  public get userId(): string {
    if (!this._profile) {
      throw new Error('用户档案未初始化');
    }
    return this._profile.userId.toString();
  }

  /**
   * 获取租户ID
   * @description 获取档案所属租户的ID
   * @returns {string} 租户ID
   */
  public get tenantId(): string {
    if (!this._profile) {
      throw new Error('用户档案未初始化');
    }
    return this._profile.tenantId.toString();
  }
}
