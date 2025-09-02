/**
 * @fileoverview
 * 用户管理模块 - 领域层枚举导出
 *
 * 该文件导出用户管理模块的所有领域枚举，包括：
 * - UserStatus: 用户状态枚举
 * - UserType: 用户类型枚举
 */

export { UserStatus, UserStatusTransitions, isStatusTransitionValid, getUserStatusDisplayName, getUserStatusColor } from './user-status.enum';
export { UserType, UserTypePermissions, getUserTypeDisplayName, getUserTypePermissionLevel, canUserTypeManageTenants, canUserTypeManageUsers, canUserTypeAccessAllData } from './user-type.enum';
