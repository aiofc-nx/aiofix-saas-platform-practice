/**
 * @interface PermissionService
 * @description
 * 权限服务接口，定义用户权限验证的核心方法。
 *
 * 原理与机制：
 * 1. 作为领域服务接口，定义权限验证的业务契约
 * 2. 支持基于角色和资源的权限检查
 * 3. 提供细粒度的权限控制能力
 * 4. 支持动态权限验证
 *
 * 功能与职责：
 * 1. 验证用户对特定资源的操作权限
 * 2. 检查用户角色和权限分配
 * 3. 支持权限继承和组合
 * 4. 提供权限缓存和优化
 *
 * @example
 * ```typescript
 * // 检查用户是否有读取特定用户的权限
 * const hasPermission = await permissionService.hasPermission(
 *   userId,
 *   'user',
 *   'read',
 *   targetUserId
 * );
 *
 * if (!hasPermission) {
 *   throw new AccessDeniedException('user', 'read', targetUserId);
 * }
 * ```
 * @since 1.0.0
 */
export interface PermissionService {
  /**
   * 检查用户是否有特定权限
   * @param userId 用户ID
   * @param resource 资源类型
   * @param action 操作类型
   * @param resourceId 资源ID（可选）
   * @returns 是否有权限
   */
  hasPermission(
    userId: string,
    resource: string,
    action: string,
    resourceId?: string,
  ): Promise<boolean>;

  /**
   * 检查用户是否有角色
   * @param userId 用户ID
   * @param role 角色名称
   * @returns 是否有角色
   */
  hasRole(userId: string, role: string): Promise<boolean>;

  /**
   * 获取用户的所有权限
   * @param userId 用户ID
   * @returns 权限列表
   */
  getUserPermissions(userId: string): Promise<string[]>;

  /**
   * 获取用户的所有角色
   * @param userId 用户ID
   * @returns 角色列表
   */
  getUserRoles(userId: string): Promise<string[]>;
}
