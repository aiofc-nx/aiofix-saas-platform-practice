/**
 * @class UpdateUserResponse
 * @description
 * 更新用户响应DTO，包含用户更新结果的相关信息。
 *
 * 原理与机制：
 * 1. 作为数据传输对象，封装用户更新操作的响应数据
 * 2. 提供统一的响应格式，便于前端处理
 * 3. 包含操作成功状态和用户标识信息
 *
 * 功能与职责：
 * 1. 封装用户更新操作的结果
 * 2. 提供操作状态和用户ID信息
 * 3. 支持扩展其他响应字段
 *
 * @example
 * ```typescript
 * // 创建响应实例
 * const response = new UpdateUserResponse('user-123', true, '用户更新成功');
 *
 * // 检查操作是否成功
 * if (response.success) {
 *   console.log(`用户更新成功，ID: ${response.userId}`);
 *   console.log(`更新消息: ${response.message}`);
 * }
 * ```
 * @since 1.0.0
 */

/**
 * 更新用户响应DTO
 */
export class UpdateUserResponse {
  /**
   * 操作是否成功
   */
  public readonly success: boolean;

  /**
   * 更新的用户ID
   */
  public readonly userId: string;

  /**
   * 操作结果消息
   */
  public readonly message: string;

  /**
   * 构造函数
   * @param userId 用户ID
   * @param success 操作是否成功
   * @param message 操作结果消息
   */
  constructor(userId: string, success: boolean, message: string) {
    this.userId = userId;
    this.success = success;
    this.message = message;
  }

  /**
   * 获取响应数据
   * @returns 响应数据对象
   */
  toJSON(): Record<string, any> {
    return {
      success: this.success,
      userId: this.userId,
      message: this.message,
    };
  }
}
