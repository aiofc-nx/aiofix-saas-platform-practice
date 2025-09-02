/**
 * @file 通知相关类型定义
 * @description 定义通知领域中的核心类型、枚举和接口，供所有模块共享使用
 */

import { Uuid } from '../domain/value-objects/uuid.vo';

/**
 * @enum NotificationType
 * @description 通知类型枚举
 */
export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  WEBHOOK = 'WEBHOOK',
}

/**
 * @enum NotificationStatus
 * @description 通知状态枚举
 */
export enum NotificationStatus {
  PENDING = 'PENDING',
  SENDING = 'SENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * @enum NotificationPriority
 * @description 通知优先级枚举
 */
export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/**
 * @enum TemplateStatus
 * @description 模板状态枚举
 */
export enum TemplateStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

/**
 * @enum NotificationFrequency
 * @description 通知频率枚举
 */
export enum NotificationFrequency {
  IMMEDIATE = 'IMMEDIATE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

/**
 * @interface Notification
 * @description 通知实体接口
 */
export interface Notification {
  id: string | Uuid;
  tenantId: string | Uuid;
  type: NotificationType;
  templateId: Uuid;
  recipient: string | string[];
  data: Record<string, unknown>;
  status: NotificationStatus;
  priority: NotificationPriority;
  scheduledAt?: Date;
  sentAt?: Date;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @interface Template
 * @description 模板实体接口
 */
export interface Template {
  id: string | Uuid;
  tenantId: string | Uuid;
  name: string;
  type: NotificationType;
  subject?: string;
  content: string;
  variables: string[];
  status: TemplateStatus;
  version: number;
  language: string;
  category: string;
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @interface UserPreference
 * @description 用户偏好接口
 */
export interface UserPreference {
  id: string | Uuid;
  userId: string | Uuid;
  tenantId: string | Uuid;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  webhookEnabled: boolean;
  notificationTypes: NotificationType[];
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    timezone: string;
  };
  frequency: NotificationFrequency;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @interface NotificationRequest
 * @description 通知请求接口
 */
export interface NotificationRequest {
  type: NotificationType;
  templateId: Uuid;
  recipient: string | string[];
  data: Record<string, unknown>;
  priority?: NotificationPriority;
  scheduledAt?: Date;
  tenantId: Uuid;
  metadata?: Record<string, unknown>;
}

/**
 * @interface NotificationResult
 * @description 通知发送结果接口
 */
export interface NotificationResult {
  success: boolean;
  notificationId: string;
  message?: string;
  error?: string;
  sentAt?: Date;
}

/**
 * @interface TemplateRequest
 * @description 模板创建请求接口
 */
export interface TemplateRequest {
  name: string;
  type: NotificationType;
  subject?: string;
  content: string;
  variables: string[];
  language: string;
  category: string;
  tags?: string[];
  tenantId: Uuid;
}

/**
 * @interface UserPreferenceRequest
 * @description 用户偏好请求接口
 */
export interface UserPreferenceRequest {
  userId: Uuid;
  tenantId: Uuid;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
  webhookEnabled?: boolean;
  notificationTypes?: NotificationType[];
  quietHours?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  frequency?: NotificationFrequency;
}
