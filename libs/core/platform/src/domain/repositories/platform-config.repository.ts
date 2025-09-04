/**
 * @description 平台配置仓储接口
 * @author 江郎
 * @since 2.1.0
 */

export interface PlatformConfigRepository {
  // TODO: 实现仓储接口
  // 基础CRUD操作
  findById(id: string): Promise<unknown>;
  findAll(): Promise<unknown[]>;
  save(entity: string): Promise<unknown>;
  delete(id: string): Promise<boolean>;
}
