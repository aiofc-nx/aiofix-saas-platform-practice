/**
 * @description 用户事件投影服务测试文件
 * @author 江郎
 * @since 2.1.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { UserEventProjectionService } from './user-event-projection.service';
import { UserEventHandler } from './user-event-handler';
import { EventStore } from '@aiofix/shared';

describe('UserEventProjectionService', () => {
  let service: UserEventProjectionService;
  let eventBus: EventBus;
  let userEventHandler: UserEventHandler;
  let eventStore: EventStore;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserEventProjectionService,
        {
          provide: EventBus,
          useValue: {
            subscribe: jest.fn(),
            unsubscribeAll: jest.fn(),
          },
        },
        {
          provide: UserEventHandler,
          useValue: {
            handleUserCreatedEvent: jest.fn(),
            handleUserUpdatedEvent: jest.fn(),
            handleUserDeletedEvent: jest.fn(),
          },
        },
        {
          provide: EventStore,
          useValue: {
            getEvents: jest.fn(),
            getAllEvents: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserEventProjectionService>(
      UserEventProjectionService,
    );
    eventBus = module.get<EventBus>(EventBus);
    userEventHandler = module.get<UserEventHandler>(UserEventHandler);
    eventStore = module.get<EventStore>(EventStore);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('start', () => {
    it('should start the event projection service', async () => {
      await service.start();
      expect(eventBus.subscribe).toHaveBeenCalled();
    });

    it('should not start if already running', async () => {
      await service.start();
      await service.start();
      expect(eventBus.subscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('stop', () => {
    it('should stop the event projection service', async () => {
      await service.start();
      await service.stop();
      expect(eventBus.unsubscribeAll).toHaveBeenCalled();
    });

    it('should not stop if not running', async () => {
      await service.stop();
      expect(eventBus.unsubscribeAll).not.toHaveBeenCalled();
    });
  });

  describe('getStatus', () => {
    it('should return service status', () => {
      const status = service.getStatus();
      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('eventHandlersCount');
      expect(status).toHaveProperty('supportedEventTypes');
    });
  });

  describe('isHealthy', () => {
    it('should return false when not running', () => {
      expect(service.isHealthy()).toBe(false);
    });

    it('should return true when running', async () => {
      await service.start();
      expect(service.isHealthy()).toBe(true);
    });
  });
});
