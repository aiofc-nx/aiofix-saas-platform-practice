/**
 * @description 根据ID获取用户查询处理器
 * @author 江郎
 * @since 2.1.0
 */

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserByIdQuery } from '../get-user-by-id.query';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor() {
    // 构造函数暂时为空，后续可能需要注入依赖
  }

  async execute(query: GetUserByIdQuery): Promise<any> {
    try {
      // 这里应该调用实际的用户服务
      // 暂时返回模拟数据
      const user = {
        id: query.userId.toString(),
        username: 'test_user',
        email: 'test@example.com',
        status: 'ACTIVE',
      };

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取用户失败',
      };
    }
  }
}
