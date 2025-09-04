import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PinoLoggerService, LogContext } from '@aiofix/logging';
import { AuthGuard } from '../guards/auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequirePermissions } from '../guards/permission.guard';
import { UserManagementService } from '../../application/services/user-management.service';
import { UserQueryDto } from '../dtos/user-query.dto';
import {
  UserListResponseDto,
  UserDetailResponseDto,
  UserExistsResponseDto,
  UserProfileResponseDto,
  UserRelationshipsResponseDto,
} from '../dtos/user-response.dto';

/**
 * @class UserQueryController
 * @description
 * 用户查询控制器，提供用户查询相关的API接口。
 * 包括用户列表查询、用户详情查询、用户存在性检查等。
 *
 * 原理与机制：
 * 1. 通过应用层服务执行查询操作
 * 2. 支持多维度查询条件
 * 3. 提供分页和排序功能
 * 4. 支持权限控制和数据隔离
 *
 * 功能与职责：
 * 1. 用户列表查询
 * 2. 用户详情查询
 * 3. 用户存在性检查
 * 4. 用户档案查询
 * 5. 用户关系查询
 *
 * @example
 * ```typescript
 * // 获取用户列表
 * GET /api/users/query/list?page=1&size=20&status=ACTIVE
 *
 * // 获取用户详情
 * GET /api/users/query/:id
 *
 * // 检查用户是否存在
 * GET /api/users/query/exists?email=user@example.com
 * ```
 * @since 1.0.0
 */
@ApiTags('用户查询')
@Controller('api/users/query')
@UseGuards(AuthGuard, PermissionGuard)
@ApiBearerAuth()
export class UserQueryController {
  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * 获取用户列表
   * @description 根据查询条件获取用户列表，支持分页、排序和过滤
   * @param query 查询参数
   * @param req 请求对象
   * @returns 用户列表
   */
  @Get('list')
  @RequirePermissions('user:query', 'read')
  @ApiOperation({
    summary: '获取用户列表',
    description: '根据查询条件获取用户列表，支持分页、排序和过滤',
  })
  @ApiQuery({
    name: 'page',
    description: '页码',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'size',
    description: '每页大小',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiQuery({
    name: 'status',
    description: '用户状态',
    required: false,
    type: String,
    example: 'ACTIVE',
  })
  @ApiQuery({
    name: 'organizationId',
    description: '组织ID',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'departmentIds',
    description: '部门ID列表',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'username',
    description: '用户名搜索',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'email',
    description: '邮箱搜索',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: UserListResponseDto,
  })
  async getUsers(
    @Query() query: UserQueryDto,
    @Request() _req: unknown,
  ): Promise<UserListResponseDto> {
    const logContext = {
      userId: req.user.id,
      tenantId: req.user.tenantId,
      path: req.url,
      method: req.method,
    };

    this.logger.info('Getting users list', LogContext.BUSINESS, logContext);

    try {
      const criteria = {
        tenantId: req.user.tenantId,
        organizationId: query.organizationId,
        departmentIds: query.departmentIds,
        status: query.status,
        username: query.username,
        email: query.email,
        page: query.page || 1,
        size: query.size || 20,
        excludeUserId: query.excludeUserId,
      };

      const result = await this.userManagementService.getUser(
        criteria,
        req.user.id,
      );

      this.logger.info(
        'Users list retrieved successfully',
        LogContext.BUSINESS,
        {
          ...logContext,
          count: result.data.length,
          total: result.total,
        },
      );

      return {
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          size: result.size,
          total: result.total,
          totalPages: result.totalPages,
        },
        message: '用户列表获取成功',
      } as any;
    } catch (error) {
      this.logger.error('Failed to get users list', LogContext.BUSINESS, {
        ...logContext,
        error: (error as Error).message,
        stack: (error as Error).stack,
      });

      throw error;
    }
  }

  /**
   * 根据ID获取用户详情
   * @description 根据用户ID获取用户的详细信息
   * @param id 用户ID
   * @param query 查询参数
   * @param req 请求对象
   * @returns 用户详情
   */
  @Get(':id')
  @RequirePermissions('user:query', 'read')
  @ApiOperation({
    summary: '根据ID获取用户详情',
    description: '根据用户ID获取用户的详细信息',
  })
  @ApiParam({
    name: 'id',
    description: '用户ID',
    type: String,
  })
  @ApiQuery({
    name: 'includeProfile',
    description: '是否包含用户档案',
    required: false,
    type: Boolean,
    example: true,
  })
  @ApiQuery({
    name: 'includeRelationships',
    description: '是否包含用户关系',
    required: false,
    type: Boolean,
    example: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: UserDetailResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '用户不存在',
  })
  async getUserById(
    @Param('id') id: string,
    @Query() _query: unknown,
    @Request() _req: unknown,
  ): Promise<UserDetailResponseDto> {
    const logContext = {
      userId: req.user.id,
      tenantId: req.user.tenantId,
      targetUserId: id,
      path: req.url,
      method: req.method,
    };

    this.logger.info('Getting user by ID', LogContext.BUSINESS, logContext);

    try {
      const criteria = {
        userId: id,
        includeProfile: query.includeProfile || false,
        includeRelationships: query.includeRelationships || false,
      };

      const user = await this.userManagementService.getUserById(criteria);

      this.logger.info('User retrieved successfully', LogContext.BUSINESS, {
        ...logContext,
        result: user,
      });

      return {
        success: true,
        data: user,
        message: '用户详情获取成功',
      };
    } catch (error) {
      this.logger.error('Failed to get user by ID', LogContext.BUSINESS, {
        ...logContext,
        error: (error as Error).message,
        stack: (error as Error).stack,
      });

      throw error;
    }
  }

  /**
   * 检查用户是否存在
   * @description 根据邮箱、用户名等条件检查用户是否存在
   * @param query 查询参数
   * @param req 请求对象
   * @returns 用户存在性检查结果
   */
  @Get('exists')
  @RequirePermissions('user:query', 'read')
  @ApiOperation({
    summary: '检查用户是否存在',
    description: '根据邮箱、用户名等条件检查用户是否存在',
  })
  @ApiQuery({
    name: 'email',
    description: '邮箱地址',
    required: false,
    type: String,
    example: 'user@example.com',
  })
  @ApiQuery({
    name: 'username',
    description: '用户名',
    required: false,
    type: String,
    example: 'username',
  })
  @ApiQuery({
    name: 'phone',
    description: '手机号',
    required: false,
    type: String,
    example: '13800138000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '检查成功',
    type: UserExistsResponseDto,
  })
  async checkUserExists(
    @Query() _query: unknown,
    @Request() _req: unknown,
  ): Promise<UserExistsResponseDto> {
    const logContext = {
      userId: req.user.id,
      tenantId: req.user.tenantId,
      path: req.url,
      method: req.method,
    };

    this.logger.info(
      'Checking user existence',
      LogContext.BUSINESS,
      logContext,
    );

    try {
      const criteria = {
        email: query.email,
        username: query.username,
        phone: query.phone,
        tenantId: req.user.tenantId,
      };

      const result = await this.userManagementService.getUser(
        criteria,
        req.user.id,
      );

      this.logger.info('User existence check completed', LogContext.BUSINESS, {
        ...logContext,
        result,
      });

      return {
        success: true,
        data: result,
        message: '用户存在性检查完成',
      };
    } catch (error) {
      this.logger.error('Failed to check user existence', LogContext.BUSINESS, {
        ...logContext,
        error: (error as Error).message,
        stack: (error as Error).stack,
      });

      throw error;
    }
  }

  /**
   * 获取用户档案
   * @description 根据用户ID获取用户的档案信息
   * @param userId 用户ID
   * @param query 查询参数
   * @param req 请求对象
   * @returns 用户档案
   */
  @Get(':userId/profile')
  @RequirePermissions('user:query', 'read')
  @ApiOperation({
    summary: '获取用户档案',
    description: '根据用户ID获取用户的档案信息',
  })
  @ApiParam({
    name: 'userId',
    description: '用户ID',
    type: String,
  })
  @ApiQuery({
    name: 'includeExtendedInfo',
    description: '是否包含扩展信息',
    required: false,
    type: Boolean,
    example: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: UserProfileResponseDto,
  })
  async getUserProfile(
    @Param('userId') userId: string,
    @Query() _query: unknown,
    @Request() _req: unknown,
  ): Promise<UserProfileResponseDto> {
    const logContext = {
      userId: req.user.id,
      tenantId: req.user.tenantId,
      targetUserId: userId,
      path: req.url,
      method: req.method,
    };

    this.logger.info('Getting user profile', LogContext.BUSINESS, logContext);

    try {
      const criteria = {
        userId,
        includeExtendedInfo: query.includeExtendedInfo || false,
      };

      const profile = await this.userManagementService.getUser(
        criteria,
        req.user.id,
      );

      this.logger.info(
        'User profile retrieved successfully',
        LogContext.BUSINESS,
        {
          ...logContext,
          result: profile,
        },
      );

      return {
        success: true,
        data: profile as any,
        message: '用户档案获取成功',
      };
    } catch (error) {
      this.logger.error('Failed to get user profile', LogContext.BUSINESS, {
        ...logContext,
        error: (error as Error).message,
        stack: (error as Error).stack,
      });

      throw error;
    }
  }

  /**
   * 获取用户关系
   * @description 根据用户ID获取用户的关系信息
   * @param userId 用户ID
   * @param query 查询参数
   * @param req 请求对象
   * @returns 用户关系列表
   */
  @Get(':userId/relationships')
  @RequirePermissions('user:query', 'read')
  @ApiOperation({
    summary: '获取用户关系',
    description: '根据用户ID获取用户的关系信息',
  })
  @ApiParam({
    name: 'userId',
    description: '用户ID',
    type: String,
  })
  @ApiQuery({
    name: 'type',
    description: '关系类型',
    required: false,
    type: String,
    example: 'FRIEND',
  })
  @ApiQuery({
    name: 'status',
    description: '关系状态',
    required: false,
    type: String,
    example: 'ACTIVE',
  })
  @ApiQuery({
    name: 'page',
    description: '页码',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'size',
    description: '每页大小',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: UserRelationshipsResponseDto,
  })
  async getUserRelationships(
    @Param('userId') userId: string,
    @Query() _query: unknown,
    @Request() _req: unknown,
  ): Promise<UserRelationshipsResponseDto> {
    const logContext = {
      userId: req.user.id,
      tenantId: req.user.tenantId,
      targetUserId: userId,
      path: req.url,
      method: req.method,
    };

    this.logger.info(
      'Getting user relationships',
      LogContext.BUSINESS,
      logContext,
    );

    try {
      const criteria = {
        userId,
        type: query.type,
        status: query.status,
        page: query.page || 1,
        size: query.size || 20,
      };

      const result = await this.userManagementService.getUser(
        criteria,
        req.user.id,
      );

      this.logger.info(
        'User relationships retrieved successfully',
        LogContext.BUSINESS,
        {
          ...logContext,
          count: result.data.length,
          total: result.total,
        },
      );

      return {
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          size: result.size,
          total: result.total,
          totalPages: result.totalPages,
        },
        message: '用户关系获取成功',
      } as any;
    } catch (error) {
      this.logger.error(
        'Failed to get user relationships',
        LogContext.BUSINESS,
        {
          ...logContext,
          error: (error as Error).message,
          stack: (error as Error).stack,
        },
      );

      throw error;
    }
  }
}
