/**
 * @interface GetDepartmentsResponse
 * @description 获取部门列表响应DTO
 *
 * 功能与职责：
 * 1. 定义获取部门列表的响应数据结构
 * 2. 包含分页信息和部门列表
 * 3. 继承基础响应格式
 *
 * @example
 * ```typescript
 * const response: GetDepartmentsResponse = {
 *   success: true,
 *   departments: [departmentDto1, departmentDto2],
 *   total: 2,
 *   page: 1,
 *   size: 20,
 *   message: '获取部门列表成功'
 * };
 * ```
 * @since 1.0.0
 */
import { DepartmentDto } from './department.dto';

export interface GetDepartmentsResponse {
  success: boolean;
  departments?: DepartmentDto[];
  total?: number;
  page?: number;
  size?: number;
  message: string;
  error?: string;
}
