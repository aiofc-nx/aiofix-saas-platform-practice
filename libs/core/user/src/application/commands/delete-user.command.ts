/**
 * @class DeleteUserCommand
 * @description
 * 删除用户命令，封装用户删除的请求数据。
 *
 * 原理与机制：
 * 1. 作为CQRS模式中的命令，DeleteUserCommand封装了用户删除的请求数据
 * 2. 命令是不可变的，一旦创建就不能修改
 * 3. 包含删除用户所需的所有必要信息
 * 4. 支持软删除和硬删除选项
 *
 * 功能与职责：
 * 1. 封装用户删除请求数据
 * 2. 提供命令验证方法
 * 3. 支持命令审计和追踪
 * 4. 确保命令的不可变性
 *
 * @example
 * ```typescript
 * const command = new DeleteUserCommand('user-123', {
 *   softDelete: true,
 *   reason: '用户主动注销'
 * });
 * ```
 * @since 1.0.0
 */

import { UserId } from '@aiofix/shared';

/**
 * 删除用户命令数据接口
 */
export interface DeleteUserCommandData {
  userId: string;
  softDelete?: boolean;
  reason?: string;
  deletedBy?: string; // 执行删除操作的用户ID
  cascadeDelete?: boolean; // 是否级联删除相关数据
}

/**
 * 删除用户命令
 * @description 封装用户删除的请求数据
 */
export class DeleteUserCommand {
  public readonly commandId: string;
  public readonly timestamp: Date;
  public readonly occurredOn: Date;
  public readonly userId: UserId;
  public readonly softDelete: boolean;
  public readonly reason?: string;
  public readonly deletedBy?: string;
  public readonly cascadeDelete: boolean;

  constructor(data: DeleteUserCommandData) {
    this.commandId = `cmd-delete-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.occurredOn = new Date();
    this.userId = UserId.create(data.userId);
    this.softDelete = data.softDelete ?? true; // 默认软删除
    this.reason = data.reason;
    this.deletedBy = data.deletedBy;
    this.cascadeDelete = data.cascadeDelete ?? false; // 默认不级联删除

    // 验证命令数据
    this.validate();
  }

  /**
   * 验证命令数据
   * @description 验证命令数据的有效性
   * @throws {Error} 当命令数据无效时抛出异常
   */
  private validate(): void {
    if (!this.userId) {
      throw new Error('用户ID是必填字段');
    }

    if (this.userId.toString().trim().length === 0) {
      throw new Error('用户ID不能为空');
    }

    if (this.reason && this.reason.trim().length === 0) {
      throw new Error('删除原因不能为空字符串');
    }

    if (this.deletedBy && this.deletedBy.trim().length === 0) {
      throw new Error('删除操作执行者ID不能为空字符串');
    }
  }

  /**
   * 获取命令摘要
   * @description 返回命令的简要描述
   * @returns {string} 命令摘要
   */
  getSummary(): string {
    const deleteType = this.softDelete ? '软删除' : '硬删除';
    return `${deleteType}用户: ${this.userId.toString()}`;
  }

  /**
   * 获取命令详情
   * @description 返回命令的详细信息
   * @returns {object} 命令详情
   */
  getDetails(): object {
    return {
      commandId: this.commandId,
      timestamp: this.timestamp,
      occurredOn: this.occurredOn,
      userId: this.userId.toString(),
      softDelete: this.softDelete,
      reason: this.reason,
      deletedBy: this.deletedBy,
      cascadeDelete: this.cascadeDelete,
    };
  }

  /**
   * 转换为JSON
   * @description 将命令转换为JSON格式
   * @returns {string} JSON字符串
   */
  toJSON(): string {
    return JSON.stringify(this.getDetails());
  }

  /**
   * 克隆命令
   * @description 创建命令的副本
   * @returns {DeleteUserCommand} 命令副本
   */
  clone(): DeleteUserCommand {
    return new DeleteUserCommand({
      userId: this.userId.toString(),
      softDelete: this.softDelete,
      reason: this.reason,
      deletedBy: this.deletedBy,
      cascadeDelete: this.cascadeDelete,
    });
  }

  /**
   * 检查是否为软删除
   * @description 检查是否使用软删除方式
   * @returns {boolean} 是否为软删除
   */
  isSoftDelete(): boolean {
    return this.softDelete;
  }

  /**
   * 检查是否为硬删除
   * @description 检查是否使用硬删除方式
   * @returns {boolean} 是否为硬删除
   */
  isHardDelete(): boolean {
    return !this.softDelete;
  }

  /**
   * 检查是否级联删除
   * @description 检查是否级联删除相关数据
   * @returns {boolean} 是否级联删除
   */
  isCascadeDelete(): boolean {
    return this.cascadeDelete;
  }

  /**
   * 获取删除类型描述
   * @description 返回删除类型的描述
   * @returns {string} 删除类型描述
   */
  getDeleteTypeDescription(): string {
    if (this.softDelete) {
      return '软删除 - 标记为已删除，保留数据';
    } else {
      return '硬删除 - 物理删除数据';
    }
  }
}
