/**
 * @description 平台创建事件
 * @author 江郎
 * @since 2.1.0
 */

import { DomainEvent } from '@aiofix/shared';
import { PlatformType } from '../enums';

/**
 * @interface PlatformCreatedEventData
 * @description 平台创建事件数据接口
 */
export interface PlatformCreatedEventData {
  platformId: string;
  name: string;
  version: string;
  type: PlatformType;
  tenantId: string;
  organizationId?: string;
  departmentIds: string[];
  description?: string;
  createdBy: string;
  timestamp: Date;
}

/**
 * @class PlatformCreatedEvent
 * @description 平台创建事件
 *
 * 功能与职责：
 * 1. 记录平台创建的关键信息
 * 2. 支持事件溯源和状态重建
 * 3. 触发相关的业务流程
 *
 * @example
 * ```typescript
 * const event = new PlatformCreatedEvent(
 *   '550e8400-e29b-41d4-a716-446655440000',
 *   'Aiofix SaaS Platform',
 *   '1.0.0',
 *   PlatformType.SAAS,
 *   'tenant-123',
 *   'org-456',
 *   ['dept-789'],
 *   '企业级SaaS平台',
 *   'admin'
 * );
 * ```
 * @since 2.1.0
 */
export class PlatformCreatedEvent extends DomainEvent {
  public readonly eventType = 'PlatformCreated';
  public readonly eventVersion = '1.0.0';
  public readonly aggregateId: string;
  public readonly aggregateType = 'Platform';
  public readonly version = 1;

  constructor(
    public readonly platformId: string,
    public readonly name: string,
    public readonly version: string,
    public readonly type: PlatformType,
    public readonly tenantId: string,
    public readonly organizationId?: string,
    public readonly departmentIds: string[] = [],
    public readonly description?: string,
    public readonly createdBy: string = 'system',
    public readonly timestamp: Date = new Date(),
  ) {
    super('PlatformCreated', {
      platformId,
      name,
      version,
      type,
      tenantId,
      organizationId,
      departmentIds,
      description,
      createdBy,
      timestamp,
    });
    this.aggregateId = platformId;
  }

  /**
   * 获取事件数据
   * @returns 事件数据
   */
  public getEventData(): PlatformCreatedEventData {
    return {
      platformId: this.platformId,
      name: this.name,
      version: this.version,
      type: this.type,
      tenantId: this.tenantId,
      organizationId: this.organizationId,
      departmentIds: this.departmentIds,
      description: this.description,
      createdBy: this.createdBy,
      timestamp: this.timestamp,
    };
  }

  /**
   * 获取事件摘要
   * @returns 事件摘要
   */
  public getSummary(): string {
    return `平台 ${this.name} (${this.platformId}) 已创建，类型: ${this.type}`;
  }
}
