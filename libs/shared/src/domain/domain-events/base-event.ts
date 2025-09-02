/**
 * @fileoverview
 * 基础领域事件类
 *
 * 所有领域事件的基类，提供事件的基础属性和方法。
 * 遵循DDD事件设计原则，确保事件的一致性和可追溯性。
 */

import { Uuid } from '../value-objects/uuid.vo';

/**
 * @abstract
 * @class BaseEvent
 * @description 基础领域事件类
 *
 * 所有领域事件都应该继承此类，获得：
 * 1. 事件发生时间
 * 2. 事件唯一标识
 * 3. 事件版本信息
 * 4. 事件元数据
 */
export abstract class BaseEvent {
  /**
   * @property occurredOn
   * @description 事件发生时间
   */
  public readonly occurredOn: Date;

  /**
   * @property eventId
   * @description 事件唯一标识
   */
  public readonly eventId: string;

  /**
   * @property eventVersion
   * @description 事件版本
   */
  public readonly eventVersion: string;

  /**
   * @property eventType
   * @description 事件类型
   */
  public readonly eventType: string;

  /**
   * @property metadata
   * @description 事件元数据
   */
  public readonly metadata: Record<string, unknown>;

  constructor() {
    this.occurredOn = new Date();
    this.eventId = Uuid.generate().toString();
    this.eventVersion = '1.0.0';
    this.eventType = this.constructor.name;
    this.metadata = {};
  }

  /**
   * @method getEventData
   * @description 获取事件数据
   * @returns 事件数据对象
   */
  public abstract getEventData(): Record<string, unknown>;

  /**
   * @method toJSON
   * @description 转换为JSON格式
   * @returns JSON字符串
   */
  public toJSON(): string {
    return JSON.stringify({
      eventId: this.eventId,
      eventType: this.eventType,
      eventVersion: this.eventVersion,
      occurredOn: this.occurredOn.toISOString(),
      data: this.getEventData(),
      metadata: this.metadata,
    });
  }

  /**
   * @method fromJSON
   * @description 从JSON创建事件
   * @param json JSON字符串
   * @returns 事件实例
   */
  public static fromJSON<T extends BaseEvent>(
    this: new () => T,
    json: string
  ): T {
    const data = JSON.parse(json);
    const event = new this();
    Object.assign(event, {
      occurredOn: new Date(data.occurredOn),
      eventId: data.eventId,
      eventVersion: data.eventVersion,
      eventType: data.eventType,
      metadata: data.metadata,
    });
    return event;
  }
}
