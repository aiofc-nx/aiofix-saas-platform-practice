/**
 * @description 创建组织响应DTO
 * @author 江郎
 * @since 2.1.0
 */

export class CreateOrganizationResponse {
  constructor(
    public readonly organizationId: string,
    public readonly success: boolean,
    public readonly name: string,
    public readonly code: string,
    public readonly type: string,
    public readonly tenantId: string,
    public readonly message: string = '组织创建成功',
  ) {}
}
