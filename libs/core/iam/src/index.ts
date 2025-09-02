/**
 * @description IAM身份认证与授权管理模块入口文件
 * @author 技术架构师
 * @since 2.1.0
 */

// 模块导出
export * from './iam.module';

// 子领域导出
export * from './auth';
export * from './role';
export * from './permission';
export * from './session';
export * from './audit';
