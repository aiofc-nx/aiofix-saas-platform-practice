/**
 * @class CreateUserResponse
 * @description
 * 创建用户响应DTO，包含用户创建结果的相关信息。
 *
 * 原理与机制：
 * 1. 作为数据传输对象，封装用户创建操作的响应数据
 * 2. 提供统一的响应格式，便于前端处理
 * 3. 包含操作成功状态和用户标识信息
 *
 * 功能与职责：
 * 1. 封装用户创建操作的结果
 * 2. 提供操作状态和用户ID信息
 * 3. 支持扩展其他响应字段
 *
 * @example
 * ```typescript
 * // 创建响应实例
 * const response = new CreateUserResponse('user-123', true);
 *
 * // 检查操作是否成功
 * if (response.success) {
 *   console.log(`用户创建成功，ID: ${response.userId}`);
 * }
 * ```
 * @since 1.0.0
 */

/**
 * 创建用户响应DTO
 */
export class CreateUserResponse {
  /**
   * 操作是否成功
   */
  public readonly success: boolean;

  /**
   * 创建的用户ID
   */
  public readonly userId: string;

  /**
   * 构造函数
   * @param userId 用户ID
   * @param success 操作是否成功
   */
  constructor(userId: string, success: boolean) {
    this.userId = userId;
    this.success = success;
  }

  /**
   * 获取响应数据
   * @returns 响应数据对象
   */
  toJSON(): Record<string, any> {
    return {
      success: this.success,
      userId: this.userId,
    };
  }
}
