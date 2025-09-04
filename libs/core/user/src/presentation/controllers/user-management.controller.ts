/**
 * @description 用户管理控制器
 * @author 江郎
 * @since 2.1.0
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Request,
} from '@nestjs/common';
import { UserManagementService } from '../../application/services/user-management.service';

@Controller('api/users')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  /**
   * 获取用户列表
   */
  @Get()
  async getUsers(@Request() req: any) {
    const request = {
      tenantId: req.user.tenantId,
      currentUserId: req.user.id,
      page: 1,
      size: 20,
    };
    return this.userManagementService.getUser(request);
  }

  /**
   * 获取用户详情
   */
  @Get(':id')
  async getUser(@Param('id') id: string, @Request() req: any) {
    const request = {
      userId: id,
      tenantId: req.user.tenantId,
      currentUserId: req.user.id,
    };
    return this.userManagementService.getUser(request);
  }

  /**
   * 创建用户
   */
  @Post()
  async createUser(@Request() req: any) {
    const request = {
      ...req.body,
      currentUserId: req.user.id,
    };
    return this.userManagementService.createUser(request);
  }

  /**
   * 更新用户
   */
  @Put(':id')
  async updateUser(@Param('id') id: string, @Request() req: any) {
    const request = {
      ...req.body,
      currentUserId: req.user.id,
    };
    return this.userManagementService.updateUser(id, request);
  }

  /**
   * 删除用户
   */
  @Delete(':id')
  async deleteUser(@Param('id') _id: string, @Request() _req: any) {
    // TODO: 实现用户删除逻辑
    return { success: true, message: '用户删除成功' };
  }
}
