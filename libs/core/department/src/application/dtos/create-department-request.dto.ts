/**
 * @interface CreateDepartmentRequest
 * @description 创建部门请求DTO
 *
 * 功能与职责：
 * 1. 定义创建部门的请求数据结构
 * 2. 包含创建部门所需的所有必要信息
 * 3. 支持部门层级关系的建立
 *
 * @example
 * ```typescript
 * const request: CreateDepartmentRequest = {
 *   id: 'dept-123',
 *   name: '技术部',
 *   code: 'TECH',
 *   type: 'BUSINESS',
 *   tenantId: 'tenant-456',
 *   organizationId: 'org-789',
 *   description: '负责技术开发工作'
 * };
 * ```
 * @since 1.0.0
 */
export interface CreateDepartmentRequest {
  id: string;
  name: string;
  code: string;
  type: string;
  tenantId: string;
  organizationId: string;
  description?: string;
  parentDepartmentId?: string;
  managerId?: string;
  createdBy: string;
}
