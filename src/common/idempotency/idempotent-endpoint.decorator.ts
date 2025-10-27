import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { IdempotencyInterceptor } from './idempotency.interceptor';

export function IdempotentEndpoint() {
  return applyDecorators(UseInterceptors(IdempotencyInterceptor));
}
