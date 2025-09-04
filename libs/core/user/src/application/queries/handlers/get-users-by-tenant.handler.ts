/**
 * @description 根据租户ID获取用户列表查询处理器
 * @author 江郎
 * @since 2.1.0
 */

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUsersByTenantQuery } from '../get-users-by-tenant.query';

@QueryHandler(GetUsersByTenantQuery)
export class GetUsersByTenantHandler
  implements IQueryHandler<GetUsersByTenantQuery>
{
  constructor() {
    // 构造函数暂时为空，后续可能需要注入依赖
  }

  async execute(query: GetUsersByTenantQuery): Promise<any> {
    try {
      // 这里应该调用实际的用户服务
      // 暂时返回模拟数据
      const users = [
        {
          id: 'user-1',
          username: 'user1',
          email: 'user1@example.com',
          status: 'ACTIVE',
          tenantId: query.tenantId.toString(),
        },
        {
          id: 'user-2',
          username: 'user2',
          email: 'user2@example.com',
          status: 'ACTIVE',
          tenantId: query.tenantId.toString(),
        },
      ];

      return {
        success: true,
        data: users,
        total: users.length,
        page:
          Math.floor(
            (query.options.offset || 0) / (query.options.limit || 20),
          ) + 1,
        size: query.options.limit || 20,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取用户列表失败',
        data: [],
        total: 0,
      };
    }
  }
}
