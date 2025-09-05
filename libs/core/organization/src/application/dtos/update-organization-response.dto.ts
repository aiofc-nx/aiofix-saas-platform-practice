/**
 * @description 更新组织响应DTO
 * @author 江郎
 * @since 2.1.0
 */

export class UpdateOrganizationResponse {
  constructor(
    public readonly organizationId: string,
    public readonly success: boolean,
    public readonly message: string = '组织更新成功',
  ) {}
}
