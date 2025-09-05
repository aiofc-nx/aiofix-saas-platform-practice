/**
 * @interface DeleteDepartmentResponse
 * @description 删除部门响应DTO
 *
 * 功能与职责：
 * 1. 定义删除部门的响应数据结构
 * 2. 继承基础响应格式
 * 3. 提供删除操作的结果反馈
 *
 * @example
 * ```typescript
 * const response: DeleteDepartmentResponse = {
 *   success: true,
 *   message: '部门删除成功'
 * };
 * ```
 * @since 1.0.0
 */
export interface DeleteDepartmentResponse {
  success: boolean;
  message: string;
  error?: string;
}
