import { FastifyRequest } from 'fastify';
import { UserOrganizationRole } from 'src/identity/organization/organization.types';
import { User } from 'src/identity/user/user.entity';
import { Organization } from 'src/identity/organization/organization.entity';
import { Opaque } from './Opaque';

export type CommandId = Opaque<string, { readonly T: unique symbol }>;
export type CorrelationId = Opaque<string, { readonly T: unique symbol }>;

export type Request = FastifyRequest & {
  user: User | null;
  organization: Organization | null;
  role: UserOrganizationRole | null;
  commandId: CommandId | null;
  correlationId: CorrelationId | null;
};
export type AuthenticatedRequest = FastifyRequest & {
  user: User;
};
export type AuthenticatedRequestWithOrganization = AuthenticatedRequest & {
  organization: Organization;
  role: UserOrganizationRole;
};
