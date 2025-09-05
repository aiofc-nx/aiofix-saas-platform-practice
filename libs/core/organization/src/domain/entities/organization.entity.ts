/**
 * @class OrganizationEntity
 * @description
 * 组织领域实体，代表系统中的组织对象，包含组织的核心属性和行为。
 *
 * 原理与机制：
 * 1. 作为领域层的实体，OrganizationEntity聚合了与组织相关的属性（如id、name、code等）和业务方法（如激活、暂停等）。
 * 2. 继承DataIsolationAwareEntity，支持多层级数据隔离（平台级、租户级、组织级、部门级、用户级）。
 * 3. 实体的唯一性由id属性保证，所有与组织相关的业务规则应在该实体内实现，确保领域一致性。
 * 4. 使用值对象封装复杂属性，确保领域概念的完整性。
 *
 * 功能与职责：
 * 1. 表达组织的核心业务属性和行为
 * 2. 封装与组织相关的业务规则
 * 3. 保证组织实体的一致性和完整性
 * 4. 提供领域事件发布能力
 * 5. 支持多层级数据隔离和访问控制
 *
 * @example
 * ```typescript
 * const organization = new OrganizationEntity(
 *   'org-123',
 *   'Sales Department',
 *   'SALES',
 *   'tenant-456'
 * );
 * organization.activate();
 * ```
 * @since 2.1.0
 */

import {
  DataIsolationAwareEntity,
  DataIsolationLevel,
  DataPrivacyLevel,
  Uuid,
} from '@aiofix/shared';
import {
  OrganizationId,
  OrganizationName,
  OrganizationCode,
} from '../value-objects';
import { OrganizationStatus, OrganizationType } from '../enums';

/**
 * 组织实体类
 */
export class OrganizationEntity extends DataIsolationAwareEntity {
  protected readonly _organizationId: OrganizationId;
  private _name: OrganizationName;
  private readonly _code: OrganizationCode;
  private readonly _type: OrganizationType;
  private _status: OrganizationStatus;
  private _description?: string;
  private readonly _parentOrganizationId?: OrganizationId;
  private _managerId?: string;
  private _metadata: Record<string, unknown>;
  private readonly _createdBy: string;
  private _updatedBy?: string;

  /**
   * @constructor
   * @description 创建组织实体
   * @param organizationId 组织ID
   * @param name 组织名称
   * @param code 组织代码
   * @param type 组织类型
   * @param tenantId 租户ID
   * @param departmentIds 部门ID列表（可选）
   * @param dataPrivacyLevel 数据隐私级别
   * @param status 组织状态
   * @param description 组织描述（可选）
   * @param parentOrganizationId 父组织ID（可选）
   * @param managerId 管理员ID（可选）
   * @param createdBy 创建者
   */
  constructor(
    organizationId: OrganizationId,
    name: OrganizationName,
    code: OrganizationCode,
    type: OrganizationType,
    tenantId: string,
    departmentIds: string[] = [],
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
    status: OrganizationStatus = OrganizationStatus.INITIALIZING,
    description?: string,
    parentOrganizationId?: OrganizationId,
    managerId?: string,
    createdBy: string = 'system',
  ) {
    super(
      new Uuid(tenantId),
      DataIsolationLevel.ORGANIZATION, // 组织级数据隔离
      dataPrivacyLevel,
      new Uuid(organizationId.toString()),
      undefined, // organizationId for parent class
      departmentIds.map(id => new Uuid(id)),
    );

    this._organizationId = organizationId;
    this._name = name;
    this._code = code;
    this._type = type;
    this._status = status;
    this._description = description;
    this._parentOrganizationId = parentOrganizationId;
    this._managerId = managerId;
    this._metadata = {};
    this._createdBy = createdBy;
  }

  /**
   * 获取组织ID
   * @returns 组织ID
   */
  get organizationId(): OrganizationId {
    return this._organizationId;
  }

  /**
   * 获取组织名称
   * @returns 组织名称
   */
  get name(): OrganizationName {
    return this._name;
  }

  /**
   * 获取组织代码
   * @returns 组织代码
   */
  get code(): OrganizationCode {
    return this._code;
  }

  /**
   * 获取组织类型
   * @returns 组织类型
   */
  get type(): OrganizationType {
    return this._type;
  }

  /**
   * 获取组织状态
   * @returns 组织状态
   */
  get status(): OrganizationStatus {
    return this._status;
  }

  /**
   * 获取组织描述
   * @returns 组织描述
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * 获取父组织ID
   * @returns 父组织ID
   */
  get parentOrganizationId(): OrganizationId | undefined {
    return this._parentOrganizationId;
  }

  /**
   * 获取管理员ID
   * @returns 管理员ID
   */
  get managerId(): string | undefined {
    return this._managerId;
  }

  /**
   * 获取创建者
   * @returns 创建者
   */
  get createdBy(): string {
    return this._createdBy;
  }

  /**
   * 获取更新者
   * @returns 更新者
   */
  get updatedBy(): string | undefined {
    return this._updatedBy;
  }

  /**
   * 获取创建时间
   * @returns 创建时间
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * 获取更新时间
   * @returns 更新时间
   */
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * 检查组织是否处于有效状态
   * @returns 是否有效
   */
  isValid(): boolean {
    return (
      (this._status === OrganizationStatus.ACTIVE ||
        this._status === OrganizationStatus.INITIALIZING) &&
      !this.isExpired()
    );
  }

  /**
   * 检查组织是否可以提供服务
   * @returns 是否可以提供服务
   */
  canProvideService(): boolean {
    return this._status === OrganizationStatus.ACTIVE;
  }

  /**
   * 检查组织是否已过期
   * @returns 是否已过期
   */
  isExpired(): boolean {
    // 这里可以添加过期逻辑，比如基于创建时间或其他条件
    return false;
  }

  /**
   * 激活组织
   * @param updatedBy 更新者
   */
  activate(updatedBy: string): void {
    if (this._status === OrganizationStatus.ACTIVE) {
      return; // 已经是激活状态，直接返回
    }

    if (!this.canTransitionTo(OrganizationStatus.ACTIVE)) {
      throw new Error(`组织状态为 ${this._status}，不能激活`);
    }

    this._status = OrganizationStatus.ACTIVE;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * 暂停组织
   * @param updatedBy 更新者
   */
  suspend(updatedBy: string): void {
    if (this._status === OrganizationStatus.SUSPENDED) {
      return; // 已经是暂停状态，直接返回
    }

    if (!this.canTransitionTo(OrganizationStatus.SUSPENDED)) {
      throw new Error(`组织状态为 ${this._status}，不能暂停`);
    }

    this._status = OrganizationStatus.SUSPENDED;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * 停用组织
   * @param updatedBy 更新者
   */
  deactivate(updatedBy: string): void {
    if (this._status === OrganizationStatus.INACTIVE) {
      return; // 已经是停用状态，直接返回
    }

    if (!this.canTransitionTo(OrganizationStatus.INACTIVE)) {
      throw new Error(`组织状态为 ${this._status}，不能停用`);
    }

    this._status = OrganizationStatus.INACTIVE;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * 更新组织信息
   * @param name 新名称（可选）
   * @param description 新描述（可选）
   * @param managerId 新管理员ID（可选）
   * @param updatedBy 更新者
   */
  updateInfo(
    name?: OrganizationName,
    description?: string,
    managerId?: string,
    updatedBy: string = 'system',
  ): void {
    if (name) {
      this._name = name;
    }
    if (description !== undefined) {
      this._description = description;
    }
    if (managerId !== undefined) {
      this._managerId = managerId;
    }

    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * 设置元数据
   * @param key 元数据键
   * @param value 元数据值
   * @param updatedBy 更新者
   */
  setMetadata(key: string, value: unknown, updatedBy: string = 'system'): void {
    this._metadata[key] = value;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * 获取元数据
   * @param key 元数据键
   * @returns 元数据值
   */
  getMetadata(key: string): unknown {
    return this._metadata[key];
  }

  /**
   * 获取所有元数据
   * @returns 元数据对象
   */
  getAllMetadata(): Record<string, unknown> {
    return { ...this._metadata };
  }

  /**
   * 检查是否可以转换到指定状态
   * @param targetStatus 目标状态
   * @returns 是否可以转换
   */
  private canTransitionTo(targetStatus: OrganizationStatus): boolean {
    const validTransitions: Record<OrganizationStatus, OrganizationStatus[]> = {
      [OrganizationStatus.INITIALIZING]: [
        OrganizationStatus.ACTIVE,
        OrganizationStatus.INACTIVE,
      ],
      [OrganizationStatus.ACTIVE]: [
        OrganizationStatus.SUSPENDED,
        OrganizationStatus.MAINTENANCE,
        OrganizationStatus.INACTIVE,
      ],
      [OrganizationStatus.MAINTENANCE]: [
        OrganizationStatus.ACTIVE,
        OrganizationStatus.SUSPENDED,
        OrganizationStatus.INACTIVE,
      ],
      [OrganizationStatus.SUSPENDED]: [
        OrganizationStatus.ACTIVE,
        OrganizationStatus.MAINTENANCE,
        OrganizationStatus.INACTIVE,
      ],
      [OrganizationStatus.INACTIVE]: [OrganizationStatus.ACTIVE],
      [OrganizationStatus.DELETED]: [], // 删除状态不能转换到其他状态
    };

    return validTransitions[this._status].includes(targetStatus);
  }

  /**
   * 创建新的组织实体
   * @param organizationId 组织ID
   * @param name 组织名称
   * @param code 组织代码
   * @param type 组织类型
   * @param tenantId 租户ID
   * @param departmentIds 部门ID列表（可选）
   * @param description 组织描述（可选）
   * @param parentOrganizationId 父组织ID（可选）
   * @param managerId 管理员ID（可选）
   * @param createdBy 创建者
   * @returns 组织实体
   */
  static create(
    organizationId: OrganizationId,
    name: OrganizationName,
    code: OrganizationCode,
    type: OrganizationType,
    tenantId: string,
    departmentIds: string[] = [],
    description?: string,
    parentOrganizationId?: OrganizationId,
    managerId?: string,
    createdBy: string = 'system',
  ): OrganizationEntity {
    return new OrganizationEntity(
      organizationId,
      name,
      code,
      type,
      tenantId,
      departmentIds,
      DataPrivacyLevel.PROTECTED,
      OrganizationStatus.INITIALIZING,
      description,
      parentOrganizationId,
      managerId,
      createdBy,
    );
  }
}
