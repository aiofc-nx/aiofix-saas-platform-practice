/**
 * @interface BaseResponse
 * @description 基础响应接口
 *
 * 功能与职责：
 * 1. 定义统一的响应格式
 * 2. 提供成功和失败的标准结构
 * 3. 支持错误信息传递
 *
 * @example
 * ```typescript
 * const response: BaseResponse = {
 *   success: true,
 *   message: '操作成功'
 * };
 * ```
 * @since 1.0.0
 */
export interface BaseResponse {
  success: boolean;
  message: string;
  error?: string;
}
