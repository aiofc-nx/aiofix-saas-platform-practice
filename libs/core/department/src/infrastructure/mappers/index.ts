/**
 * @file 部门映射器索引文件
 * @description 导出所有部门映射器，使用别名避免命名冲突
 * @since 2.1.0
 */

// PostgreSQL映射器
export { DepartmentMapper as PostgresDepartmentMapper } from './postgresql/department.mapper';

// MongoDB映射器
export { DepartmentMapper as MongoDepartmentMapper } from './mongodb/department.mapper';
