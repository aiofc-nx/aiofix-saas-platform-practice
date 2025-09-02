/**
 * @class UpdateUserCommand
 * @description
 * 更新用户命令，封装用户更新的请求数据。
 *
 * 原理与机制：
 * 1. 作为CQRS模式中的命令，UpdateUserCommand封装了用户更新的请求数据
 * 2. 命令是不可变的，一旦创建就不能修改
 * 3. 包含所有必要的用户更新信息
 * 4. 支持部分字段更新，确保数据一致性
 *
 * 功能与职责：
 * 1. 封装用户更新请求数据
 * 2. 提供命令验证方法
 * 3. 支持命令审计和追踪
 * 4. 确保命令的不可变性
 *
 * @example
 * ```typescript
 * const command = new UpdateUserCommand('user-123', {
 *   email: 'newemail@example.com',
 *   profile: { displayName: 'New Name' }
 * });
 * ```
 * @since 1.0.0
 */

import { UserId, Email, PhoneNumber } from '@aiofix/shared';
import { UserType } from '../../domain/enums/user-type.enum';
import { DataPrivacyLevel } from '@aiofix/shared';

/**
 * 更新用户命令数据接口
 */
export interface UpdateUserCommandData {
  userId: string;
  email?: string;
  phone?: string;
  userType?: UserType;
  dataPrivacyLevel?: DataPrivacyLevel;
  organizationId?: string;
  departmentIds?: string[];
  profile?: {
    displayName?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
  };
}

/**
 * 更新用户命令
 * @description 封装用户更新的请求数据
 */
export class UpdateUserCommand {
  public readonly commandId: string;
  public readonly timestamp: Date;
  public readonly occurredOn: Date;
  public readonly userId: UserId;
  public readonly email?: Email;
  public readonly phone?: PhoneNumber;
  public readonly userType?: UserType;
  public readonly dataPrivacyLevel?: DataPrivacyLevel;
  public readonly organizationId?: string;
  public readonly departmentIds?: string[];
  public readonly profile?: {
    displayName?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
  };

  constructor(data: UpdateUserCommandData) {
    this.commandId = `cmd-update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.occurredOn = new Date();
    this.userId = UserId.create(data.userId);
    this.email = data.email ? new Email(data.email) : undefined;
    this.phone = data.phone ? PhoneNumber.create(data.phone) : undefined;
    this.userType = data.userType;
    this.dataPrivacyLevel = data.dataPrivacyLevel;
    this.organizationId = data.organizationId;
    this.departmentIds = data.departmentIds ? [...data.departmentIds] : undefined;
    this.profile = data.profile ? { ...data.profile } : undefined;

    // 验证命令数据
    this.validate();
  }

  /**
   * 验证命令数据
   * @description 验证命令数据的有效性
   * @throws {Error} 当命令数据无效时抛出异常
   */
  private validate(): void {
    if (!this.userId) {
      throw new Error('用户ID是必填字段');
    }

    if (this.userId.toString().trim().length === 0) {
      throw new Error('用户ID不能为空');
    }

    // 至少需要提供一个更新字段
    if (!this.email && !this.phone && !this.userType && !this.dataPrivacyLevel && 
        !this.organizationId && !this.departmentIds && !this.profile) {
      throw new Error('至少需要提供一个更新字段');
    }
  }

  /**
   * 获取命令摘要
   * @description 返回命令的简要描述
   * @returns {string} 命令摘要
   */
  getSummary(): string {
    return `更新用户: ${this.userId.toString()}`;
  }

  /**
   * 获取命令详情
   * @description 返回命令的详细信息
   * @returns {object} 命令详情
   */
  getDetails(): object {
    return {
      commandId: this.commandId,
      timestamp: this.timestamp,
      occurredOn: this.occurredOn,
      userId: this.userId.toString(),
      email: this.email?.toString(),
      phone: this.phone?.toString(),
      userType: this.userType,
      dataPrivacyLevel: this.dataPrivacyLevel,
      organizationId: this.organizationId,
      departmentIds: this.departmentIds,
      profile: this.profile
    };
  }

  /**
   * 转换为JSON
   * @description 将命令转换为JSON格式
   * @returns {string} JSON字符串
   */
  toJSON(): string {
    return JSON.stringify(this.getDetails());
  }

  /**
   * 克隆命令
   * @description 创建命令的副本
   * @returns {UpdateUserCommand} 命令副本
   */
  clone(): UpdateUserCommand {
    return new UpdateUserCommand({
      userId: this.userId.toString(),
      email: this.email?.toString(),
      phone: this.phone?.toString(),
      userType: this.userType,
      dataPrivacyLevel: this.dataPrivacyLevel,
      organizationId: this.organizationId,
      departmentIds: this.departmentIds ? [...this.departmentIds] : undefined,
      profile: this.profile ? { ...this.profile } : undefined
    });
  }

  /**
   * 检查是否包含特定字段更新
   * @description 检查命令是否包含特定字段的更新
   * @param {string} field 字段名
   * @returns {boolean} 是否包含该字段更新
   */
  hasFieldUpdate(field: string): boolean {
    switch (field) {
      case 'email':
        return !!this.email;
      case 'phone':
        return !!this.phone;
      case 'userType':
        return !!this.userType;
      case 'dataPrivacyLevel':
        return !!this.dataPrivacyLevel;
      case 'organizationId':
        return !!this.organizationId;
      case 'departmentIds':
        return !!this.departmentIds;
      case 'profile':
        return !!this.profile;
      default:
        return false;
    }
  }

  /**
   * 获取更新的字段列表
   * @description 返回所有被更新的字段列表
   * @returns {string[]} 更新字段列表
   */
  getUpdatedFields(): string[] {
    const fields: string[] = [];
    
    if (this.email) fields.push('email');
    if (this.phone) fields.push('phone');
    if (this.userType) fields.push('userType');
    if (this.dataPrivacyLevel) fields.push('dataPrivacyLevel');
    if (this.organizationId !== undefined) fields.push('organizationId');
    if (this.departmentIds !== undefined) fields.push('departmentIds');
    if (this.profile) fields.push('profile');

    return fields;
  }
}
