/**
 * @file tenant-id-adapter.util.ts
 * @description 租户ID类型适配器工具类
 *
 * 该工具类用于处理Uuid和TenantId之间的类型转换，解决类型兼容性问题。
 * 提供类型安全的转换方法，避免类型断言带来的风险。
 *
 * 全局性说明：
 * 1. 跨模块使用：所有需要类型转换的模块都可以使用
 * 2. 标准化转换：提供统一的类型转换标准
 * 3. 避免重复：防止各模块重复实现相同的转换逻辑
 * 4. 易于维护：集中管理类型转换逻辑
 *
 * 主要功能：
 * 1. Uuid到TenantId的安全转换
 * 2. TenantId到Uuid的安全转换
 * 3. 数组类型的批量转换
 * 4. 类型安全的转换方法
 */

import { Uuid, TenantId } from '../value-objects';

/**
 * 租户ID类型适配器
 * @description 提供Uuid和TenantId之间的类型安全转换
 *
 * 使用场景：
 * - 用户模块：处理用户实体的类型转换
 * - 租户模块：处理租户实体的类型转换
 * - 组织模块：处理组织实体的类型转换
 * - 部门模块：处理部门实体的类型转换
 * - 其他业务模块：任何需要类型转换的场景
 */
export class TenantIdAdapter {
  /**
   * 将Uuid转换为TenantId
   * @param uuid Uuid对象
   * @returns {TenantId} 转换后的TenantId对象
   */
  static fromUuid(uuid: Uuid): TenantId {
    return new TenantId(uuid.toString());
  }

  /**
   * 将Uuid数组转换为TenantId数组
   * @param uuids Uuid对象数组
   * @returns {TenantId[]} 转换后的TenantId对象数组
   */
  static fromUuidArray(uuids: Uuid[]): TenantId[] {
    return uuids.map(uuid => TenantIdAdapter.fromUuid(uuid));
  }

  /**
   * 将TenantId转换为Uuid
   * @param tenantId TenantId对象
   * @returns {Uuid} 转换后的Uuid对象
   */
  static toUuid(tenantId: TenantId): Uuid {
    return tenantId.toUuid();
  }

  /**
   * 将TenantId数组转换为Uuid数组
   * @param tenantIds TenantId对象数组
   * @returns {Uuid[]} 转换后的Uuid对象数组
   */
  static toUuidArray(tenantIds: TenantId[]): Uuid[] {
    return tenantIds.map(tenantId => tenantId.toUuid());
  }

  /**
   * 安全转换Uuid到TenantId，处理undefined情况
   * @param uuid Uuid对象或undefined
   * @returns {TenantId | undefined} 转换后的TenantId对象或undefined
   */
  static fromUuidSafe(uuid: Uuid | undefined): TenantId | undefined {
    return uuid ? TenantIdAdapter.fromUuid(uuid) : undefined;
  }

  /**
   * 安全转换TenantId到Uuid，处理undefined情况
   * @param tenantId TenantId对象或undefined
   * @returns {Uuid | undefined} 转换后的Uuid对象或undefined
   */
  static toUuidSafe(tenantId: TenantId | undefined): Uuid | undefined {
    return tenantId ? tenantId.toUuid() : undefined;
  }
}
