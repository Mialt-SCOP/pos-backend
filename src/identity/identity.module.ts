import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { OrganizationModule } from './organization/organization.module';

@Module({
  imports: [UserModule, OrganizationModule],
  controllers: [],
  providers: [],
})
export class IdentityModule {}
