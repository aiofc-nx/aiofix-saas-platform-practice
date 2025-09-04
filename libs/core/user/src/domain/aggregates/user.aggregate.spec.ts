/**
 * @description UserAggregate单元测试
 * @author 江郎
 * @since 2.1.0
 */

import { UserAggregate } from './user.aggregate';
import { UserId, Username, Email, PhoneNumber, TenantId } from '@aiofix/shared';
import { UserType } from '../enums/user-type.enum';
import { UserStatus } from '../enums/user-status.enum';
import { DataPrivacyLevel } from '@aiofix/shared';
import { UserTestFactory } from '../../test/helpers/test-factory';

describe('UserAggregate', () => {
  let userAggregate: UserAggregate;
  let userId: UserId;
  let username: Username;
  let email: Email;
  let tenantId: TenantId;
  let organizationId: TenantId;
  let departmentIds: TenantId[];

  beforeEach(() => {
    userId = UserId.create(UserTestFactory.createUserId());
    username = Username.create(UserTestFactory.createValidUsername());
    email = new Email(UserTestFactory.createValidEmail());
    tenantId = TenantId.create(UserTestFactory.createTenantId());
    organizationId = TenantId.create(UserTestFactory.createOrganizationId());
    departmentIds = [TenantId.create(UserTestFactory.createDepartmentId())];

    userAggregate = UserAggregate.create(
      userId,
      username,
      email,
      tenantId,
      organizationId,
      departmentIds,
      UserType.TENANT_USER,
      DataPrivacyLevel.PROTECTED,
    );
  });

  describe('静态工厂方法', () => {
    describe('create', () => {
      it('应该成功创建用户聚合根', () => {
        expect(userAggregate).toBeDefined();
        expect(userAggregate.user).toBeDefined();
        expect(userAggregate.profile).toBeDefined();
        expect(userAggregate.relationships).toEqual([]);
      });

      it('应该创建正确的用户实体', () => {
        const user = userAggregate.user;
        expect(user.id).toStrictEqual(userId);
        expect(user.username).toBe(username);
        expect(user.email).toBe(email);
        expect(user.tenantId).toBe(tenantId);
        expect(user.organizationId).toBe(organizationId);
        expect(user.departmentIds).toEqual(departmentIds);
        expect(user.userType).toBe(UserType.TENANT_USER);
        expect(user.dataPrivacyLevel).toBe(DataPrivacyLevel.PROTECTED);
      });

      it('应该创建正确的用户档案', () => {
        const profile = userAggregate.profile;
        expect(profile).toBeDefined();
        expect(profile!.displayName).toBe(username.toString());
        expect(profile!.tenantId).toBeDefined();
        expect(profile!.userId).toBeDefined();
      });

      it('应该正确处理可选参数', () => {
        const simpleAggregate = UserAggregate.create(
          userId,
          username,
          email,
          tenantId,
        );

        expect(simpleAggregate.user.organizationId).toBeUndefined();
        expect(simpleAggregate.user.departmentIds).toEqual([]);
        expect(simpleAggregate.user.userType).toBe(UserType.TENANT_USER);
        expect(simpleAggregate.user.dataPrivacyLevel).toBe(
          DataPrivacyLevel.PROTECTED,
        );
      });
    });

    describe('createPlatformUser', () => {
      it('应该成功创建平台用户聚合根', () => {
        const platformAggregate = UserAggregate.createPlatformUser(
          userId,
          username,
          email,
        );

        expect(platformAggregate.user.userType).toBe(UserType.PLATFORM_USER);
        expect(platformAggregate.user.tenantId).toBeDefined();
        expect(platformAggregate.user.organizationId).toBeUndefined();
        expect(platformAggregate.user.departmentIds).toEqual([]);
      });
    });

    describe('createTenantUser', () => {
      it('应该成功创建租户用户聚合根', () => {
        const tenantAggregate = UserAggregate.createTenantUser(
          userId,
          username,
          email,
          tenantId,
          organizationId,
          departmentIds,
        );

        expect(tenantAggregate.user.userType).toBe(UserType.TENANT_USER);
        expect(tenantAggregate.user.tenantId).toBe(tenantId);
        expect(tenantAggregate.user.organizationId).toBe(organizationId);
        expect(tenantAggregate.user.departmentIds).toEqual(departmentIds);
      });
    });
  });

  describe('属性访问器', () => {
    it('应该正确返回用户实体', () => {
      expect(userAggregate.user).toBeDefined();
      expect(userAggregate.user.id).toStrictEqual(userId);
    });

    it('应该正确返回用户档案', () => {
      expect(userAggregate.profile).toBeDefined();
      expect(userAggregate.profile!.displayName).toBe(username.toString());
    });

    it('应该正确返回用户关系列表', () => {
      expect(userAggregate.relationships).toEqual([]);
    });

    it('应该正确返回未提交事件列表', () => {
      expect(userAggregate.uncommittedEvents).toEqual([]);
    });
  });

  describe('业务方法', () => {
    describe('changeEmail', () => {
      it('应该成功更改用户邮箱', () => {
        const newEmail = new Email('newemail@example.com');
        userAggregate.changeEmail(newEmail);

        expect(userAggregate.user.email).toBe(newEmail);
      });

      it('应该验证新邮箱格式', () => {
        expect(() => {
          userAggregate.changeEmail(new Email('invalid-email'));
        }).toThrow();
      });
    });

    describe('changePhone', () => {
      it('应该成功更改用户电话', () => {
        const newPhone = PhoneNumber.create('+8612345678901');
        userAggregate.changePhone(newPhone);

        expect(userAggregate.user.phone).toBe(newPhone);
      });

      it('应该验证新电话号码格式', () => {
        expect(() => {
          userAggregate.changePhone(PhoneNumber.create('invalid-phone'));
        }).toThrow();
      });
    });

    describe('activate', () => {
      it('应该成功激活用户', () => {
        userAggregate.deactivate();
        userAggregate.activate();

        expect(userAggregate.user.status).toBe(UserStatus.ACTIVE);
      });

      it('如果用户已经是激活状态，应该不做任何改变', () => {
        userAggregate.activate();

        expect(userAggregate.user.status).toBe(UserStatus.ACTIVE);
      });
    });

    describe('deactivate', () => {
      it('应该成功停用用户', () => {
        userAggregate.deactivate();

        expect(userAggregate.user.status).toBe(UserStatus.INACTIVE);
      });

      it('如果用户已经是停用状态，应该不做任何改变', () => {
        userAggregate.deactivate();
        userAggregate.deactivate();

        expect(userAggregate.user.status).toBe(UserStatus.INACTIVE);
      });
    });

    describe('suspend', () => {
      it('应该成功暂停用户', () => {
        userAggregate.suspend();

        expect(userAggregate.user.status).toBe(UserStatus.SUSPENDED);
      });
    });

    describe('delete', () => {
      it('应该成功删除用户', () => {
        userAggregate.delete();

        expect(userAggregate.user.status).toBe(UserStatus.DELETED);
      });
    });

    describe('updateProfile', () => {
      it('应该成功更新用户档案', () => {
        const profileData = {
          displayName: 'Updated Name',
          bio: 'Updated bio',
          location: 'Updated location',
        };

        userAggregate.updateProfile(profileData);

        expect(userAggregate.profile!.displayName).toBe('Updated Name');
        expect(userAggregate.profile!.bio).toBe('Updated bio');
        expect(userAggregate.profile!.location).toBe('Updated location');
      });

      it('应该只更新提供的字段', () => {
        const originalBio = userAggregate.profile!.bio;
        const originalLocation = userAggregate.profile!.location;

        userAggregate.updateProfile({
          displayName: 'New Name',
        });

        expect(userAggregate.profile!.displayName).toBe('New Name');
        expect(userAggregate.profile!.bio).toBe(originalBio);
        expect(userAggregate.profile!.location).toBe(originalLocation);
      });
    });

    describe('addRelationship', () => {
      it('应该成功添加用户关系', () => {
        const relationship = userAggregate.createRelationship(
          'target-123',
          'TENANT_MEMBER',
          'ACTIVE',
        );

        userAggregate.addRelationship(relationship);

        expect(userAggregate.relationships).toHaveLength(1);
        expect(userAggregate.relationships[0]).toBe(relationship);
      });

      it('应该避免重复关系', () => {
        const relationship = userAggregate.createRelationship(
          'target-123',
          'TENANT_MEMBER',
          'ACTIVE',
        );

        userAggregate.addRelationship(relationship);
        userAggregate.addRelationship(relationship);

        expect(userAggregate.relationships).toHaveLength(1);
      });
    });

    describe('removeRelationship', () => {
      it('应该成功删除用户关系', () => {
        const relationship = userAggregate.createRelationship(
          'target-123',
          'TENANT_MEMBER',
          'ACTIVE',
        );

        userAggregate.addRelationship(relationship);
        userAggregate.removeRelationship(relationship.id.toString());

        expect(userAggregate.relationships).toHaveLength(0);
      });

      it('应该处理删除不存在的关系', () => {
        expect(() => {
          userAggregate.removeRelationship('nonexistent-id');
        }).not.toThrow();
      });
    });

    describe('createRelationship', () => {
      it('应该成功创建用户关系', () => {
        const relationship = userAggregate.createRelationship(
          'target-123',
          'TENANT_MEMBER',
          'ACTIVE',
        );

        expect(relationship).toBeDefined();
        expect(relationship.userId).toBe(userId.toString());
        expect(relationship.targetId).toBe('target-123');
        expect(relationship.relationshipType).toBe('TENANT_MEMBER');
        expect(relationship.relationshipStatus).toBe('ACTIVE');
      });
    });

    describe('findRelationship', () => {
      it('应该成功查找用户关系', () => {
        const relationship = userAggregate.createRelationship(
          'target-123',
          'TENANT_MEMBER',
          'ACTIVE',
        );

        userAggregate.addRelationship(relationship);
        const found = userAggregate.findRelationship('target-123');

        expect(found).toBe(relationship);
      });

      it('应该返回undefined当关系不存在时', () => {
        const found = userAggregate.findRelationship('nonexistent-target');

        expect(found).toBeUndefined();
      });
    });
  });

  describe('状态检查方法', () => {
    it('应该正确检查用户是否激活', () => {
      expect(userAggregate.isActive()).toBe(true);

      userAggregate.deactivate();
      expect(userAggregate.isActive()).toBe(false);
    });

    it('应该正确检查用户是否为平台用户', () => {
      expect(userAggregate.isPlatformUser()).toBe(false);

      const platformAggregate = UserAggregate.createPlatformUser(
        userId,
        username,
        email,
      );
      expect(platformAggregate.isPlatformUser()).toBe(true);
    });

    it('应该正确检查用户是否为租户用户', () => {
      expect(userAggregate.isTenantUser()).toBe(true);

      const platformAggregate = UserAggregate.createPlatformUser(
        userId,
        username,
        email,
      );
      expect(platformAggregate.isTenantUser()).toBe(false);
    });
  });

  describe('事件管理', () => {
    it('应该正确添加未提交事件', () => {
      const event = {
        type: 'UserCreated',
        data: { userId: userId.toString() },
      };
      userAggregate.addUncommittedEvent(event);

      expect(userAggregate.uncommittedEvents).toContain(event);
    });

    it('应该正确标记事件为已提交', () => {
      const event = {
        type: 'UserCreated',
        data: { userId: userId.toString() },
      };
      userAggregate.addUncommittedEvent(event);

      expect(userAggregate.uncommittedEvents).toHaveLength(1);

      userAggregate.markEventsAsCommitted();
      expect(userAggregate.uncommittedEvents).toHaveLength(0);
    });
  });

  describe('数据访问控制', () => {
    it('应该正确实现数据访问控制', () => {
      expect(userAggregate.user.canAccess).toBeDefined();
      expect(typeof userAggregate.user.canAccess).toBe('function');
    });
  });

  describe('边界情况', () => {
    it('应该处理空部门ID列表', () => {
      const aggregateWithoutDepartments = UserAggregate.create(
        userId,
        username,
        email,
        tenantId,
      );

      expect(aggregateWithoutDepartments.user.departmentIds).toEqual([]);
    });

    it('应该处理未定义的组织ID', () => {
      const aggregateWithoutOrganization = UserAggregate.create(
        userId,
        username,
        email,
        tenantId,
      );

      expect(aggregateWithoutOrganization.user.organizationId).toBeUndefined();
    });

    it('应该处理空关系列表', () => {
      expect(userAggregate.relationships).toEqual([]);
    });

    it('应该处理空事件列表', () => {
      expect(userAggregate.uncommittedEvents).toEqual([]);
    });
  });

  describe('错误处理', () => {
    it('应该验证用户ID不能为空', () => {
      expect(() => {
        UserAggregate.create(null as unknown, username, email, tenantId);
      }).toThrow();
    });

    it('应该验证用户名不能为空', () => {
      expect(() => {
        UserAggregate.create(userId, null as unknown, email, tenantId);
      }).toThrow();
    });

    it('应该验证邮箱不能为空', () => {
      expect(() => {
        UserAggregate.create(userId, username, null as unknown, tenantId);
      }).toThrow();
    });

    it('应该验证租户ID不能为空', () => {
      expect(() => {
        UserAggregate.create(userId, username, email, null as unknown);
      }).toThrow();
    });
  });
});
