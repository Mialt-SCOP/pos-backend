import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Organization,
  OrganizationMemberInvitation,
  OrganizationMembers,
} from './organization.entity';
import { MailModule } from 'src/common/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      OrganizationMembers,
      OrganizationMemberInvitation,
    ]),
    MailModule,
  ],
  controllers: [],
  providers: [],
})
export class OrganizationModule {}
