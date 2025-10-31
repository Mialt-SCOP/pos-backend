import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { OrganizationModule } from './organization/organization.module';
import { AuthModule } from './auth/auth.module';
import { DeviceModule } from './device/device.module';

@Module({
  imports: [UserModule, OrganizationModule, AuthModule, DeviceModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class IdentityModule {}
