/**
 * @class UserEntity
 * @description
 * 用户领域实体，代表系统中的用户对象，包含用户的核心属性和行为。
 *
 * 原理与机制：
 * 1. 作为领域层的实体，UserEntity聚合了与用户相关的属性（如id、username、email等）和业务方法（如修改邮箱、激活账户等）。
 * 2. 继承DataIsolationAwareEntity，支持多层级数据隔离（平台级、租户级、组织级、部门级、用户级）。
 * 3. 实体的唯一性由id属性保证，所有与用户相关的业务规则应在该实体内实现，确保领域一致性。
 * 4. 使用值对象封装复杂属性，确保领域概念的完整性。
 *
 * 功能与职责：
 * 1. 表达用户的核心业务属性和行为
 * 2. 封装与用户相关的业务规则
 * 3. 保证用户实体的一致性和完整性
 * 4. 提供领域事件发布能力
 * 5. 支持多层级数据隔离和访问控制
 *
 * @example
 * ```typescript
 * const user = new UserEntity(
 *   'user-123',
 *   'john_doe',
 *   'john@example.com',
 *   'tenant-456',
 *   'org-789',
 *   ['dept-001', 'dept-002']
 * );
 * user.changeEmail('newemail@example.com');
 * user.activate();
 * ```
 * @since 1.0.0
 */

import {
  DataIsolationAwareEntity,
  UserId,
  Email,
  Username,
  PhoneNumber,
  DataIsolationLevel,
  DataPrivacyLevel,
  TenantId,
  TenantIdAdapter,
} from '@aiofix/shared';
import { UserStatus } from '../enums/user-status.enum';
import { UserType } from '../enums/user-type.enum';

/**
 * 用户实体类
 * @description 继承DataIsolationAwareEntity，支持多层级数据隔离
 */
export class UserEntity extends DataIsolationAwareEntity {
  /**
   * 用户名
   * @description 用户的唯一登录名，用于登录和用户识别
   */
  private readonly _username: Username;

  /**
   * 用户邮箱
   * @description 用户的电子邮箱地址，用于登录和通知
   */
  private _email: Email;

  /**
   * 用户电话
   * @description 用户的电话号码，用于通知和验证
   */
  private _phone?: PhoneNumber;

  /**
   * 用户状态
   * @description 用户的当前状态，如激活、停用、删除等
   */
  private _status: UserStatus;

  /**
   * 用户类型
   * @description 用户的类型，如平台用户、租户用户等
   */
  private readonly _userType: UserType;

  /**
   * 构造函数，初始化用户实体
   * @description 创建用户实体实例，设置基本属性并验证数据有效性
   * @param {UserId} id 用户唯一标识，必须为非空
   * @param {Username} username 用户名，必须唯一
   * @param {Email} email 用户邮箱，必须符合邮箱格式规范
   * @param {string} tenantId 租户ID，用于数据隔离
   * @param {string} [organizationId] 组织ID，可选
   * @param {string[]} [departmentIds] 部门ID列表，可选
   * @param {UserType} [userType] 用户类型，默认为租户用户
   * @param {DataPrivacyLevel} [dataPrivacyLevel] 数据隐私级别，默认为受保护
   * @param {PhoneNumber} [phone] 用户电话，可选
   * @throws {InvalidArgumentException} 当参数无效时抛出异常
   */
  constructor(
    id: UserId,
    username: Username,
    email: Email,
    tenantId: TenantId,
    organizationId?: TenantId,
    departmentIds: TenantId[] = [],
    userType: UserType = UserType.TENANT_USER,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
    phone?: PhoneNumber,
  ) {
    // 确定数据隔离级别
    const isolationLevel =
      userType === UserType.PLATFORM_USER
        ? DataIsolationLevel.PLATFORM
        : DataIsolationLevel.USER;

    // 调用父类构造函数，设置数据隔离信息
    super(
      tenantId,
      isolationLevel,
      dataPrivacyLevel,
      id,
      organizationId,
      departmentIds,
      id, // userId 与实体ID相同
    );

    this._username = username;
    this._email = email;
    this._phone = phone;
    this._status = UserStatus.ACTIVE;
    this._userType = userType;
  }

  /**
   * 静态工厂方法，创建平台用户
   * @description 创建平台级用户实体
   * @param {UserId} id 用户ID
   * @param {Username} username 用户名
   * @param {Email} email 邮箱
   * @returns {UserEntity} 平台用户实体
   */
  static createPlatformUser(
    id: UserId,
    username: Username,
    email: Email,
  ): UserEntity {
    // 使用特殊的UUID来代表平台租户
    const platformTenantId = new TenantId(
      '00000000-0000-4000-8000-000000000000',
    );
    return new UserEntity(
      id,
      username,
      email,
      platformTenantId, // 平台级租户ID
      undefined,
      [],
      UserType.PLATFORM_USER,
      DataPrivacyLevel.PROTECTED,
    );
  }

  /**
   * 静态工厂方法，创建租户用户
   * @description 创建租户级用户实体
   * @param {UserId} id 用户ID
   * @param {Username} username 用户名
   * @param {Email} email 邮箱
   * @param {string} tenantId 租户ID
   * @param {string} [organizationId] 组织ID
   * @param {string[]} [departmentIds] 部门ID列表
   * @returns {UserEntity} 租户用户实体
   */
  static createTenantUser(
    id: UserId,
    username: Username,
    email: Email,
    tenantId: TenantId,
    organizationId?: TenantId,
    departmentIds: TenantId[] = [],
  ): UserEntity {
    return new UserEntity(
      id,
      username,
      email,
      tenantId,
      organizationId,
      departmentIds,
      UserType.TENANT_USER,
      DataPrivacyLevel.PROTECTED,
    );
  }

  /**
   * 修改用户邮箱
   * @description 更新用户的邮箱地址，包含邮箱格式验证
   * @param {Email} newEmail 新的邮箱地址，必须符合邮箱格式规范
   * @throws {InvalidEmailException} 当邮箱格式无效时抛出异常
   * @example
   * ```typescript
   * user.changeEmail(new Email('newemail@example.com'));
   * ```
   */
  public changeEmail(newEmail: Email): void {
    if (this._email.equals(newEmail)) {
      return; // 如果邮箱没有变化，直接返回
    }
    this._email = newEmail;
  }

  /**
   * 修改用户电话
   * @description 更新用户的电话号码，允许设置为undefined来清除电话
   * @param {PhoneNumber | undefined} newPhone 新的电话号码，可以是undefined
   */
  public changePhone(newPhone: PhoneNumber | undefined): void {
    this._phone = newPhone;
  }

  /**
   * 激活用户
   * @description 将用户状态设置为激活状态
   */
  public activate(): void {
    if (this._status === UserStatus.ACTIVE) {
      return; // 如果已经是激活状态，直接返回
    }
    this._status = UserStatus.ACTIVE;
  }

  /**
   * 停用用户
   * @description 将用户状态设置为停用状态
   */
  public deactivate(): void {
    if (this._status === UserStatus.INACTIVE) {
      return; // 如果已经是停用状态，直接返回
    }
    this._status = UserStatus.INACTIVE;
  }

  /**
   * 暂停用户
   * @description 将用户状态设置为暂停状态
   */
  public suspend(): void {
    if (this._status === UserStatus.SUSPENDED) {
      return; // 如果已经是暂停状态，直接返回
    }
    this._status = UserStatus.SUSPENDED;
  }

  /**
   * 删除用户
   * @description 将用户状态设置为删除状态
   */
  public delete(): void {
    if (this._status === UserStatus.DELETED) {
      return; // 如果已经是删除状态，直接返回
    }
    this._status = UserStatus.DELETED;
  }

  /**
   * 检查用户是否激活
   * @description 判断用户当前是否为激活状态
   * @returns {boolean} 如果用户激活返回true，否则返回false
   */
  public isActive(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  /**
   * 检查用户是否为平台用户
   * @description 判断用户是否为平台级用户
   * @returns {boolean} 如果是平台用户返回true，否则返回false
   */
  public isPlatformUser(): boolean {
    return this._userType === UserType.PLATFORM_USER;
  }

  /**
   * 检查用户是否为租户用户
   * @description 判断用户是否为租户级用户
   * @returns {boolean} 如果是租户用户返回true，否则返回false
   */
  public isTenantUser(): boolean {
    return this._userType === UserType.TENANT_USER;
  }

  /**
   * 获取用户ID
   * @description 获取用户的唯一标识符
   * @returns {UserId} 用户唯一标识符
   */
  public get id(): UserId {
    return this._id as UserId;
  }

  /**
   * 获取用户名
   * @description 获取用户的登录名
   * @returns {Username} 用户名
   */
  public get username(): Username {
    return this._username;
  }

  /**
   * 获取用户邮箱
   * @description 获取用户的电子邮箱地址
   * @returns {Email} 用户邮箱地址
   */
  public get email(): Email {
    return this._email;
  }

  /**
   * 获取用户电话
   * @description 获取用户的电话号码
   * @returns {Phone | undefined} 用户电话号码，可能为undefined
   */
  public get phone(): PhoneNumber | undefined {
    return this._phone;
  }

  /**
   * 获取用户状态
   * @description 获取用户的当前状态
   * @returns {UserStatus} 用户状态
   */
  public get status(): UserStatus {
    return this._status;
  }

  /**
   * 获取用户类型
   * @description 获取用户的类型
   * @returns {UserType} 用户类型
   */
  public get userType(): UserType {
    return this._userType;
  }

  /**
   * 数据访问控制方法
   * @description 检查当前用户是否可以访问目标实体
   * @param {DataIsolationAwareEntity} target 目标实体
   * @returns {boolean} 如果可以访问返回true，否则返回false
   */
  public canAccess(target: DataIsolationAwareEntity): boolean {
    return super.canAccess(target);
  }

  /**
   * 分配用户到组织
   * @description 将用户分配到指定的组织和部门
   * @param {TenantId} organizationId 组织ID
   * @param {TenantId[]} departmentIds 部门ID列表
   */
  public assignToOrganization(
    organizationId: TenantId,
    departmentIds: TenantId[],
  ): void {
    // 更新组织归属
    this._organizationId = organizationId;

    // 更新部门归属
    this._departmentIds = [...departmentIds];

    // 更新数据隔离级别为组织级
    this._dataIsolationLevel = DataIsolationLevel.ORGANIZATION;
  }

  /**
   * 获取组织ID
   * @description 获取用户所属的组织ID
   * @returns {TenantId | undefined} 组织ID
   */
  public get organizationId(): TenantId | undefined {
    return TenantIdAdapter.fromUuidSafe(this._organizationId);
  }

  /**
   * 获取部门ID列表
   * @description 获取用户所属的部门ID列表
   * @returns {TenantId[]} 部门ID列表
   */
  public get departmentIds(): TenantId[] {
    return TenantIdAdapter.fromUuidArray(this._departmentIds);
  }
}
