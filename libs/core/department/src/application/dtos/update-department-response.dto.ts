/**
 * @interface UpdateDepartmentResponse
 * @description 更新部门响应DTO
 *
 * 功能与职责：
 * 1. 定义更新部门的响应数据结构
 * 2. 继承基础响应格式
 * 3. 提供更新操作的结果反馈
 *
 * @example
 * ```typescript
 * const response: UpdateDepartmentResponse = {
 *   success: true,
 *   message: '部门更新成功'
 * };
 * ```
 * @since 1.0.0
 */
export interface UpdateDepartmentResponse {
  success: boolean;
  message: string;
  error?: string;
}
