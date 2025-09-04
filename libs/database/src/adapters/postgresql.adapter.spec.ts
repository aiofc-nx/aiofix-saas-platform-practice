/// <reference types="jest" />
/* eslint-env jest */
import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
/**
 * @file postgresql.adapter.spec.ts
 * @description PostgreSQL适配器单元测试
 *
 * 测试PostgreSQL适配器的连接管理、查询执行、事务管理、健康检查等功能。
 */

import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PinoLoggerService, LogContext } from '@aiofix/logging';
import { PostgreSQLAdapter } from './postgresql.adapter';
import type { DatabaseConfig } from '../interfaces/database.interface';

// Mock pg and knex
jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
    totalCount: 0,
    idleCount: 0,
    waitingCount: 0,
  })),
}));

jest.mock('knex', () => ({
  knex: jest.fn().mockImplementation(() => ({
    raw: jest.fn(),
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    transaction: jest.fn(),
    destroy: jest.fn(),
  })),
}));

describe('PostgreSQLAdapter', () => {
  let adapter: PostgreSQLAdapter;
  let mockEventEmitter: jest.Mocked<EventEmitter2>;
  let mockLogger: jest.Mocked<PinoLoggerService>;
  let mockConfig: DatabaseConfig;

  beforeEach(async () => {
    mockEventEmitter = {
      emit: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      setMaxListeners: jest.fn(),
      getMaxListeners: jest.fn(),
      listeners: jest.fn(),
      rawListeners: jest.fn(),
      listenerCount: jest.fn(),
      prependListener: jest.fn(),
      prependOnceListener: jest.fn(),
      eventNames: jest.fn(),
    } as unknown;

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      fatal: jest.fn(),
      child: jest.fn(),
    } as unknown;

    mockConfig = {
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      username: 'test',
      password: 'test',
      database: 'test',
      schema: 'public',
      ssl: false,
      pool: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 60000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'DATABASE_CONFIG',
          useValue: mockConfig,
        },
        {
          provide: 'DATABASE_NAME',
          useValue: 'test-postgresql',
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: PinoLoggerService,
          useValue: mockLogger,
        },
        PostgreSQLAdapter,
      ],
    }).compile();

    adapter = module.get<PostgreSQLAdapter>(PostgreSQLAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('初始化', () => {
    it('应该正确初始化适配器', () => {
      expect(adapter.name).toBe('test-postgresql');
      expect(adapter.type).toBe('postgresql');
      expect(adapter.config).toEqual(mockConfig);
      expect(adapter.eventEmitter).toBe(mockEventEmitter);
    });

    it('应该初始化统计信息', () => {
      const stats = (adapter as unknown).stats;
      expect(stats.totalQueries).toBe(0);
      expect(stats.successfulQueries).toBe(0);
      expect(stats.failedQueries).toBe(0);
      expect(stats.averageResponseTime).toBe(0);
      expect(stats.maxResponseTime).toBe(0);
      expect(stats.minResponseTime).toBe(0);
      expect(stats.activeConnections).toBe(0);
      expect(stats.idleConnections).toBe(0);
    });
  });

  describe('连接管理', () => {
    it('应该能够连接到数据库', async () => {
      const mockPool = (adapter as unknown).pool as unknown;
      const mockClient = {
        query: (jest.fn() as unknown).mockResolvedValue({
          rows: [{ result: 1 }],
        }) as unknown,
        release: jest.fn() as unknown,
      };
      mockPool.connect.mockResolvedValue(mockClient as unknown);

      await adapter.connect();

      expect(mockPool.connect).toHaveBeenCalled();
      expect(adapter.isConnected).toBe(true);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'database.connected',
        expect.objectContaining({
          adapter: 'test-postgresql',
          timestamp: expect.unknown(Date),
        }),
      );
    });

    it('应该能够断开数据库连接', async () => {
      const mockPool = (adapter as unknown).pool as unknown;
      mockPool.end.mockResolvedValue(undefined);

      await adapter.disconnect();

      expect(mockPool.end).toHaveBeenCalled();
      expect(adapter.isConnected).toBe(false);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'database.disconnected',
        expect.objectContaining({
          adapter: 'test-postgresql',
          timestamp: expect.unknown(Date),
        }),
      );
    });

    it('应该处理连接错误', async () => {
      const mockPool = (adapter as unknown).pool as unknown;
      const error = new Error('Connection failed');
      mockPool.connect.mockRejectedValue(error);

      await expect(adapter.connect()).rejects.toThrow('Connection failed');

      // 检查最后一次错误日志调用
      const errorCalls = mockLogger.error.mock.calls;
      const lastErrorCall = errorCalls[errorCalls.length - 1];
      expect(lastErrorCall[0]).toContain(
        'Failed to connect to PostgreSQL database',
      );
      expect(lastErrorCall[1]).toBe(LogContext.DATABASE);
      expect(lastErrorCall[2]).toMatchObject({
        adapter: 'test-postgresql',
      });
    });
  });

  describe('查询执行', () => {
    beforeEach(async () => {
      const mockPool = (adapter as unknown).pool as unknown;
      const mockClient = {
        query: (jest.fn() as unknown).mockResolvedValue({
          rows: [{ result: 1 }],
        }) as unknown,
        release: jest.fn() as unknown,
      };
      mockPool.connect.mockResolvedValue(mockClient);
      await adapter.connect();
    });

    it('应该能够执行查询', async () => {
      const mockPool = (adapter as unknown).pool as unknown;
      const mockResult = {
        rows: [{ id: 1, name: 'test' }],
        rowCount: 1,
        command: 'SELECT',
      };
      (mockPool.query as unknown).mockResolvedValue(mockResult);

      const result = await adapter.query('SELECT * FROM users WHERE id = $1', [
        1,
      ]);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'SELECT * FROM users WHERE id = $1',
          values: [1],
        }),
      );
      expect(result).toEqual(mockResult);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'database.query_executed',
        expect.objectContaining({
          adapter: 'test-postgresql',
          sql: 'SELECT * FROM users WHERE id = $1',
          params: [1],
          responseTime: expect.unknown(Number),
        }),
      );
    });

    it('应该能够执行命令', async () => {
      const mockPool = (adapter as unknown).pool as unknown;
      const mockResult = {
        rowCount: 1,
        command: 'INSERT',
      };
      (mockPool.query as unknown).mockResolvedValue(mockResult);

      const result = await adapter.execute(
        'INSERT INTO users (name) VALUES ($1)',
        ['test'],
      );

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'INSERT INTO users (name) VALUES ($1)',
          values: ['test'],
        }),
      );
      expect(result).toEqual(mockResult);
    });

    it('应该处理查询错误', async () => {
      const mockPool = (adapter as unknown).pool;
      const error = new Error('Query failed');
      (mockPool.query as unknown).mockRejectedValue(error);

      await expect(
        adapter.query('SELECT * FROM invalid_table'),
      ).rejects.toThrow('Query failed');

      // 检查最后一次错误日志调用
      const errorCalls = mockLogger.error.mock.calls;
      const lastErrorCall = errorCalls[errorCalls.length - 1];
      expect(lastErrorCall[0]).toContain('Query failed');
      expect(lastErrorCall[1]).toBe(LogContext.DATABASE);
      expect(lastErrorCall[2]).toMatchObject({
        adapter: 'test-postgresql',
      });
    });

    it('应该更新统计信息', async () => {
      const mockPool = (adapter as unknown).pool;
      const mockResult = { rows: [], rowCount: 0, command: 'SELECT' };
      (mockPool.query as unknown).mockResolvedValue(mockResult);

      await adapter.query('SELECT 1');

      const stats = await adapter.getStats();
      expect(stats.totalQueries).toBe(1);
      expect(stats.successfulQueries).toBe(1);
      expect(stats.failedQueries).toBe(0);
      expect(stats.averageResponseTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('事务管理', () => {
    beforeEach(async () => {
      const mockPool = (adapter as unknown).pool;
      const mockClient = {
        query: (jest.fn() as unknown).mockResolvedValue({
          rows: [{ result: 1 }],
        }) as unknown,
        release: jest.fn() as unknown,
      };
      mockPool.connect.mockResolvedValue(mockClient);
      await adapter.connect();
    });

    it('应该能够执行事务', async () => {
      const mockKnex = (adapter as unknown).knexInstance;
      mockKnex.transaction.mockImplementation(async (callback: unknown) => {
        return await callback({});
      });

      const transactionCallback: unknown = jest.fn();
      (transactionCallback as unknown).mockResolvedValue('success');
      const result = await adapter.transaction(transactionCallback);

      expect(mockKnex.transaction).toHaveBeenCalled();
      expect(transactionCallback).toHaveBeenCalled();
      expect(result).toBe('success');
    });

    it('应该在事务失败时回滚', async () => {
      const mockKnex = (adapter as unknown).knexInstance;
      mockKnex.transaction.mockImplementation(async (callback: unknown) => {
        return await callback({});
      });

      const transactionCallback: unknown = jest.fn();
      (transactionCallback as unknown).mockRejectedValue(
        new Error('Transaction failed'),
      );

      await expect(adapter.transaction(transactionCallback)).rejects.toThrow(
        'Transaction failed',
      );
    });
  });

  describe('健康检查', () => {
    it('应该返回健康状态', async () => {
      const mockPool = (adapter as unknown).pool;
      mockPool.totalCount = 10;
      mockPool.idleCount = 8;
      mockPool.waitingCount = 0;

      // 确保连接状态为 true
      (adapter as unknown).isConnectedFlag = true;

      // Mock 查询成功
      (mockPool.query as unknown).mockResolvedValue({
        rows: [{ health_check: 1 }],
      });

      const health = await adapter.getHealth();

      expect(health.healthy).toBe(true);
      expect(health.connected).toBe(adapter.isConnected);
      expect(health.responseTime).toBeGreaterThanOrEqual(0);
      expect(health.lastCheck).toBeInstanceOf(Date);
      expect(health.poolStatus).toEqual({
        total: 10,
        idle: 8,
        active: 2,
        waiting: 0,
      });
    });

    it('应该处理连接池错误', async () => {
      const mockPool = (adapter as unknown).pool;
      mockPool.totalCount = 0;
      mockPool.idleCount = 0;
      mockPool.waitingCount = 0;

      const health = await adapter.getHealth();

      expect(health.healthy).toBe(false);
      expect(health.error).toBeDefined();
    });
  });

  describe('统计信息', () => {
    it('应该返回统计信息', async () => {
      const stats = await adapter.getStats();

      expect(stats.totalQueries).toBeGreaterThanOrEqual(0);
      expect(stats.successfulQueries).toBeGreaterThanOrEqual(0);
      expect(stats.failedQueries).toBeGreaterThanOrEqual(0);
      expect(stats.averageResponseTime).toBeGreaterThanOrEqual(0);
      expect(stats.maxResponseTime).toBeGreaterThanOrEqual(0);
      expect(stats.minResponseTime).toBeGreaterThanOrEqual(0);
      expect(stats.activeConnections).toBeGreaterThanOrEqual(0);
      expect(stats.idleConnections).toBeGreaterThanOrEqual(0);
      expect(stats.lastReset).toBeInstanceOf(Date);
    });

    it('应该能够重置统计信息', async () => {
      await adapter.resetStats();

      const stats = await adapter.getStats();
      expect(stats.totalQueries).toBe(0);
      expect(stats.successfulQueries).toBe(0);
      expect(stats.failedQueries).toBe(0);
      expect(stats.averageResponseTime).toBe(0);
      expect(stats.maxResponseTime).toBe(0);
      expect(stats.minResponseTime).toBe(0);
    });
  });

  describe('连接测试', () => {
    it('应该能够ping数据库', async () => {
      const mockPool = (adapter as unknown).pool;
      (mockPool.query as unknown).mockResolvedValue({ rows: [{ result: 1 }] });

      const result = await adapter.ping();

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'SELECT 1',
          values: [],
        }),
      );
    });

    it('应该在ping失败时返回false', async () => {
      const mockPool = (adapter as unknown).pool;
      (mockPool.query as unknown).mockRejectedValue(new Error('Ping failed'));

      const result = await adapter.ping();

      expect(result).toBe(false);
    });
  });

  describe('事件通知', () => {
    it('应该在查询执行时发出事件', async () => {
      const mockPool = (adapter as unknown).pool;
      const mockClient = {
        query: (jest.fn() as unknown).mockResolvedValue({
          rows: [{ result: 1 }],
        }) as unknown,
        release: jest.fn() as unknown,
      };
      mockPool.connect.mockResolvedValue(mockClient as unknown);
      await adapter.connect();

      const mockResult = { rows: [], rowCount: 0, command: 'SELECT' };
      (mockPool.query as unknown).mockResolvedValue(mockResult);

      await adapter.query('SELECT 1');

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'database.query_executed',
        expect.objectContaining({
          adapter: 'test-postgresql',
          sql: 'SELECT 1',
          responseTime: expect.unknown(Number),
        }),
      );
    });

    it('应该在连接状态变化时发出事件', async () => {
      const mockPool = (adapter as unknown).pool;
      const mockClient = {
        query: (jest.fn() as unknown).mockResolvedValue({
          rows: [{ result: 1 }],
        }) as unknown,
        release: jest.fn() as unknown,
      };
      mockPool.connect.mockResolvedValue(mockClient);

      await adapter.connect();

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'database.connected',
        expect.objectContaining({
          adapter: 'test-postgresql',
          timestamp: expect.unknown(Date),
        }),
      );
    });
  });
});
