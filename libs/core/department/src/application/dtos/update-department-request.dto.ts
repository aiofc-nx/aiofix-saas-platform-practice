/**
 * @interface UpdateDepartmentRequest
 * @description 更新部门请求DTO
 *
 * 功能与职责：
 * 1. 定义更新部门的请求数据结构
 * 2. 支持部分字段更新
 * 3. 包含更新操作的必要信息
 *
 * @example
 * ```typescript
 * const request: UpdateDepartmentRequest = {
 *   name: '新技术部',
 *   description: '更新后的部门描述',
 *   managerId: 'user-456'
 * };
 * ```
 * @since 1.0.0
 */
export interface UpdateDepartmentRequest {
  name?: string;
  code?: string;
  type?: string;
  description?: string;
  parentDepartmentId?: string;
  managerId?: string;
  status?: string;
}
