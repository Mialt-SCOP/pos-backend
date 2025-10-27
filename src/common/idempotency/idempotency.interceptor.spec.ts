import { firstValueFrom, of, throwError } from 'rxjs';
import { Test } from '@nestjs/testing';
import {
  CallHandler,
  ConflictException,
  ExecutionContext,
} from '@nestjs/common';
import { IdempotencyInterceptor } from './idempotency.interceptor';
import { IdempotencyService } from './idempotency.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ProcessedCommand,
  ProcessedCommandStatus,
} from './processed-command.entity';
import { Repository } from 'typeorm';

describe('IdempotencyInterceptor', () => {
  let interceptor: IdempotencyInterceptor;
  let next: jest.Mocked<CallHandler>;
  let context: Partial<ExecutionContext>;
  let service: IdempotencyService;

  let mockedInsert: jest.Func;
  let mockedUpdate: jest.Func;
  let mockedGetCommandResponse: jest.Func;
  let mockedCode: jest.Func;
  let mockedSend: jest.Func;

  beforeEach(async () => {
    const repositoryMockFactory: () => jest.Mocked<
      Repository<ProcessedCommand>
    > = jest.fn();
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [
        {
          provide: getRepositoryToken(ProcessedCommand),
          useFactory: repositoryMockFactory,
        },
        IdempotencyService,
        IdempotencyInterceptor,
      ],
    }).compile();

    service = moduleRef.get(IdempotencyService);
    mockedInsert = jest.fn().mockResolvedValue(true);
    mockedUpdate = jest.fn().mockResolvedValue(true);
    mockedGetCommandResponse = jest.fn().mockResolvedValue(null);
    mockedSend = jest.fn();
    mockedCode = jest.fn().mockReturnValue({
      send: mockedSend,
    });
    jest.spyOn(service, 'insertNewCommand').mockImplementation(mockedInsert);
    jest.spyOn(service, 'updateStatus').mockImplementation(mockedUpdate);
    jest
      .spyOn(service, 'getCommandResponse')
      .mockImplementation(mockedGetCommandResponse);

    interceptor = moduleRef.get(IdempotencyInterceptor);

    next = {
      handle: jest.fn().mockReturnValue(of('OK')),
    } as jest.Mocked<CallHandler>;

    context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'x-command-id': 'abc', 'x-correlation-id': 'xyz' },
        }),
        getResponse: () => ({
          code: mockedCode,
        }),
      }),
    } as Partial<ExecutionContext>;
  });

  it('should insert a pending command and update it after success', async () => {
    next = {
      handle: jest.fn().mockReturnValue(of('OK')),
    } as jest.Mocked<CallHandler>;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = await interceptor.intercept(context as any, next);

    expect(mockedInsert).toHaveBeenCalledTimes(1);
    expect(mockedInsert).toHaveBeenCalledWith('abc', 'xyz');
    expect(mockedUpdate).toHaveBeenCalledTimes(0);
    await firstValueFrom(result);
    expect(mockedUpdate).toHaveBeenCalledTimes(1);
    // simulate response emission
    expect(mockedUpdate).toHaveBeenCalledWith('abc', {
      status: ProcessedCommandStatus.SUCCESS,
      response: '"OK"',
    });
  });

  it('should return existing response if command already processed', async () => {
    mockedInsert = jest.fn().mockResolvedValue(false);
    mockedGetCommandResponse = jest.fn().mockResolvedValue({
      responseStatus: 200,
      responseData: '"OK"',
    });

    jest.spyOn(service, 'insertNewCommand').mockImplementation(mockedInsert);
    jest
      .spyOn(service, 'getCommandResponse')
      .mockImplementation(mockedGetCommandResponse);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = await interceptor.intercept(context as any, next);

    expect(mockedInsert).toHaveBeenCalledTimes(1);
    expect(mockedInsert).toHaveBeenCalledWith('abc', 'xyz');
    expect(mockedUpdate).toHaveBeenCalledTimes(0);

    await firstValueFrom(result);
    expect(mockedGetCommandResponse).toHaveBeenCalledTimes(1);
    expect(mockedGetCommandResponse).toHaveBeenCalledWith('abc');
    expect(mockedUpdate).toHaveBeenCalledTimes(0);
    expect(mockedCode).toHaveBeenCalledTimes(1);
    expect(mockedCode).toHaveBeenCalledWith(200);
    expect(mockedSend).toHaveBeenCalledTimes(1);
    expect(mockedSend).toHaveBeenCalledWith('"OK"');
  });

  it('should throw if command is already pending', async () => {
    mockedInsert = jest.fn().mockResolvedValue(false);
    mockedGetCommandResponse = jest.fn().mockResolvedValue(null);

    jest.spyOn(service, 'insertNewCommand').mockImplementation(mockedInsert);
    jest
      .spyOn(service, 'getCommandResponse')
      .mockImplementation(mockedGetCommandResponse);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = await interceptor.intercept(context as any, next);

    expect(mockedInsert).toHaveBeenCalledTimes(1);
    expect(mockedInsert).toHaveBeenCalledWith('abc', 'xyz');
    expect(mockedUpdate).toHaveBeenCalledTimes(0);

    await firstValueFrom(result);
    expect(mockedGetCommandResponse).toHaveBeenCalledTimes(1);
    expect(mockedGetCommandResponse).toHaveBeenCalledWith('abc');
    expect(mockedUpdate).toHaveBeenCalledTimes(0);
    expect(mockedCode).toHaveBeenCalledTimes(1);
    expect(mockedCode).toHaveBeenCalledWith(409);
    expect(mockedSend).toHaveBeenCalledTimes(1);
    expect(mockedSend).toHaveBeenCalledWith('Command already processed');
  });

  it('should skip idempotency if no command id', async () => {
    mockedInsert = jest.fn().mockResolvedValue(false);
    jest.spyOn(service, 'insertNewCommand').mockImplementation(mockedInsert);
    context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
        getResponse: () => ({
          code: mockedCode,
        }),
      }),
    } as Partial<ExecutionContext>;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await expect(interceptor.intercept(context as any, next)).rejects.toThrow(
      ConflictException,
    );

    expect(mockedInsert).toHaveBeenCalledTimes(0);
  });

  it('should also save failures', async () => {
    mockedInsert = jest.fn().mockResolvedValue(true);
    jest.spyOn(service, 'insertNewCommand').mockImplementation(mockedInsert);
    mockedUpdate = jest.fn().mockResolvedValue(true);
    jest.spyOn(service, 'updateStatus').mockImplementation(mockedUpdate);
    next = {
      handle: jest.fn().mockReturnValue(throwError(() => new Error('ERROR'))),
    } as jest.Mocked<CallHandler>;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = await interceptor.intercept(context as any, next);

    expect(mockedInsert).toHaveBeenCalledTimes(1);
    expect(mockedInsert).toHaveBeenCalledWith('abc', 'xyz');
    expect(mockedUpdate).toHaveBeenCalledTimes(0);
    try {
      await firstValueFrom(result);
    } catch {
      /* empty */
    }
    expect(mockedUpdate).toHaveBeenCalledTimes(1);
    // simulate response emission
    expect(mockedUpdate).toHaveBeenCalledWith('abc', {
      status: ProcessedCommandStatus.ERROR,
      error: 'ERROR',
    });
  });
});
