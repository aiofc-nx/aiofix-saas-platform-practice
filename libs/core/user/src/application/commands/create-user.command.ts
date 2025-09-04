/**
 * @class CreateUserCommand
 * @description
 * 创建用户命令，封装用户创建的请求数据。
 *
 * 原理与机制：
 * 1. 作为CQRS模式中的命令，CreateUserCommand封装了用户创建的请求数据
 * 2. 命令是不可变的，一旦创建就不能修改
 * 3. 包含所有必要的用户创建信息
 * 4. 支持命令验证和审计追踪
 *
 * 功能与职责：
 * 1. 封装用户创建请求数据
 * 2. 提供命令验证方法
 * 3. 支持命令审计和追踪
 * 4. 确保命令的不可变性
 *
 * @example
 * ```typescript
 * const command = new CreateUserCommand({
 *   username: 'john_doe',
 *   email: 'john@example.com',
 *   tenantId: 'tenant-123'
 * });
 * ```
 * @since 1.0.0
 */

import { UserId, Username, Email, PhoneNumber, TenantId } from '@aiofix/shared';
import { UserType } from '../../domain/enums/user-type.enum';
import { DataPrivacyLevel } from '@aiofix/shared';

/**
 * 创建用户命令数据接口
 */
export interface CreateUserCommandData {
  username: string;
  email: string;
  phone?: string;
  tenantId: string;
  organizationId?: string;
  departmentIds?: string[];
  userType?: UserType;
  dataPrivacyLevel?: DataPrivacyLevel;
  profile?: {
    displayName?: string;
    bio?: string;
    location?: string;
    website?: string;
  };
}

/**
 * 创建用户命令
 * @description 封装用户创建的请求数据
 */
export class CreateUserCommand {
  public readonly commandId: string;
  public readonly timestamp: Date;
  public readonly occurredOn: Date;
  public readonly userId: UserId;
  public readonly username: Username;
  public readonly email: Email;
  public readonly phone?: PhoneNumber;
  public readonly tenantId: TenantId;
  public readonly organizationId?: string;
  public readonly departmentIds: string[];
  public readonly userType: UserType;
  public readonly dataPrivacyLevel: DataPrivacyLevel;
  public readonly profile?: {
    displayName?: string;
    bio?: string;
    location?: string;
    website?: string;
  };

  constructor(data: CreateUserCommandData) {
    this.commandId = `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.occurredOn = new Date();
    this.userId = UserId.generate();
    this.username = Username.create(data.username);
    this.email = new Email(data.email);
    this.phone = data.phone ? PhoneNumber.create(data.phone) : undefined;
    this.tenantId = TenantId.create(data.tenantId);
    this.organizationId = data.organizationId;
    this.departmentIds = data.departmentIds || [];
    this.userType = data.userType || UserType.TENANT_USER;
    this.dataPrivacyLevel = data.dataPrivacyLevel || DataPrivacyLevel.PROTECTED;
    this.profile = data.profile;

    // 验证命令数据
    this.validate();
  }

  /**
   * 验证命令数据
   * @description 验证命令数据的有效性
   * @throws {Error} 当命令数据无效时抛出异常
   */
  private validate(): void {
    if (!this.username || !this.email || !this.tenantId) {
      throw new Error('用户名、邮箱和租户ID是必填字段');
    }

    if (this.username.toString().trim().length === 0) {
      throw new Error('用户名不能为空');
    }

    if (this.email.toString().trim().length === 0) {
      throw new Error('邮箱不能为空');
    }

    if (this.tenantId.toString().trim().length === 0) {
      throw new Error('租户ID不能为空');
    }
  }

  /**
   * 获取命令摘要
   * @description 返回命令的简要描述
   * @returns {string} 命令摘要
   */
  getSummary(): string {
    return `创建用户: ${this.username.toString()} (${this.email.toString()})`;
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
      userId: this.userId.toString(),
      username: this.username.toString(),
      email: this.email.toString(),
      phone: this.phone?.toString(),
      tenantId: this.tenantId.toString(),
      organizationId: this.organizationId,
      departmentIds: this.departmentIds,
      userType: this.userType,
      dataPrivacyLevel: this.dataPrivacyLevel,
      profile: this.profile,
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
   * @returns {CreateUserCommand} 命令副本
   */
  clone(): CreateUserCommand {
    return new CreateUserCommand({
      username: this.username.toString(),
      email: this.email.toString(),
      phone: this.phone?.toString(),
      tenantId: this.tenantId.toString(),
      organizationId: this.organizationId,
      departmentIds: [...this.departmentIds],
      userType: this.userType,
      dataPrivacyLevel: this.dataPrivacyLevel,
      profile: this.profile ? { ...this.profile } : undefined,
    });
  }
}
