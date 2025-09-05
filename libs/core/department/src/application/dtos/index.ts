/**
 * @fileoverview 部门模块应用层DTO导出
 * @description 统一导出所有数据传输对象
 * @since 1.0.0
 */

// 基础响应类型
export * from './base-response.dto';

// 部门相关DTO
export * from './department.dto';

// 请求DTO
export * from './create-department-request.dto';
export * from './update-department-request.dto';
export * from './get-department-request.dto';
export * from './get-departments-request.dto';

// 响应DTO
export * from './create-department-response.dto';
export * from './update-department-response.dto';
export * from './get-department-response.dto';
export * from './get-departments-response.dto';
export * from './delete-department-response.dto';
