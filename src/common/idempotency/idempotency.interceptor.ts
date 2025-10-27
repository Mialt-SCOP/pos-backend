import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  ConflictException,
} from '@nestjs/common';
import { Observable, catchError, of, tap } from 'rxjs';
import { ProcessedCommandStatus } from './processed-command.entity';
import type { CommandId, CorrelationId, Request } from 'src/common/Request';
import { FastifyReply } from 'fastify';
import { IdempotencyService } from './idempotency.service';

const getHeaderValue = <T extends string>(
  request: Request,
  key: string,
): T | null => {
  const value = request.headers[key];
  if (Array.isArray(value)) return value[0] as T;
  if (typeof value === 'string') return value as T;
  return null;
};

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly service: IdempotencyService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const commandId = getHeaderValue<CommandId>(request, 'x-command-id');
    const correlationId = getHeaderValue<CorrelationId>(
      request,
      'x-correlation-id',
    );

    if (!commandId) {
      throw new ConflictException(
        'Missing required header x-command-id for idempotent operation',
      );
    }

    const success = await this.service.insertNewCommand(
      commandId,
      correlationId,
    );

    if (!success) {
      const result = await this.service.getCommandResponse(commandId);
      const response = context.switchToHttp().getResponse<FastifyReply>();
      if (result && result.responseStatus) {
        response.code(result.responseStatus).send(result.responseData);
      } else {
        response.code(409).send('Command already processed');
      }
      return of({});
    }

    return next.handle().pipe(
      tap((response) => {
        const reply = context.switchToHttp().getResponse<FastifyReply>();

        this.service
          .updateStatus(commandId, {
            status: ProcessedCommandStatus.SUCCESS,
            response: JSON.stringify(response),
            responseStatus: reply.statusCode,
          })
          .catch((error) => {
            console.error(error);
          });
      }),
      catchError(async (error: Error) => {
        const reply = context.switchToHttp().getResponse<FastifyReply>();
        await this.service.updateStatus(commandId, {
          status: ProcessedCommandStatus.ERROR,
          error: `${error.message}`,
          responseStatus: reply.statusCode,
        });
        throw error;
      }),
    );
  }
}
