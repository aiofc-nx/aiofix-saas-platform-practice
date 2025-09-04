/**
 * @description 租户仓储接口
 * @author 江郎
 * @since 2.1.0
 */

export interface TenantRepository {
  // TODO: 实现仓储接口
  // 基础CRUD操作
  findById(id: string): Promise<unknown>;
  findAll(): Promise<unknown[]>;
  save(entity: unknown): Promise<unknown>;
  delete(id: string): Promise<boolean>;
}
