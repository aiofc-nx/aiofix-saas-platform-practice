/**
 * @description 组织数据传输对象
 * @author 江郎
 * @since 2.1.0
 */

export class OrganizationDto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly code: string,
    public readonly type: string,
    public readonly status: string,
    public readonly tenantId: string,
    public readonly description?: string,
    public readonly parentOrganizationId?: string,
    public readonly managerId?: string,
    public readonly organizationId?: string,
    public readonly departmentIds: string[] = [],
    public readonly dataPrivacyLevel: string = 'PROTECTED',
    public readonly metadata?: Record<string, unknown>,
    public readonly createdBy: string = '',
    public readonly updatedBy?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly version: number = 1,
  ) {}
}
