/**
 * @file auth.module.ts
 * @description IAM 认证模块
 *
 * 该文件实现了IAM领域的认证模块，包括：
 * - JWT服务
 * - 密码服务
 * - 认证配置
 *
 * 遵循DDD和Clean Architecture原则，提供完整的认证功能。
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PinoLoggerService } from '@aiofix/logging';
import { IamJwtService } from './infrastructure/services/jwt.service';
import { IamPasswordService } from './infrastructure/services/password.service';
import type { JwtConfig } from './infrastructure/config/security.config';

/**
 * @class AuthModule
 * @description IAM 认证模块
 *
 * 提供完整的认证功能，包括：
 * - JWT令牌管理
 * - 密码加密和验证
 * - 认证配置管理
 *
 * 遵循DDD和Clean Architecture原则，确保认证功能的内聚性和可维护性。
 */
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const jwtConfig = configService.get<JwtConfig>('iam.jwt') ?? {
          secret: 'default-secret-key',
          expiresIn: '1h',
          refreshExpiresIn: '7d',
          enabled: true,
        };

        return {
          secret: jwtConfig.secret,
          signOptions: {
            expiresIn: jwtConfig.expiresIn,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    IamJwtService,
    IamPasswordService,
    {
      provide: PinoLoggerService,
      useFactory: () => {
        return new PinoLoggerService('IAM-Auth');
      },
    },
  ],
  exports: [IamJwtService, IamPasswordService],
})
export class AuthModule {}
