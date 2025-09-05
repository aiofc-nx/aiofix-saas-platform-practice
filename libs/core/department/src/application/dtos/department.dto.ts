/**
 * @class DepartmentDto
 * @description 部门数据传输对象
 *
 * 功能与职责：
 * 1. 定义部门数据的传输格式
 * 2. 提供部门信息的标准化表示
 * 3. 支持部门数据的序列化和反序列化
 *
 * @example
 * ```typescript
 * const departmentDto = new DepartmentDto(
 *   'dept-123',
 *   '技术部',
 *   'TECH',
 *   'BUSINESS',
 *   'ACTIVE',
 *   'tenant-456',
 *   'org-789'
 * );
 * ```
 * @since 1.0.0
 */
export class DepartmentDto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly code: string,
    public readonly type: string,
    public readonly status: string,
    public readonly tenantId: string,
    public readonly organizationId: string,
    public readonly description?: string,
    public readonly parentDepartmentId?: string,
    public readonly managerId?: string,
    public readonly level?: number,
    public readonly path?: string,
    public readonly createdBy?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  /**
   * 从领域实体创建DTO
   * @param entity 部门实体
   * @returns 部门DTO
   */
  static fromEntity(entity: {
    id: { toString(): string };
    name: { toString(): string };
    code: { toString(): string };
    type: string;
    status: string;
    tenantId: { toString(): string };
    organizationId?: { toString(): string };
    description?: string;
    parentDepartmentId?: { toString(): string };
    managerId?: string;
    level?: number;
    path?: string;
    createdBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): DepartmentDto {
    return new DepartmentDto(
      entity.id.toString(),
      entity.name.toString(),
      entity.code.toString(),
      entity.type,
      entity.status,
      entity.tenantId.toString(),
      entity.organizationId?.toString() ?? '',
      entity.description,
      entity.parentDepartmentId?.toString(),
      entity.managerId,
      entity.level,
      entity.path,
      entity.createdBy,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  /**
   * 转换为JSON对象
   * @returns JSON对象
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      type: this.type,
      status: this.status,
      tenantId: this.tenantId,
      organizationId: this.organizationId,
      description: this.description,
      parentDepartmentId: this.parentDepartmentId,
      managerId: this.managerId,
      level: this.level,
      path: this.path,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
