/**
 * @class UserAggregate
 * @description
 * 用户聚合根，负责管理用户实体和相关的业务规则。
 *
 * 原理与机制：
 * 1. 作为聚合根，UserAggregate管理用户实体的一致性边界
 * 2. 封装用户相关的业务规则和验证逻辑
 * 3. 管理未提交的领域事件
 * 4. 确保用户数据的完整性和一致性
 *
 * 功能与职责：
 * 1. 管理用户实体的生命周期
 * 2. 执行用户相关的业务规则
 * 3. 发布领域事件
 * 4. 维护用户数据的一致性
 *
 * @example
 * ```typescript
 * const userAggregate = UserAggregate.create(
 *   'user-123',
 *   'john_doe',
 *   'john@example.com',
 *   'tenant-456'
 * );
 * userAggregate.changeEmail('newemail@example.com');
 * userAggregate.activate();
 * ```
 * @since 1.0.0
 */

import { UserEntity } from '../entities/user.entity';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { UserRelationshipEntity } from '../entities/user-relationship.entity';
import { UserId, Username, Email, PhoneNumber, TenantId } from '@aiofix/shared';
import { UserStatus } from '../enums/user-status.enum';
import { UserType } from '../enums/user-type.enum';
import { DataPrivacyLevel } from '@aiofix/shared';

/**
 * 用户聚合根类
 * @description 管理用户实体和相关的业务规则
 */
export class UserAggregate {
  private _user!: UserEntity;
  private _profile?: UserProfileEntity;
  private _relationships: UserRelationshipEntity[] = [];
  private _uncommittedEvents: any[] = [];

  /**
   * 私有构造函数
   * @description 防止外部直接创建实例
   */
  private constructor() {}

  /**
   * 静态工厂方法，创建用户聚合根
   * @description 创建新的用户聚合根实例
   * @param {UserId} id 用户ID
   * @param {Username} username 用户名
   * @param {Email} email 邮箱
   * @param {string} tenantId 租户ID
   * @param {string} [organizationId] 组织ID
   * @param {string[]} [departmentIds] 部门ID列表
   * @param {UserType} [userType] 用户类型
   * @param {DataPrivacyLevel} [dataPrivacyLevel] 数据隐私级别
   * @returns {UserAggregate} 用户聚合根实例
   */
  static create(
    id: UserId,
    username: Username,
    email: Email,
    tenantId: TenantId,
    organizationId?: TenantId,
    departmentIds: TenantId[] = [],
    userType: UserType = UserType.TENANT_USER,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED
  ): UserAggregate {
    const aggregate = new UserAggregate();
    
    // 创建用户实体
    aggregate._user = new UserEntity(
      id,
      username,
      email,
      tenantId,
      organizationId,
      departmentIds,
      userType,
      dataPrivacyLevel
    );

    // 创建用户档案
    aggregate._profile = UserProfileEntity.createPrivateProfile(
      `profile-${id.toString()}`,
      username.toString(),
      tenantId.toString(),
      id.toString(),
      organizationId?.toString(),
      departmentIds.map(id => id.toString())
    );

    return aggregate;
  }

  /**
   * 从现有用户创建聚合根
   * @description 从现有的用户实体创建聚合根
   * @param {UserEntity} user 用户实体
   * @param {UserProfileEntity} [profile] 用户档案实体
   * @param {UserRelationshipEntity[]} [relationships] 用户关系实体列表
   * @returns {UserAggregate} 用户聚合根实例
   */
  static fromExisting(
    user: UserEntity,
    profile?: UserProfileEntity,
    relationships: UserRelationshipEntity[] = []
  ): UserAggregate {
    const aggregate = new UserAggregate();
    aggregate._user = user;
    aggregate._profile = profile;
    aggregate._relationships = [...relationships];
    return aggregate;
  }

  /**
   * 修改用户邮箱
   * @description 更新用户的邮箱地址
   * @param {Email} newEmail 新的邮箱地址
   */
  public changeEmail(newEmail: Email): void {
    this._user.changeEmail(newEmail);
    // 这里可以添加邮箱变更的业务规则验证
    // 例如：检查邮箱是否已被其他用户使用
  }

  /**
   * 修改用户电话
   * @description 更新用户的电话号码
   * @param {Phone} newPhone 新的电话号码
   */
  public changePhone(newPhone: PhoneNumber): void {
    this._user.changePhone(newPhone);
  }

  /**
   * 激活用户
   * @description 将用户状态设置为激活状态
   */
  public activate(): void {
    this._user.activate();
    // 这里可以添加激活用户的业务规则验证
    // 例如：检查用户是否满足激活条件
  }

  /**
   * 停用用户
   * @description 将用户状态设置为停用状态
   */
  public deactivate(): void {
    this._user.deactivate();
    // 这里可以添加停用用户的业务规则验证
    // 例如：检查用户是否有未完成的任务
  }

  /**
   * 暂停用户
   * @description 将用户状态设置为暂停状态
   */
  public suspend(): void {
    this._user.suspend();
    // 这里可以添加暂停用户的业务规则验证
  }

  /**
   * 删除用户
   * @description 将用户状态设置为删除状态
   */
  public delete(): void {
    this._user.delete();
    // 这里可以添加删除用户的业务规则验证
    // 例如：检查用户是否有重要数据需要保留
  }

  /**
   * 更新用户档案
   * @description 更新用户的档案信息
   * @param {Partial<UserProfileData>} profileData 档案数据
   */
  public updateProfile(profileData: Partial<{
    displayName: string;
    avatar: string;
    bio: string;
    location: string;
    website: string;
  }>): void {
    if (!this._profile) {
      throw new Error('用户档案不存在');
    }

    if (profileData.displayName) {
      this._profile.updateDisplayName(profileData.displayName);
    }
    if (profileData.avatar) {
      this._profile.updateAvatar(profileData.avatar);
    }
    if (profileData.bio) {
      this._profile.updateBio(profileData.bio);
    }
    if (profileData.location) {
      this._profile.updateLocation(profileData.location);
    }
    if (profileData.website) {
      this._profile.updateWebsite(profileData.website);
    }
  }

  /**
   * 设置用户偏好
   * @description 设置用户的个人偏好
   * @param {string} key 偏好键
   * @param {unknown} value 偏好值
   */
  public setPreference(key: string, value: unknown): void {
    if (!this._profile) {
      throw new Error('用户档案不存在');
    }
    this._profile.setPreference(key, value);
  }

  /**
   * 添加用户关系
   * @description 添加用户与其他实体的关系
   * @param {UserRelationshipEntity} relationship 用户关系实体
   */
  public addRelationship(relationship: UserRelationshipEntity): void {
    // 检查关系是否已存在
    const existingRelationship = this._relationships.find(
      r => r.targetEntityId === relationship.targetEntityId && 
           r.targetEntityType === relationship.targetEntityType
    );

    if (existingRelationship) {
      throw new Error('用户关系已存在');
    }

    this._relationships.push(relationship);
  }

  /**
   * 移除用户关系
   * @description 移除用户与其他实体的关系
   * @param {string} targetEntityId 目标实体ID
   * @param {string} targetEntityType 目标实体类型
   */
  public removeRelationship(targetEntityId: string, targetEntityType: string): void {
    const index = this._relationships.findIndex(
      r => r.targetEntityId === targetEntityId && 
           r.targetEntityType === targetEntityType
    );

    if (index > -1) {
      this._relationships.splice(index, 1);
    }
  }

  /**
   * 获取用户实体
   * @description 获取聚合根中的用户实体
   * @returns {UserEntity} 用户实体
   */
  public get user(): UserEntity {
    return this._user;
  }

  /**
   * 获取用户档案
   * @description 获取聚合根中的用户档案实体
   * @returns {UserProfileEntity | undefined} 用户档案实体
   */
  public get profile(): UserProfileEntity | undefined {
    return this._profile;
  }

  /**
   * 获取用户关系列表
   * @description 获取聚合根中的用户关系实体列表
   * @returns {UserRelationshipEntity[]} 用户关系实体列表
   */
  public get relationships(): UserRelationshipEntity[] {
    return [...this._relationships];
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
