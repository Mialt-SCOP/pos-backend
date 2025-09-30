import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Organization,
  OrganizationMemberInvitation,
  OrganizationMembers,
} from './organization.entity';
import { MailModule } from 'src/common/mail/mail.module';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      OrganizationMembers,
      OrganizationMemberInvitation,
    ]),
    MailModule,
    UserModule,
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
