/**
 * @description User用户管理模块主入口
 * @author 江郎
 * @since 2.1.0
 */

// 导出领域层
export * from './domain';

// 导出应用层
export * from './application';

// 导出基础设施层
export * from './infrastructure';

// 导出表现层
export * from './presentation';

// 导出模块
export { UserModule } from './user.module';
