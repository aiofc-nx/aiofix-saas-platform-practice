/**
 * @description 组织未找到异常
 * @author 江郎
 * @since 2.1.0
 */

import { DomainException } from '@aiofix/shared';

export class OrganizationNotFoundException extends DomainException {
  constructor(organizationId: string) {
    super(
      `Organization with ID ${organizationId} not found`,
      'ORGANIZATION_NOT_FOUND',
    );
    this.name = 'OrganizationNotFoundException';
  }
}
