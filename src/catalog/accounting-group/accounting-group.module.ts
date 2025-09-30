import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingGroup } from './accounting-group.entity';
import { AccountingGroupController } from './accounting-group.controller';
import { AccountingGroupService } from './accounting-group.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccountingGroup])],
  controllers: [AccountingGroupController],
  providers: [AccountingGroupService],
  exports: [],
})
export class AccountingGroupModule {}
