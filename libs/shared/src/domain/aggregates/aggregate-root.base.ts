/**
 * @description 聚合根基类
 *
 * 聚合根是领域模型的一致性边界，负责维护聚合内所有对象的一致性。
 * 聚合根是聚合内所有对象的入口点，外部只能通过聚合根访问聚合内的对象。
 *
 * 原理与机制：
 * 1. 聚合根管理聚合内所有实体和值对象
 * 2. 聚合根负责维护聚合的一致性
 * 3. 聚合根发布领域事件
 * 4. 聚合根是聚合的唯一入口点
 *
 * 功能与职责：
 * 1. 聚合一致性管理
 * 2. 领域事件发布
 * 3. 业务规则验证
 * 4. 聚合生命周期管理
 */

import { DomainEvent } from '../domain-events/domain-event.base';

/**
 * @description 聚合根基类
 */
export abstract class AggregateRoot<TId> {
  private _domainEvents: DomainEvent[] = [];
  private _version: number = 0;

  constructor(public readonly id: TId) {}

  /**
   * @description 获取聚合版本号
   * @returns 版本号
   */
  get version(): number {
    return this._version;
  }

  /**
   * @description 获取未提交的领域事件
   * @returns 领域事件数组
   */
  get uncommittedEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * @description 添加领域事件
   * @param event 领域事件
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * @description 清除未提交的领域事件
   */
  clearEvents(): void {
    this._domainEvents = [];
  }

  /**
   * @description 增加版本号
   */
  protected incrementVersion(): void {
    this._version++;
  }

  /**
   * @description 设置版本号
   * @param version 版本号
   */
  setVersion(version: number): void {
    this._version = version;
  }
}
