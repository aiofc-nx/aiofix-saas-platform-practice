/**
 * @file index.ts
 * @description 共享领域值对象导出文件
 *
 * 导出所有共享领域层的值对象，供其他模块使用。
 * 这些值对象具有高度通用性，可在多个业务模块中复用。
 */

// 基础值对象和错误类型
export { BaseValueObject, InvalidValueObjectError } from './base.value-object';
export type { ValueObjectSerializable } from './base.value-object';

// 通用值对象
export { Uuid, InvalidUuidError } from './uuid.vo';
export { UserId, InvalidUserIdError } from './user-id.vo';
export { TenantId, InvalidTenantIdError } from './tenant-id.vo';
export { Username, InvalidUsernameException } from './username.vo';
export { Email, InvalidEmailError } from './email.vo';
export { EmailAddress } from './email-address.vo';
export { PhoneNumber } from './phone-number.vo';
export type { PhoneNumberType, PhoneNumberInfo } from './phone-number.vo';

// 租户相关值对象
export { TenantName, InvalidTenantNameError } from './tenant-name.vo';
export { TenantCode, InvalidTenantCodeError } from './tenant-code.vo';
export { TenantDomain, InvalidTenantDomainError } from './tenant-domain.vo';

// 新增通用值对象
export { WebhookUrl } from './webhook-url.vo';
export type { WebhookProtocol, WebhookUrlInfo } from './webhook-url.vo';
export { DeviceToken } from './device-token.vo';
export type { DeviceType, DeviceTokenInfo } from './device-token.vo';
export {
  Password,
  PasswordStrength,
  InvalidPasswordError,
} from './password.vo';
export { AuthToken, TokenType } from './auth-token.vo';

// 新增业务值对象
export { Money, Currency, InvalidMoneyError } from './money.vo';
export type { MoneyConfig } from './money.vo';
export {
  DateRange,
  DateRangeUnit,
  InvalidDateRangeError,
} from './date-range.vo';
export type { DateRangeConfig } from './date-range.vo';

// 缓存装饰器 - 使用缓存模块提供的装饰器
// 注意：缓存装饰器应从缓存模块导入，这里仅作为示例
// export {
//   Cacheable,
//   CacheKey,
//   CacheTTL,
//   CacheOptions,
//   CacheEvict,
//   CacheEvictAll,
// } from '@libs/cache';
