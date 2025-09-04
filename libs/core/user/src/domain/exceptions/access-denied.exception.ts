/**
 * @class AccessDeniedException
 * @description
 * 访问被拒绝异常，当用户没有权限访问特定资源时抛出此异常。
 *
 * 原理与机制：
 * 1. 继承自UserException基类，提供统一的异常处理机制
 * 2. 包含具体的权限信息和资源信息，便于调试和错误追踪
 * 3. 支持国际化错误消息和多语言支持
 *
 * 功能与职责：
 * 1. 标识权限不足的业务错误
 * 2. 提供详细的错误信息和上下文
 * 3. 支持错误分类和错误码
 *
 * @example
 * ```typescript
 * // 在业务逻辑中抛出异常
 * if (!await permissionService.hasPermission(userId, 'user', 'read', targetUserId)) {
 *   throw new AccessDeniedException('user', 'read', targetUserId);
 * }
 *
 * // 在异常处理器中捕获
 * try {
 *   await getUserUseCase.execute(request);
 * } catch (error) {
 *   if (error instanceof AccessDeniedException) {
 *     // 处理权限不足错误
 *     console.log(`用户没有权限 ${error.action} 资源 ${error.resource}`);
 *   }
 * }
 * ```
 * @since 1.0.0
 */

import { UserException } from './user.exception';

/**
 * 访问被拒绝异常
 */
export class AccessDeniedException extends UserException {
  /**
   * 资源类型
   */
  public readonly resource: string;

  /**
   * 操作类型
   */
  public readonly action: string;

  /**
   * 资源ID
   */
  public readonly resourceId?: string;

  /**
   * 构造函数
   * @param resource 资源类型
   * @param action 操作类型
   * @param resourceId 资源ID
   * @param message 错误消息
   * @param errorCode 错误码
   */
  constructor(
    resource: string,
    action: string,
    resourceId?: string,
    message?: string,
    errorCode: string = 'ACCESS_DENIED',
  ) {
    const defaultMessage = `没有权限执行操作: ${action} 资源: ${resource}${resourceId ? ` (ID: ${resourceId})` : ''}`;
    super(message ?? defaultMessage, errorCode);
    this.resource = resource;
    this.action = action;
    this.resourceId = resourceId;
  }

  /**
   * 获取异常名称
   * @returns 异常类名
   */
  get name(): string {
    return 'AccessDeniedException';
  }

  /**
   * 获取错误详情
   * @returns 错误详情对象
   */
  get details(): Record<string, unknown> {
    return {
      resource: this.resource,
      action: this.action,
      resourceId: this.resourceId,
      errorCode: 'ACCESS_DENIED',
      message: this.message,
    };
  }

  /**
   * 转换为JSON格式
   * @returns JSON字符串
   */
  toJSON(): string {
    return JSON.stringify({
      name: this.name,
      message: this.message,
      errorCode: 'ACCESS_DENIED',
      resource: this.resource,
      action: this.action,
      resourceId: this.resourceId,
      stack: this.stack,
    });
  }
}
