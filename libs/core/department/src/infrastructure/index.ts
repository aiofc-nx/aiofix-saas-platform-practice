/**
 * @file 部门基础设施层索引文件
 * @description 导出所有基础设施层组件
 * @since 2.1.0
 */

// 实体
export * from './entities/postgresql/department.orm-entity';
export * from './entities/mongodb/department.document';

// 映射器
export * from './mappers';

// 仓储
export { PostgresDepartmentRepository } from './repositories/postgresql/postgres-department.repository';
export { MongoDepartmentRepository } from './repositories/mongodb/mongo-department.repository';
