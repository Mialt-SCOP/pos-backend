import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { HasherModule } from '../hasher/hasher.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), HasherModule],
  controllers: [],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
