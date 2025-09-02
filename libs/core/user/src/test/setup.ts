/**
 * @description 用户模块测试设置文件
 * @author 技术架构师
 * @since 2.1.0
 */

// 全局测试设置
beforeAll(async () => {
  // 设置测试环境变量
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'mongodb://localhost:27017/test';
  process.env.REDIS_URL = 'redis://localhost:6379/1';
});

// 全局测试清理
afterAll(async () => {
  // 清理测试资源
});

// 全局测试超时设置
jest.setTimeout(30000);

// 模拟控制台方法，避免测试输出干扰
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
