/**
 * @interface GetDepartmentResponse
 * @description 获取部门响应DTO
 *
 * 功能与职责：
 * 1. 定义获取部门的响应数据结构
 * 2. 包含部门详细信息
 * 3. 继承基础响应格式
 *
 * @example
 * ```typescript
 * const response: GetDepartmentResponse = {
 *   success: true,
 *   department: departmentDto,
 *   message: '获取部门信息成功'
 * };
 * ```
 * @since 1.0.0
 */
import { DepartmentDto } from './department.dto';

export interface GetDepartmentResponse {
  success: boolean;
  department?: DepartmentDto;
  message: string;
  error?: string;
}
