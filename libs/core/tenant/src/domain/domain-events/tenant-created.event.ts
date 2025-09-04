/**
 * @class TenantCreatedEvent
 * @description
 * 租户创建领域事件，表示租户实体已被创建。
 *
 * 原理与机制：
 * 1. 作为领域事件，TenantCreatedEvent记录租户创建的重要信息
 * 2. 包含租户创建时的所有关键数据，用于事件溯源和审计
 * 3. 支持租户类型和状态的传递
 * 4. 可以被其他模块订阅和处理
 *
 * 功能与职责：
 * 1. 记录租户创建事件
 * 2. 传递租户创建的关键信息
 * 3. 支持事件溯源和状态重建
 * 4. 触发相关的业务流程
 *
 * @example
 * ```typescript
 * const event = new TenantCreatedEvent(
 *   'tenant-123',
 *   'Acme Corporation',
 *   'ACME',
 *   'acme.example.com',
 *   TenantType.ENTERPRISE,
 *   TenantStatus.PENDING,
 *   '企业级租户'
 * );
 * ```
 * @since 1.0.0
 */

import { DomainEvent } from '@aiofix/shared';
import { TenantType, TenantStatus } from '../enums';

/**
 * 租户创建事件数据接口
 */
export interface TenantCreatedEventData {
  tenantId: string;
  name: string;
  code: string;
  domain: string;
  type: TenantType;
  status: TenantStatus;
  description?: string;
  createdAt: Date;
}

/**
 * 租户创建领域事件类
 * @description 表示租户实体已被创建的领域事件
 */
export class TenantCreatedEvent extends DomainEvent<TenantCreatedEventData> {
  constructor(
    tenantId: string,
    name: string,
    code: string,
    domain: string,
    type: TenantType,
    status: TenantStatus,
    description?: string,
    eventId?: string,
  ) {
    super(
      'TenantCreatedEvent',
      {
        tenantId,
        name,
        code,
        domain,
        type,
        status,
        description,
        createdAt: new Date(),
      },
      eventId,
    );
  }

  /**
   * 获取租户ID
   * @returns 租户ID
   */
  getTenantId(): string {
    return this.getData().tenantId;
  }

  /**
   * 获取租户名称
   * @returns 租户名称
   */
  getTenantName(): string {
    return this.getData().name;
  }

  /**
   * 获取租户代码
   * @returns 租户代码
   */
  getTenantCode(): string {
    return this.getData().code;
  }

  /**
   * 获取租户域名
   * @returns 租户域名
   */
  getTenantDomain(): string {
    return this.getData().domain;
  }

  /**
   * 获取租户类型
   * @returns 租户类型
   */
  getTenantType(): TenantType {
    return this.getData().type;
  }

  /**
   * 获取租户状态
   * @returns 租户状态
   */
  getTenantStatus(): TenantStatus {
    return this.getData().status;
  }

  /**
   * 获取租户描述
   * @returns 租户描述
   */
  getTenantDescription(): string | undefined {
    return this.getData().description;
  }

  /**
   * 获取创建时间
   * @returns 创建时间
   */
  getCreatedAt(): Date {
    return this.getData().createdAt;
  }
}
