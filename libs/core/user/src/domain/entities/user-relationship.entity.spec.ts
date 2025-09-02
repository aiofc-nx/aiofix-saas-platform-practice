/**
 * @description UserRelationshipEntity单元测试
 * @author 技术架构师
 * @since 2.1.0
 */

import { UserRelationshipEntity, RelationshipType, RelationshipStatus } from './user-relationship.entity';
import { DataIsolationLevel, DataPrivacyLevel } from '@aiofix/shared';
import { UserTestFactory } from '../../test/helpers/test-factory';

describe('UserRelationshipEntity', () => {
  let userRelationshipEntity: UserRelationshipEntity;
  let relationshipId: string;
  let userId: string;
  let targetId: string;
  let relationshipType: RelationshipType;
  let relationshipStatus: RelationshipStatus;
  let tenantId: string;
  let organizationId: string;
  let departmentIds: string[];

  beforeEach(() => {
    relationshipId = UserTestFactory.createUserId();
    userId = UserTestFactory.createUserId();
    targetId = UserTestFactory.createTenantId();
    relationshipType = RelationshipType.TENANT_MEMBER;
    relationshipStatus = RelationshipStatus.ACTIVE;
    tenantId = UserTestFactory.createTenantId();
    organizationId = UserTestFactory.createOrganizationId();
    departmentIds = [UserTestFactory.createDepartmentId()];

    userRelationshipEntity = new UserRelationshipEntity(
      relationshipId,
      userId,
      targetId,
      relationshipType,
      relationshipStatus,
      tenantId,
      organizationId,
      departmentIds,
      DataPrivacyLevel.PROTECTED
    );
  });

  describe('构造函数', () => {
    it('应该成功创建用户关系实体', () => {
      expect(userRelationshipEntity).toBeDefined();
      expect(userRelationshipEntity.id).toBeDefined();
      expect(userRelationshipEntity.userId).toBe(userId);
      expect(userRelationshipEntity.targetId).toBe(targetId);
      expect(userRelationshipEntity.relationshipType).toBe(relationshipType);
      expect(userRelationshipEntity.relationshipStatus).toBe(relationshipStatus);
    });

    it('应该设置正确的默认值', () => {
      expect(userRelationshipEntity.permissions).toEqual([]);
      expect(userRelationshipEntity.metadata).toEqual({});
      expect(userRelationshipEntity.dataPrivacyLevel).toBe(DataPrivacyLevel.PROTECTED);
    });

    it('应该正确处理可选参数', () => {
      const relationshipWithoutOptional = new UserRelationshipEntity(
        relationshipId,
        userId,
        targetId,
        relationshipType,
        relationshipStatus,
        tenantId
      );

      expect(relationshipWithoutOptional.organizationId).toBeUndefined();
      expect(relationshipWithoutOptional.departmentIds).toEqual([]);
      expect(relationshipWithoutOptional.dataPrivacyLevel).toBe(DataPrivacyLevel.PROTECTED);
    });
  });

  describe('属性访问器', () => {
    it('应该正确返回关系ID', () => {
      expect(userRelationshipEntity.id).toBeDefined();
    });

    it('应该正确返回用户ID', () => {
      expect(userRelationshipEntity.userId).toBe(userId);
    });

    it('应该正确返回目标ID', () => {
      expect(userRelationshipEntity.targetId).toBe(targetId);
    });

    it('应该正确返回关系类型', () => {
      expect(userRelationshipEntity.relationshipType).toBe(relationshipType);
    });

    it('应该正确返回关系状态', () => {
      expect(userRelationshipEntity.relationshipStatus).toBe(relationshipStatus);
    });

    it('应该正确返回权限列表', () => {
      expect(userRelationshipEntity.permissions).toEqual([]);
    });

    it('应该正确返回元数据', () => {
      expect(userRelationshipEntity.metadata).toEqual({});
    });

    it('应该正确返回租户ID', () => {
      expect(userRelationshipEntity.tenantId).toBeDefined();
    });

    it('应该正确返回组织ID', () => {
      expect(userRelationshipEntity.organizationId).toBeDefined();
    });

    it('应该正确返回部门ID列表', () => {
      expect(userRelationshipEntity.departmentIds).toEqual(departmentIds);
    });
  });

  describe('业务方法', () => {
    describe('activate', () => {
      it('应该成功激活关系', () => {
        userRelationshipEntity.deactivate();
        userRelationshipEntity.activate();

        expect(userRelationshipEntity.relationshipStatus).toBe(RelationshipStatus.ACTIVE);
      });

      it('如果关系已经是激活状态，应该不做任何改变', () => {
        userRelationshipEntity.activate();

        expect(userRelationshipEntity.relationshipStatus).toBe(RelationshipStatus.ACTIVE);
      });
    });

    describe('deactivate', () => {
      it('应该成功停用关系', () => {
        userRelationshipEntity.deactivate();

        expect(userRelationshipEntity.relationshipStatus).toBe(RelationshipStatus.INACTIVE);
      });

      it('如果关系已经是停用状态，应该不做任何改变', () => {
        userRelationshipEntity.deactivate();
        userRelationshipEntity.deactivate();

        expect(userRelationshipEntity.relationshipStatus).toBe(RelationshipStatus.INACTIVE);
      });
    });

    describe('changeRelationshipType', () => {
      it('应该成功更改关系类型', () => {
        const newType = RelationshipType.ORGANIZATION_MEMBER;
        userRelationshipEntity.changeRelationshipType(newType);

        expect(userRelationshipEntity.relationshipType).toBe(newType);
      });

      it('应该验证关系类型不能为空', () => {
        expect(() => {
          userRelationshipEntity.changeRelationshipType(null as any);
        }).toThrow();
      });
    });

    describe('grantPermission', () => {
      it('应该成功授予权限', () => {
        userRelationshipEntity.grantPermission('READ');
        userRelationshipEntity.grantPermission('WRITE');

        expect(userRelationshipEntity.permissions).toContain('READ');
        expect(userRelationshipEntity.permissions).toContain('WRITE');
      });

      it('应该避免重复权限', () => {
        userRelationshipEntity.grantPermission('READ');
        userRelationshipEntity.grantPermission('READ');

        expect(userRelationshipEntity.permissions.filter(p => p === 'READ')).toHaveLength(1);
      });

      it('应该验证权限不能为空', () => {
        expect(() => {
          userRelationshipEntity.grantPermission('');
        }).toThrow();
      });
    });

    describe('revokePermission', () => {
      it('应该成功撤销权限', () => {
        userRelationshipEntity.grantPermission('READ');
        userRelationshipEntity.grantPermission('WRITE');
        userRelationshipEntity.revokePermission('READ');

        expect(userRelationshipEntity.permissions).not.toContain('READ');
        expect(userRelationshipEntity.permissions).toContain('WRITE');
      });

      it('应该处理撤销不存在的权限', () => {
        expect(() => {
          userRelationshipEntity.revokePermission('NONEXISTENT');
        }).not.toThrow();
      });

      it('应该验证权限不能为空', () => {
        expect(() => {
          userRelationshipEntity.revokePermission('');
        }).toThrow();
      });
    });

    describe('hasPermission', () => {
      it('应该正确检查权限存在性', () => {
        userRelationshipEntity.grantPermission('READ');

        expect(userRelationshipEntity.hasPermission('READ')).toBe(true);
        expect(userRelationshipEntity.hasPermission('WRITE')).toBe(false);
      });

      it('应该验证权限参数不能为空', () => {
        expect(() => {
          userRelationshipEntity.hasPermission('');
        }).toThrow();
      });
    });

    describe('setMetadata', () => {
      it('应该成功设置元数据', () => {
        const metadata = { key1: 'value1', key2: 'value2' };
        userRelationshipEntity.setMetadata(metadata);

        expect(userRelationshipEntity.metadata).toEqual(metadata);
      });

      it('应该覆盖已存在的元数据', () => {
        userRelationshipEntity.setMetadata({ key1: 'value1' });
        userRelationshipEntity.setMetadata({ key2: 'value2' });

        expect(userRelationshipEntity.metadata).toEqual({ key2: 'value2' });
      });

      it('应该验证元数据不能为空', () => {
        expect(() => {
          userRelationshipEntity.setMetadata(null as any);
        }).toThrow();
      });
    });

    describe('getMetadata', () => {
      it('应该成功获取元数据', () => {
        const metadata = { key1: 'value1' };
        userRelationshipEntity.setMetadata(metadata);

        expect(userRelationshipEntity.getMetadata('key1')).toBe('value1');
      });

      it('应该返回默认值当元数据不存在时', () => {
        const value = userRelationshipEntity.getMetadata('nonexistent', 'default');

        expect(value).toBe('default');
      });

      it('应该返回undefined当元数据不存在且无默认值时', () => {
        const value = userRelationshipEntity.getMetadata('nonexistent');

        expect(value).toBeUndefined();
      });
    });

    describe('updateMetadata', () => {
      it('应该成功更新元数据', () => {
        userRelationshipEntity.setMetadata({ key1: 'value1' });
        userRelationshipEntity.updateMetadata({ key2: 'value2' });

        expect(userRelationshipEntity.metadata).toEqual({
          key1: 'value1',
          key2: 'value2'
        });
      });

      it('应该只更新提供的字段', () => {
        userRelationshipEntity.setMetadata({ key1: 'value1', key2: 'value2' });
        userRelationshipEntity.updateMetadata({ key1: 'updated' });

        expect(userRelationshipEntity.metadata).toEqual({
          key1: 'updated',
          key2: 'value2'
        });
      });
    });

    describe('removeMetadata', () => {
      it('应该成功删除元数据', () => {
        userRelationshipEntity.setMetadata({ key1: 'value1', key2: 'value2' });
        userRelationshipEntity.removeMetadata('key1');

        expect(userRelationshipEntity.metadata).toEqual({ key2: 'value2' });
      });

      it('应该处理删除不存在的元数据', () => {
        expect(() => {
          userRelationshipEntity.removeMetadata('nonexistent');
        }).not.toThrow();
      });
    });
  });

  describe('静态工厂方法', () => {
    describe('createTenantMember', () => {
      it('应该创建租户成员关系', () => {
        const tenantMember = UserRelationshipEntity.createTenantMember(
          relationshipId,
          userId,
          targetId,
          tenantId
        );

        expect(tenantMember.relationshipType).toBe(RelationshipType.TENANT_MEMBER);
        expect(tenantMember.relationshipStatus).toBe(RelationshipStatus.ACTIVE);
        expect(tenantMember.targetId).toBe(targetId);
      });
    });

    describe('createOrganizationMember', () => {
      it('应该创建组织成员关系', () => {
        const orgMember = UserRelationshipEntity.createOrganizationMember(
          relationshipId,
          userId,
          targetId,
          tenantId,
          organizationId
        );

        expect(orgMember.relationshipType).toBe(RelationshipType.ORGANIZATION_MEMBER);
        expect(orgMember.relationshipStatus).toBe(RelationshipStatus.ACTIVE);
        expect(orgMember.organizationId).toBe(organizationId);
      });
    });

    describe('createDepartmentMember', () => {
      it('应该创建部门成员关系', () => {
        const deptMember = UserRelationshipEntity.createDepartmentMember(
          relationshipId,
          userId,
          targetId,
          tenantId,
          organizationId,
          departmentIds
        );

        expect(deptMember.relationshipType).toBe(RelationshipType.DEPARTMENT_MEMBER);
        expect(deptMember.relationshipStatus).toBe(RelationshipStatus.ACTIVE);
        expect(deptMember.departmentIds).toEqual(departmentIds);
      });
    });

    describe('createTenantAdmin', () => {
      it('应该创建租户管理员关系', () => {
        const tenantAdmin = UserRelationshipEntity.createTenantAdmin(
          relationshipId,
          userId,
          targetId,
          tenantId
        );

        expect(tenantAdmin.relationshipType).toBe(RelationshipType.TENANT_ADMIN);
        expect(tenantAdmin.relationshipStatus).toBe(RelationshipStatus.ACTIVE);
      });
    });

    describe('createOrganizationAdmin', () => {
      it('应该创建组织管理员关系', () => {
        const orgAdmin = UserRelationshipEntity.createOrganizationAdmin(
          relationshipId,
          userId,
          targetId,
          tenantId,
          organizationId
        );

        expect(orgAdmin.relationshipType).toBe(RelationshipType.ORGANIZATION_ADMIN);
        expect(orgAdmin.relationshipStatus).toBe(RelationshipStatus.ACTIVE);
      });
    });

    describe('createDepartmentAdmin', () => {
      it('应该创建部门管理员关系', () => {
        const deptAdmin = UserRelationshipEntity.createDepartmentAdmin(
          relationshipId,
          userId,
          targetId,
          tenantId,
          organizationId,
          departmentIds
        );

        expect(deptAdmin.relationshipType).toBe(RelationshipType.DEPARTMENT_ADMIN);
        expect(deptAdmin.relationshipStatus).toBe(RelationshipStatus.ACTIVE);
      });
    });

    describe('createTenantOwner', () => {
      it('应该创建租户所有者关系', () => {
        const tenantOwner = UserRelationshipEntity.createTenantOwner(
          relationshipId,
          userId,
          targetId,
          tenantId
        );

        expect(tenantOwner.relationshipType).toBe(RelationshipType.TENANT_OWNER);
        expect(tenantOwner.relationshipStatus).toBe(RelationshipStatus.ACTIVE);
      });
    });
  });

  describe('数据访问控制', () => {
    it('应该正确实现数据访问控制', () => {
      expect(userRelationshipEntity.canAccess).toBeDefined();
      expect(typeof userRelationshipEntity.canAccess).toBe('function');
    });
  });

  describe('边界情况', () => {
    it('应该处理空部门ID列表', () => {
      const relationshipWithoutDepartments = new UserRelationshipEntity(
        relationshipId,
        userId,
        targetId,
        relationshipType,
        relationshipStatus,
        tenantId
      );

      expect(relationshipWithoutDepartments.departmentIds).toEqual([]);
    });

    it('应该处理未定义的组织ID', () => {
      const relationshipWithoutOrganization = new UserRelationshipEntity(
        relationshipId,
        userId,
        targetId,
        relationshipType,
        relationshipStatus,
        tenantId
      );

      expect(relationshipWithoutOrganization.organizationId).toBeUndefined();
    });

    it('应该处理空权限列表', () => {
      expect(userRelationshipEntity.permissions).toEqual([]);
    });

    it('应该处理空元数据', () => {
      expect(userRelationshipEntity.metadata).toEqual({});
    });
  });

  describe('错误处理', () => {
    it('应该验证关系ID不能为空', () => {
      expect(() => {
        new UserRelationshipEntity('', userId, targetId, relationshipType, relationshipStatus, tenantId);
      }).toThrow();
    });

    it('应该验证用户ID不能为空', () => {
      expect(() => {
        new UserRelationshipEntity(relationshipId, '', targetId, relationshipType, relationshipStatus, tenantId);
      }).toThrow();
    });

    it('应该验证目标ID不能为空', () => {
      expect(() => {
        new UserRelationshipEntity(relationshipId, userId, '', relationshipType, relationshipStatus, tenantId);
      }).toThrow();
    });

    it('应该验证关系类型不能为空', () => {
      expect(() => {
        new UserRelationshipEntity(relationshipId, userId, targetId, null as any, relationshipStatus, tenantId);
      }).toThrow();
    });

    it('应该验证关系状态不能为空', () => {
      expect(() => {
        new UserRelationshipEntity(relationshipId, userId, targetId, relationshipType, null as any, tenantId);
      }).toThrow();
    });

    it('应该验证租户ID不能为空', () => {
      expect(() => {
        new UserRelationshipEntity(relationshipId, userId, targetId, relationshipType, relationshipStatus, '');
      }).toThrow();
    });
  });
});
