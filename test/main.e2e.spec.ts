import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter } from '@nestjs/platform-fastify';

describe('main.ts bootstrap', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('uses Fastify, sets prefix and validation, listens on PORT', async () => {
    const captured: any = {};
    process.env.PORT = '6005';

    jest.resetModules();
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.doMock('@nestjs/core', () => {
      const fakeApp = {
        setGlobalPrefix: jest.fn(),
        useGlobalPipes: jest.fn(),
        listen: jest.fn().mockResolvedValue(undefined),
      };
      return {
        NestFactory: {
          create: jest.fn().mockImplementation((module: any, adapter: any) => {
            captured.module = module;
            captured.adapter = adapter;
            captured.app = fakeApp;
            return fakeApp;
          }),
        },
      };
    });

    require('../src/main');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(logSpy).toHaveBeenCalledWith('Server is running on port 6005');
    logSpy.mockRestore();

    expect(captured.adapter).toBeDefined();
    expect(captured.adapter.constructor?.name).toBe('FastifyAdapter');
    expect(captured.app.setGlobalPrefix).toHaveBeenCalledWith(
      'blackrock/challenge/v1',
    );
    const pipeArg = captured.app.useGlobalPipes.mock.calls[0][0];
    expect(pipeArg?.constructor?.name).toBe('ValidationPipe');
  });

  it('defaults to port 5477 when PORT is not set', async () => {
    delete process.env.PORT;

    jest.resetModules();
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.doMock('@nestjs/core', () => {
      const fakeApp = {
        setGlobalPrefix: jest.fn(),
        useGlobalPipes: jest.fn(),
        listen: jest.fn().mockResolvedValue(undefined),
      };
      return {
        NestFactory: {
          create: jest.fn().mockResolvedValue(fakeApp),
        },
      };
    });

    require('../src/main');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(logSpy).toHaveBeenCalledWith('Server is running on port 5477');
    logSpy.mockRestore();
  });
});
