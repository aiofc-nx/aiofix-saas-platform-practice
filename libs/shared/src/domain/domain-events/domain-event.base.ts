/**
 * @description 领域事件基类
 *
 * 领域事件表示领域中发生的重大事件，用于通知其他系统组件状态变更。
 * 领域事件是事件驱动架构的核心，用于解耦和异步处理。
 *
 * 原理与机制：
 * 1. 领域事件是不可变的，一旦创建就不能修改
 * 2. 领域事件包含事件发生时的完整状态信息
 * 3. 领域事件用于通知外部系统状态变更
 * 4. 领域事件支持事件溯源和审计
 *
 * 功能与职责：
 * 1. 状态变更通知
 * 2. 系统解耦
 * 3. 异步处理
 * 4. 事件溯源
 */

/**
 * @description 领域事件基类
 */
export abstract class DomainEvent<TData = any> {
  public readonly occurredOn: Date;
  public readonly eventId: string;

  constructor(
    public readonly eventType: string,
    protected readonly data: TData,
    eventId?: string
  ) {
    this.occurredOn = new Date();
    this.eventId = eventId || this.generateEventId();
  }

  /**
   * @description 生成事件ID
   * @returns 事件ID
   */
  private generateEventId(): string {
    return `${this.eventType}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  /**
   * @description 获取事件类型
   * @returns 事件类型
   */
  getEventType(): string {
    return this.eventType;
  }

  /**
   * @description 获取事件数据
   * @returns 事件数据
   */
  getData(): TData {
    return this.data;
  }

  /**
   * @description 获取事件发生时间
   * @returns 事件发生时间
   */
  getOccurredOn(): Date {
    return this.occurredOn;
  }

  /**
   * @description 获取事件ID
   * @returns 事件ID
   */
  getEventId(): string {
    return this.eventId;
  }

  /**
   * @description 转换为JSON
   * @returns JSON字符串
   */
  toJSON(): string {
    return JSON.stringify({
      eventId: this.eventId,
      eventType: this.eventType,
      data: this.data,
      occurredOn: this.occurredOn.toISOString(),
    });
  }

  /**
   * @description 从JSON创建事件
   * @param json JSON字符串
   * @returns 领域事件
   */
  static fromJSON<T>(json: string): DomainEvent<T> {
    const parsed = JSON.parse(json);
    const event = new (this as any)(
      parsed.eventType,
      parsed.data,
      parsed.eventId
    );
    event.occurredOn = new Date(parsed.occurredOn);
    return event;
  }
}
