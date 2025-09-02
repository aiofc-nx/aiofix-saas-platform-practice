/**
 * @description User领域类型定义索引文件
 * @author 技术架构师
 * @since 2.1.0
 */

// 导出用户相关的类型定义
export interface UserRelationshipData {
  userId: string;
  targetEntityId: string;
  targetEntityType: string;
  relationshipType: string;
  status: string;
  permissions: string[];
  startDate: Date;
  endDate?: Date;
  description?: string;
}
