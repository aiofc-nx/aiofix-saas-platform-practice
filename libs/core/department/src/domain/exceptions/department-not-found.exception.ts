/**
 * @class DepartmentNotFoundException
 * @description 部门未找到异常
 *
 * 当尝试访问不存在的部门时抛出此异常。
 *
 * @example
 * ```typescript
 * throw new DepartmentNotFoundException('dept-123');
 * ```
 * @since 2.1.0
 */

export class DepartmentNotFoundException extends Error {
  constructor(
    public readonly departmentId: string,
    message?: string,
  ) {
    super(message ?? `部门未找到: ${departmentId}`);
    this.name = 'DepartmentNotFoundException';
  }
}
