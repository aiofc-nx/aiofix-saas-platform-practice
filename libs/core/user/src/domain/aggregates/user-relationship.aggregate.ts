/**
 * @class UserRelationshipAggregate
 * @description
 * 用户关系聚合根，负责管理用户关系实体和相关的业务规则。
 *
 * 原理与机制：
 * 1. 作为聚合根，UserRelationshipAggregate管理用户关系实体的一致性边界
 * 2. 封装用户关系相关的业务规则和验证逻辑
 * 3. 管理未提交的领域事件
 * 4. 确保用户关系数据的完整性和一致性
 *
 * 功能与职责：
 * 1. 管理用户关系实体的生命周期
 * 2. 执行用户关系相关的业务规则
 * 3. 发布领域事件
 * 4. 维护用户关系数据的一致性
 *
 * @example
 * ```typescript
 * const relationshipAggregate = UserRelationshipAggregate.create(
 *   'rel-123',
 *   'user-456',
 *   'org-789',
 *   'ORGANIZATION',
 *   'MEMBER',
 *   'tenant-123'
 * );
 * relationshipAggregate.activate();
 * relationshipAggregate.grantPermission('READ');
 * ```
 * @since 1.0.0
 */

import { UserRelationshipEntity } from '../entities/user-relationship.entity';
import { UserId, TenantId, Uuid } from '@aiofix/shared';
import { DataPrivacyLevel } from '@aiofix/shared';

/**
 * 用户关系聚合根类
 * @description 管理用户关系实体和相关的业务规则
 */
export class UserRelationshipAggregate {
  private _relationship!: UserRelationshipEntity;
  private _uncommittedEvents: any[] = [];

  /**
   * 私有构造函数
   * @description 防止外部直接创建实例
   */
  private constructor() {}

  /**
   * 静态工厂方法，创建用户关系聚合根
   * @description 创建新的用户关系聚合根实例
   * @param {string} id 关系ID
   * @param {string} userId 用户ID
   * @param {string} targetEntityId 目标实体ID
   * @param {string} targetEntityType 目标实体类型
   * @param {string} relationshipType 关系类型
   * @param {string} tenantId 租户ID
   * @param {string} [organizationId] 组织ID
   * @param {string[]} [departmentIds] 部门ID列表
   * @param {DataPrivacyLevel} [dataPrivacyLevel] 数据隐私级别
   * @returns {UserRelationshipAggregate} 用户关系聚合根实例
   */
  static create(
    id: string,
    userId: string,
    targetEntityId: string,
    targetEntityType: string,
    relationshipType: string,
    tenantId: string,
    organizationId?: string,
    departmentIds: string[] = [],
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED
  ): UserRelationshipAggregate {
    const aggregate = new UserRelationshipAggregate();
    
    // 创建用户关系实体
    aggregate._relationship = new UserRelationshipEntity(
      id,
      userId,
      targetEntityId,
      targetEntityType,
      relationshipType as any, // 临时类型转换
      'ACTIVE' as any, // 默认状态
      tenantId,
      organizationId,
      departmentIds,
      dataPrivacyLevel
    );

    return aggregate;
  }

  /**
   * 从现有用户关系创建聚合根
   * @description 从现有的用户关系实体创建聚合根
   * @param {UserRelationshipEntity} relationship 用户关系实体
   * @returns {UserRelationshipAggregate} 用户关系聚合根实例
   */
  static fromExisting(relationship: UserRelationshipEntity): UserRelationshipAggregate {
    const aggregate = new UserRelationshipAggregate();
    aggregate._relationship = relationship;
    return aggregate;
  }

  /**
   * 激活关系
   * @description 将用户关系状态设置为激活状态
   */
  public activate(): void {
    this._relationship.activate();
    // 这里可以添加激活关系的业务规则验证
    // 例如：检查用户是否有权限激活该关系
  }

  /**
   * 停用关系
   * @description 将用户关系状态设置为停用状态
   */
  public deactivate(): void {
    this._relationship.deactivate();
    // 这里可以添加停用关系的业务规则验证
    // 例如：检查关系是否可以被停用
  }

  /**
   * 暂停关系
   * @description 将用户关系状态设置为暂停状态
   */
  public suspend(): void {
    this._relationship.suspend();
    // 这里可以添加暂停关系的业务规则验证
  }

  /**
   * 拒绝关系
   * @description 将用户关系状态设置为拒绝状态
   */
  public reject(): void {
    this._relationship.reject();
    // 这里可以添加拒绝关系的业务规则验证
  }

  /**
   * 设置关系结束日期
   * @description 设置用户关系的结束日期
   * @param {Date} endDate 结束日期
   */
  public setEndDate(endDate: Date): void {
    this._relationship.setEndDate(endDate);
    // 这里可以添加设置结束日期的业务规则验证
    // 例如：检查结束日期是否合理
  }

  /**
   * 授予权限
   * @description 向用户关系授予特定权限
   * @param {string} permission 权限名称
   */
  public grantPermission(permission: string): void {
    this._relationship.grantPermission(permission);
    // 这里可以添加权限授予的业务规则验证
    // 例如：检查权限是否有效
  }

  /**
   * 撤销权限
   * @description 从用户关系撤销特定权限
   * @param {string} permission 权限名称
   */
  public revokePermission(permission: string): void {
    this._relationship.revokePermission(permission);
    // 这里可以添加权限撤销的业务规则验证
  }

  /**
   * 检查权限
   * @description 检查用户关系是否具有特定权限
   * @param {string} permission 权限名称
   * @returns {boolean} 是否具有权限
   */
  public hasPermission(permission: string): boolean {
    return this._relationship.hasPermission(permission);
  }

  /**
   * 检查关系状态
   * @description 检查用户关系是否为特定状态
   * @param {string} status 状态名称
   * @returns {boolean} 是否为指定状态
   */
  public isStatus(status: string): boolean {
    return this._relationship.status === status;
  }

  /**
   * 检查关系是否过期
   * @description 检查用户关系是否已过期
   * @returns {boolean} 是否已过期
   */
  public isExpired(): boolean {
    return this._relationship.isExpired();
  }

  /**
   * 更新关系描述
   * @description 更新用户关系的描述信息
   * @param {string} description 新的描述信息
   */
  public updateDescription(description: string): void {
    this._relationship.updateDescription(description);
  }

  /**
   * 获取用户关系实体
   * @description 获取聚合根中的用户关系实体
   * @returns {UserRelationshipEntity} 用户关系实体
   */
  public get relationship(): UserRelationshipEntity {
    return this._relationship;
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
