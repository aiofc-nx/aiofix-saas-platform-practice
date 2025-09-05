/**
 * @interface CreateDepartmentResponse
 * @description 创建部门响应DTO
 *
 * 功能与职责：
 * 1. 定义创建部门的响应数据结构
 * 2. 包含创建结果和部门标识信息
 * 3. 继承基础响应格式
 *
 * @example
 * ```typescript
 * const response: CreateDepartmentResponse = {
 *   success: true,
 *   departmentId: 'dept-123',
 *   message: '部门创建成功'
 * };
 * ```
 * @since 1.0.0
 */
export interface CreateDepartmentResponse {
  success: boolean;
  departmentId?: string;
  message: string;
  error?: string;
}
