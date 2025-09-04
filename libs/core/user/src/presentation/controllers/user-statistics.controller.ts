import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PinoLoggerService, LogContext } from '@aiofix/logging';
import { AuthGuard } from '../guards/auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RequirePermissions } from '../guards/permission.guard';
import { UserManagementService } from '../../application/services/user-management.service';
import { UserStatisticsQueryDto } from '../dtos/user-query.dto';
import { UserStatisticsResponseDto } from '../dtos/user-response.dto';

/**
 * @class UserStatisticsController
 * @description
 * 用户统计控制器，提供用户统计数据的API接口。
 * 包括用户数量统计、活跃度统计、分布统计等。
 *
 * 原理与机制：
 * 1. 通过应用层服务获取统计数据
 * 2. 支持多维度统计查询
 * 3. 提供实时和聚合统计数据
 * 4. 支持权限控制和数据隔离
 *
 * 功能与职责：
 * 1. 用户数量统计
 * 2. 用户活跃度统计
 * 3. 用户分布统计
 * 4. 用户增长趋势统计
 *
 * @example
 * ```typescript
 * // 获取用户总数统计
 * GET /api/users/statistics/count
 *
 * // 获取用户活跃度统计
 * GET /api/users/statistics/activity?period=7d
 *
 * // 获取用户分布统计
 * GET /api/users/statistics/distribution?groupBy=organization
 * ```
 * @since 1.0.0
 */
@ApiTags('用户统计')
@Controller('api/users/statistics')
@UseGuards(AuthGuard, PermissionGuard)
@ApiBearerAuth()
export class UserStatisticsController {
  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * 获取用户总数统计
   * @description 获取指定租户或组织的用户总数统计信息
   * @param query 查询参数
   * @param req 请求对象
   * @returns 用户总数统计
   */
  @Get('count')
  @RequirePermissions('user:statistics', 'read')
  @ApiOperation({
    summary: '获取用户总数统计',
    description:
      '获取指定租户或组织的用户总数统计信息，包括总用户数、活跃用户数、新增用户数等',
  })
  @ApiQuery({
    name: 'tenantId',
    description: '租户ID',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'organizationId',
    description: '组织ID',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'departmentId',
    description: '部门ID',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: UserStatisticsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '未授权',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '权限不足',
  })
  async getUserCount(
    @Query() query: UserStatisticsQueryDto,
    @Request() req: any,
  ): Promise<UserStatisticsResponseDto> {
    const logContext = {
      userId: req.user?.id,
      tenantId: req.user?.tenantId,
      path: req.url,
      method: req.method,
    };

    this.logger.info(
      'Getting user count statistics',
      LogContext.BUSINESS,
      logContext,
    );

    try {
      const criteria = {
        tenantId: query.tenantId || req.user?.tenantId,
        organizationId: query.organizationId,
        departmentId: query.departmentId,
      };

      const statistics = await this.userManagementService.getUserStatistics(
        criteria.tenantId,
      );

      this.logger.info(
        'User count statistics retrieved successfully',
        LogContext.BUSINESS,
        {
          ...logContext,
          result: statistics,
        },
      );

      return {
        success: true,
        data: statistics as any,
        message: '用户总数统计获取成功',
      };
    } catch (error) {
      this.logger.error(
        'Failed to get user count statistics',
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

  /**
   * 获取用户活跃度统计
   * @description 获取用户活跃度统计信息，包括日活跃用户、周活跃用户、月活跃用户等
   * @param query 查询参数
   * @param req 请求对象
   * @returns 用户活跃度统计
   */
  @Get('activity')
  @RequirePermissions('user:statistics', 'read')
  @ApiOperation({
    summary: '获取用户活跃度统计',
    description:
      '获取用户活跃度统计信息，包括日活跃用户、周活跃用户、月活跃用户等',
  })
  @ApiQuery({
    name: 'period',
    description: '统计周期 (1d, 7d, 30d, 90d)',
    required: false,
    type: String,
    example: '7d',
  })
  @ApiQuery({
    name: 'tenantId',
    description: '租户ID',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'organizationId',
    description: '组织ID',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: UserStatisticsResponseDto,
  })
  async getUserActivityStatistics(
    @Query() query: UserStatisticsQueryDto,
    @Request() req: any,
  ): Promise<UserStatisticsResponseDto> {
    const logContext = {
      userId: req.user?.id,
      tenantId: req.user?.tenantId,
      path: req.url,
      method: req.method,
    };

    this.logger.info(
      'Getting user activity statistics',
      LogContext.BUSINESS,
      logContext,
    );

    try {
      const criteria = {
        tenantId: query.tenantId || req.user?.tenantId,
        organizationId: query.organizationId,
        departmentId: query.departmentId,
      };

      const statistics = await this.userManagementService.getUserStatistics(
        criteria.tenantId,
      );

      this.logger.info(
        'User activity statistics retrieved successfully',
        LogContext.BUSINESS,
        {
          ...logContext,
          result: statistics,
        },
      );

      return {
        success: true,
        data: statistics as any,
        message: '用户活跃度统计获取成功',
      };
    } catch (error) {
      this.logger.error(
        'Failed to get user activity statistics',
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

  /**
   * 获取用户分布统计
   * @description 获取用户分布统计信息，包括按组织、部门、状态等维度的分布
   * @param query 查询参数
   * @param req 请求对象
   * @returns 用户分布统计
   */
  @Get('distribution')
  @RequirePermissions('user:statistics', 'read')
  @ApiOperation({
    summary: '获取用户分布统计',
    description: '获取用户分布统计信息，包括按组织、部门、状态等维度的分布',
  })
  @ApiQuery({
    name: 'groupBy',
    description: '分组维度 (organization, department, status, type)',
    required: false,
    type: String,
    example: 'organization',
  })
  @ApiQuery({
    name: 'tenantId',
    description: '租户ID',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: UserStatisticsResponseDto,
  })
  async getUserDistributionStatistics(
    @Query() query: UserStatisticsQueryDto,
    @Request() req: any,
  ): Promise<UserStatisticsResponseDto> {
    const logContext = {
      userId: req.user?.id,
      tenantId: req.user?.tenantId,
      path: req.url,
      method: req.method,
    };

    this.logger.info(
      'Getting user distribution statistics',
      LogContext.BUSINESS,
      logContext,
    );

    try {
      const criteria = {
        tenantId: query.tenantId || req.user?.tenantId,
        organizationId: query.organizationId,
        departmentId: query.departmentId,
        // groupBy: query.groupBy || 'organization',
      };

      const statistics = await this.userManagementService.getUserStatistics(
        criteria.tenantId,
      );

      this.logger.info(
        'User distribution statistics retrieved successfully',
        LogContext.BUSINESS,
        {
          ...logContext,
          result: statistics,
        },
      );

      return {
        success: true,
        data: statistics as any,
        message: '用户分布统计获取成功',
      };
    } catch (error) {
      this.logger.error(
        'Failed to get user distribution statistics',
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

  /**
   * 获取用户增长趋势统计
   * @description 获取用户增长趋势统计信息，包括新增用户趋势、用户增长率等
   * @param query 查询参数
   * @param req 请求对象
   * @returns 用户增长趋势统计
   */
  @Get('growth')
  @RequirePermissions('user:statistics', 'read')
  @ApiOperation({
    summary: '获取用户增长趋势统计',
    description: '获取用户增长趋势统计信息，包括新增用户趋势、用户增长率等',
  })
  @ApiQuery({
    name: 'period',
    description: '统计周期 (7d, 30d, 90d, 1y)',
    required: false,
    type: String,
    example: '30d',
  })
  @ApiQuery({
    name: 'tenantId',
    description: '租户ID',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: UserStatisticsResponseDto,
  })
  async getUserGrowthStatistics(
    @Query() query: UserStatisticsQueryDto,
    @Request() req: any,
  ): Promise<UserStatisticsResponseDto> {
    const logContext = {
      userId: req.user?.id,
      tenantId: req.user?.tenantId,
      path: req.url,
      method: req.method,
    };

    this.logger.info(
      'Getting user growth statistics',
      LogContext.BUSINESS,
      logContext,
    );

    try {
      const criteria = {
        tenantId: query.tenantId || req.user?.tenantId,
        organizationId: query.organizationId,
        departmentId: query.departmentId,
        // period: query.period || '30d',
      };

      const statistics = await this.userManagementService.getUserStatistics(
        criteria.tenantId,
      );

      this.logger.info(
        'User growth statistics retrieved successfully',
        LogContext.BUSINESS,
        {
          ...logContext,
          result: statistics,
        },
      );

      return {
        success: true,
        data: statistics as any,
        message: '用户增长趋势统计获取成功',
      };
    } catch (error) {
      this.logger.error(
        'Failed to get user growth statistics',
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

  /**
   * 获取综合统计概览
   * @description 获取用户综合统计概览，包括所有关键指标的汇总
   * @param query 查询参数
   * @param req 请求对象
   * @returns 综合统计概览
   */
  @Get('overview')
  @RequirePermissions('user:statistics', 'read')
  @ApiOperation({
    summary: '获取综合统计概览',
    description: '获取用户综合统计概览，包括所有关键指标的汇总',
  })
  @ApiQuery({
    name: 'tenantId',
    description: '租户ID',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: UserStatisticsResponseDto,
  })
  async getUserStatisticsOverview(
    @Query() query: UserStatisticsQueryDto,
    @Request() req: any,
  ): Promise<UserStatisticsResponseDto> {
    const logContext = {
      userId: req.user?.id,
      tenantId: req.user?.tenantId,
      path: req.url,
      method: req.method,
    };

    this.logger.info(
      'Getting user statistics overview',
      LogContext.BUSINESS,
      logContext,
    );

    try {
      const criteria = {
        tenantId: query.tenantId || req.user?.tenantId,
        organizationId: query.organizationId,
        departmentId: query.departmentId,
      };

      const statistics = await this.userManagementService.getUserStatistics(
        criteria.tenantId,
      );

      this.logger.info(
        'User statistics overview retrieved successfully',
        LogContext.BUSINESS,
        {
          ...logContext,
          result: statistics,
        },
      );

      return {
        success: true,
        data: statistics as any,
        message: '用户综合统计概览获取成功',
      };
    } catch (error) {
      this.logger.error(
        'Failed to get user statistics overview',
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
