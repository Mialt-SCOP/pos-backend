import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  ProcessedCommand,
  ProcessedCommandStatus,
} from './processed-command.entity';
import { CommandId, CorrelationId } from '../Request';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class IdempotencyService {
  constructor(
    @InjectRepository(ProcessedCommand)
    private readonly repostory: Repository<ProcessedCommand>,
  ) {}

  async insertNewCommand(
    commandId: CommandId,
    correlationId: CorrelationId | null,
  ): Promise<boolean> {
    const result = await this.repostory
      .createQueryBuilder()
      .insert()
      .into(ProcessedCommand)
      .values({
        commandId,
        correlationId,
        status: ProcessedCommandStatus.PENDING,
      })
      .orIgnore()
      .returning('processed_command.commandId')
      .execute();
    return Array.isArray(result.raw) && result.raw.length === 1;
  }

  async getCommandResponse(
    commandId: CommandId,
  ): Promise<{ responseData: unknown; responseStatus: number | null } | null> {
    const command = await this.repostory.findOneBy({ commandId });
    if (!command) return null;
    return {
      responseData: command.responseData
        ? JSON.parse(command.responseData)
        : null,
      responseStatus: command.responseStatus,
    };
  }

  async updateStatus(
    commandId: CommandId,
    {
      status,
      response,
      responseStatus,
      error,
    }: {
      status: ProcessedCommandStatus;
      responseStatus?: number;
      response?: string | null;
      error?: string | null;
    },
  ) {
    await this.repostory.update(
      { commandId },
      {
        status,
        responseStatus,
        processedAt: new Date(),
        responseData: response,
        responseError: error,
      },
    );
    return true;
  }
}
