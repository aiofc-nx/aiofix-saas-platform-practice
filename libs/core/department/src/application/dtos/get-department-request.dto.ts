/**
 * @interface GetDepartmentRequest
 * @description 获取部门请求DTO
 *
 * 功能与职责：
 * 1. 定义获取部门的请求数据结构
 * 2. 包含查询部门所需的信息
 * 3. 支持权限验证和访问控制
 *
 * @example
 * ```typescript
 * const request: GetDepartmentRequest = {
 *   departmentId: 'dept-123',
 *   tenantId: 'tenant-456',
 *   currentUserId: 'user-789'
 * };
 * ```
 * @since 1.0.0
 */
export interface GetDepartmentRequest {
  departmentId: string;
  tenantId: string;
  currentUserId: string;
}
