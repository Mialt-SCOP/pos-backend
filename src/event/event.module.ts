import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './event.entity';
import { EventRepository } from './event.repository';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { IdempotencyModule } from 'src/common/idempotency/idempotency.module';
import { DeviceModule } from 'src/identity/device/device.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventEntity]),
    IdempotencyModule,
    DeviceModule,
  ],
  controllers: [EventController],
  providers: [EventRepository, EventService],
  exports: [],
})
export class EventModule {}
