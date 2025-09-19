import { SetMetadata } from '@nestjs/common';
import { UserOrganizationRole } from '../organization/organization.types';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserOrganizationRole[]) =>
  SetMetadata(ROLES_KEY, roles);
