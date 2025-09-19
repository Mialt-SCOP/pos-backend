import { Module } from '@nestjs/common';
import { IdentityConfig } from '../identity.config';
import { HasherService } from './hasher.service';

@Module({
  imports: [],
  controllers: [],
  providers: [IdentityConfig, HasherService],
  exports: [HasherService],
})
export class HasherModule {}
