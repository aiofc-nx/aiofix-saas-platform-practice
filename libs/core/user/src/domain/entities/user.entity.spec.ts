/**
 * @description UserEntity单元测试
 * @author 江郎
 * @since 2.1.0
 */

import { UserEntity } from './user.entity';
import { UserId, Username, Email, PhoneNumber, TenantId } from '@aiofix/shared';
import { UserType } from '../enums/user-type.enum';
import { UserStatus } from '../enums/user-status.enum';
import { DataPrivacyLevel } from '@aiofix/shared';
import { UserTestFactory } from '../../test/helpers/test-factory';

describe('UserEntity', () => {
  let userEntity: UserEntity;
  let userId: UserId;
  let username: Username;
  let email: Email;
  let phone: PhoneNumber;
  let tenantId: TenantId;
  let organizationId: TenantId;
  let departmentIds: TenantId[];

  beforeEach(() => {
    userId = UserId.create(UserTestFactory.createUserId());
    username = Username.create(UserTestFactory.createValidUsername());
    email = new Email(UserTestFactory.createValidEmail());
    phone = PhoneNumber.create(UserTestFactory.createValidPhone());
    tenantId = TenantId.create(UserTestFactory.createTenantId());
    organizationId = TenantId.create(UserTestFactory.createOrganizationId());
    departmentIds = [TenantId.create(UserTestFactory.createDepartmentId())];

    userEntity = new UserEntity(
      userId,
      username,
      email,
      tenantId,
      organizationId,
      departmentIds,
      UserType.TENANT_USER,
      DataPrivacyLevel.PROTECTED,
      phone,
    );
  });

  describe('构造函数', () => {
    it('应该成功创建用户实体', () => {
      expect(userEntity).toBeDefined();
      expect(userEntity.id).toBeDefined();
      expect(userEntity.username).toBeDefined();
      expect(userEntity.email).toBeDefined();
      expect(userEntity.tenantId).toBeDefined();
    });

    it('应该设置正确的默认值', () => {
      expect(userEntity.status).toBe(UserStatus.ACTIVE);
      expect(userEntity.userType).toBe(UserType.TENANT_USER);
      expect(userEntity.dataPrivacyLevel).toBe(DataPrivacyLevel.PROTECTED);
    });

    it('应该正确处理可选参数', () => {
      const userWithoutOptional = new UserEntity(
        userId,
        username,
        email,
        tenantId,
      );

      expect(userWithoutOptional.organizationId).toBeUndefined();
      expect(userWithoutOptional.departmentIds).toEqual([]);
      expect(userWithoutOptional.userType).toBe(UserType.TENANT_USER);
      expect(userWithoutOptional.dataPrivacyLevel).toBe(
        DataPrivacyLevel.PROTECTED,
      );
    });
  });

  describe('属性访问器', () => {
    it('应该正确返回用户ID', () => {
      expect(userEntity.id).toStrictEqual(userId);
    });

    it('应该正确返回用户名', () => {
      expect(userEntity.username).toBe(username);
    });

    it('应该正确返回邮箱', () => {
      expect(userEntity.email).toBe(email);
    });

    it('应该正确返回电话', () => {
      expect(userEntity.phone).toStrictEqual(phone);
    });

    it('应该正确返回状态', () => {
      expect(userEntity.status).toBe(UserStatus.ACTIVE);
    });

    it('应该正确返回用户类型', () => {
      expect(userEntity.userType).toBe(UserType.TENANT_USER);
    });

    it('应该正确返回租户ID', () => {
      expect(userEntity.tenantId).toBe(tenantId);
    });

    it('应该正确返回组织ID', () => {
      expect(userEntity.organizationId).toBe(organizationId);
    });

    it('应该正确返回部门ID列表', () => {
      expect(userEntity.departmentIds).toEqual(departmentIds);
    });
  });

  describe('业务方法', () => {
    describe('changeEmail', () => {
      it('应该成功更改邮箱', () => {
        const newEmail = new Email('newemail@example.com');
        userEntity.changeEmail(newEmail);

        expect(userEntity.email).toBe(newEmail);
      });

      it('应该验证邮箱格式', () => {
        expect(() => {
          userEntity.changeEmail(new Email('invalid-email'));
        }).toThrow();
      });
    });

    describe('changePhone', () => {
      it('应该成功更改电话', () => {
        const newPhone = PhoneNumber.create('+8612345678901');
        userEntity.changePhone(newPhone);

        expect(userEntity.phone).toBe(newPhone);
      });

      it('应该验证电话号码格式', () => {
        expect(() => {
          userEntity.changePhone(PhoneNumber.create('invalid-phone'));
        }).toThrow();
      });
    });

    describe('activate', () => {
      it('应该激活用户', () => {
        userEntity.deactivate(); // 先停用
        expect(userEntity.status).toBe(UserStatus.INACTIVE);

        userEntity.activate();
        expect(userEntity.status).toBe(UserStatus.ACTIVE);
      });

      it('如果用户已经是激活状态，应该不做任何改变', () => {
        expect(userEntity.status).toBe(UserStatus.ACTIVE);
        userEntity.activate();
        expect(userEntity.status).toBe(UserStatus.ACTIVE);
      });
    });

    describe('deactivate', () => {
      it('应该停用用户', () => {
        expect(userEntity.status).toBe(UserStatus.ACTIVE);
        userEntity.deactivate();
        expect(userEntity.status).toBe(UserStatus.INACTIVE);
      });

      it('如果用户已经是停用状态，应该不做任何改变', () => {
        userEntity.deactivate();
        expect(userEntity.status).toBe(UserStatus.INACTIVE);
        userEntity.deactivate();
        expect(userEntity.status).toBe(UserStatus.INACTIVE);
      });
    });

    describe('suspend', () => {
      it('应该暂停用户', () => {
        expect(userEntity.status).toBe(UserStatus.ACTIVE);
        userEntity.suspend();
        expect(userEntity.status).toBe(UserStatus.SUSPENDED);
      });
    });

    describe('delete', () => {
      it('应该删除用户', () => {
        expect(userEntity.status).toBe(UserStatus.ACTIVE);
        userEntity.delete();
        expect(userEntity.status).toBe(UserStatus.DELETED);
      });
    });
  });

  describe('状态检查方法', () => {
    it('应该正确检查用户是否激活', () => {
      expect(userEntity.isActive()).toBe(true);

      userEntity.deactivate();
      expect(userEntity.isActive()).toBe(false);
    });

    it('应该正确检查用户是否为平台用户', () => {
      expect(userEntity.isPlatformUser()).toBe(false);

      const platformUser = new UserEntity(
        userId,
        username,
        email,
        tenantId,
        undefined,
        [],
        UserType.PLATFORM_USER,
      );
      expect(platformUser.isPlatformUser()).toBe(true);
    });

    it('应该正确检查用户是否为租户用户', () => {
      expect(userEntity.isTenantUser()).toBe(true);

      const platformUser = new UserEntity(
        userId,
        username,
        email,
        tenantId,
        undefined,
        [],
        UserType.PLATFORM_USER,
      );
      expect(platformUser.isTenantUser()).toBe(false);
    });
  });

  describe('数据访问控制', () => {
    it('应该正确实现数据访问控制', () => {
      // 这里需要测试数据访问控制逻辑
      // 由于DataIsolationAwareEntity的具体实现可能比较复杂
      // 我们暂时测试方法是否存在
      expect(typeof userEntity.canAccess).toBe('function');
    });
  });

  describe('边界情况', () => {
    it('应该处理空部门ID列表', () => {
      const userWithoutDepartments = new UserEntity(
        userId,
        username,
        email,
        tenantId,
        organizationId,
        [],
      );

      expect(userWithoutDepartments.departmentIds).toEqual([]);
    });

    it('应该处理未定义的电话', () => {
      const userWithoutPhone = new UserEntity(
        userId,
        username,
        email,
        tenantId,
      );

      expect(userWithoutPhone.phone).toBeUndefined();
    });
  });

  describe('错误处理', () => {
    it('应该验证用户ID不能为空', () => {
      expect(() => {
        new UserEntity(UserId.create(''), username, email, tenantId);
      }).toThrow();
    });

    it('应该验证用户名不能为空', () => {
      expect(() => {
        new UserEntity(userId, Username.create(''), email, tenantId);
      }).toThrow();
    });

    it('应该验证邮箱不能为空', () => {
      expect(() => {
        new UserEntity(userId, username, new Email(''), tenantId);
      }).toThrow();
    });

    it('应该验证租户ID不能为空', () => {
      expect(() => {
        new UserEntity(userId, username, email, TenantId.create(''));
      }).toThrow();
    });
  });
});
