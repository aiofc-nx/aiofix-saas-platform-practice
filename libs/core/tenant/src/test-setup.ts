/**
 * @file test-setup.ts
 * @description Jest测试设置文件
 * @since 1.0.0
 */

// 设置测试环境
process.env.NODE_ENV = 'test';

// 模拟console方法以避免测试输出干扰
global.console = {
  ...console,
  // 可以在这里禁用某些console方法
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
