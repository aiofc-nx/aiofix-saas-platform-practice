/**
 * @file test-setup.ts
 * @description 测试环境设置文件
 */

// 设置测试环境变量
process.env.NODE_ENV = 'test';

// 全局测试配置
beforeAll(() => {
  // 测试开始前的全局设置
});

afterAll(() => {
  // 测试结束后的全局清理
});

// 模拟 console 方法以避免测试输出干扰
global.console = {
  ...console,
  // 可以根据需要禁用某些 console 方法
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
