/**
 * @interface GetDepartmentsRequest
 * @description 获取部门列表请求DTO
 *
 * 功能与职责：
 * 1. 定义获取部门列表的请求数据结构
 * 2. 支持分页和筛选条件
 * 3. 包含查询权限验证信息
 *
 * @example
 * ```typescript
 * const request: GetDepartmentsRequest = {
 *   tenantId: 'tenant-456',
 *   organizationId: 'org-789',
 *   currentUserId: 'user-123',
 *   page: 1,
 *   size: 20,
 *   status: 'ACTIVE'
 * };
 * ```
 * @since 1.0.0
 */
export interface GetDepartmentsRequest {
  tenantId: string;
  organizationId?: string;
  currentUserId: string;
  page?: number;
  size?: number;
  status?: string;
  type?: string;
  parentDepartmentId?: string;
  managerId?: string;
  searchText?: string;
}
