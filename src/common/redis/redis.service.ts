import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Redis, RedisKey } from 'ioredis';
import { RedisConfig } from './redis.config';

const DEFAULT_TTL = 24 * 3600;
const PREFIX = 'POS:';
const PREFIX_BUFFER = Buffer.from(PREFIX);

const prefixKey = (key: RedisKey) =>
  typeof key === 'string'
    ? `${PREFIX}${key}`
    : Buffer.concat([PREFIX_BUFFER, key]);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class RedisService implements OnModuleDestroy {
  private redisClient: Redis | undefined;
  private logger = new Logger(RedisService.name);

  constructor(config: RedisConfig) {
    this.redisClient = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      maxLoadingRetryTime: 5,
    });
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect(false);
      delete this.redisClient;
      this.redisClient = undefined;
    }
  }

  async testConnection(remainingRetry = 5): Promise<boolean> {
    if (!this.redisClient) return false;
    try {
      await this.redisClient.ping();
      return true;
    } catch {
      if (remainingRetry > 0) {
        await sleep(1000 * (6 - remainingRetry));
        return await this.testConnection(remainingRetry - 1);
      }
      this.redisClient.disconnect();
      delete this.redisClient;
      this.redisClient = undefined;
    }
    return false;
  }

  duplicate(): Redis | null {
    if (!this.redisClient) return null;
    return this.redisClient.duplicate();
  }

  async get(key: RedisKey): Promise<string | null> {
    if (!this.redisClient) return null;
    return await this.redisClient.get(prefixKey(key));
  }

  async set(
    key: RedisKey,
    value: string | number | Buffer,
    ttl: number = DEFAULT_TTL,
  ): Promise<'OK'> {
    if (!this.redisClient) return 'OK';
    return await this.redisClient.set(prefixKey(key), value, 'EX', ttl);
  }

  async hset(key: RedisKey, field: string, value: string | number | Buffer) {
    if (!this.redisClient) return;
    return await this.redisClient.hset(key, field, value);
  }

  async hget(key: RedisKey, field: string): Promise<string | null> {
    if (!this.redisClient) return null;
    return await this.redisClient.hget(key, field);
  }

  async subscribe(key: string) {
    if (!this.redisClient) return null;
    const subscriber = this.redisClient.duplicate();
    await subscriber.subscribe(key, (err, count: number) => {
      if (err) {
        this.logger.error(`Failed to subscribe to ${key}: ${err.message}`);
      } else {
        this.logger.log(
          `Subscribed successfully to ${key}! This client is currently subscribed to ${count} channels.`,
        );
      }
    });
    return subscriber;
  }
  async publish(key: string, message: string) {
    if (!this.redisClient) return null;
    await this.redisClient.publish(key, message);
  }
}
