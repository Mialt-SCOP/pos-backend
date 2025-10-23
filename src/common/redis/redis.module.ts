import { Module } from '@nestjs/common';
import { RedisConfig } from './redis.config';
import { RedisService } from './redis.service';

@Module({
  imports: [],
  providers: [RedisConfig, RedisService],
  exports: [RedisConfig, RedisService],
})
export class RedisModule {}
