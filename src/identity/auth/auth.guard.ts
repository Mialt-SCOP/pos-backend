import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';
import { IS_PUBLIC_KEY, ROLES_KEY } from './auth.decorators';
import { UserOrganizationRole } from '../organization/organization.types';
import { JwtCreatePayload } from './auth.dto';
import { UserService } from '../user/user.service';
import { OrganizationService } from '../organization/organization.service';
import { Request } from 'src/common/Request';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = await this.setUserFromTokenIfExists(context);
    await this.setOrganization(request);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<
      UserOrganizationRole[]
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!request.user) throw new UnauthorizedException();

    if (!requiredRoles) return true;

    return (
      !!request.role &&
      (request.role === UserOrganizationRole.OWNER ||
        request.role === UserOrganizationRole.ADMIN ||
        requiredRoles.includes(request.role))
    );
  }

  private async setUserFromTokenIfExists(
    context: ExecutionContext,
  ): Promise<Request> {
    const request = context.switchToHttp().getRequest<Request>();
    request.user = null;

    const token = this.extractTokenFromHeader(request);
    if (token) {
      try {
        const payload =
          await this.jwtService.verifyAsync<JwtCreatePayload>(token);
        // 💡 We're assigning the payload to the request object here
        // so that we can access it in our route handlers
        request.user = await this.userService.findOne(payload.sub);
      } catch {
        return request;
      }
    }
    return request;
  }

  private async setOrganization(request: Request) {
    const user = request.user;
    if (!user) return;
    const { organizationId } = request.params as { organizationId?: string };
    if (!organizationId) return;
    const organization = await this.organizationService.findOne(organizationId);
    if (!organization || !organization.isActive) {
      throw new UnauthorizedException('This organization does not exist');
    }
    const member = organization.members.find((m) => m.userId === user.id);
    if (member) {
      request.organization = organization;
      request.role = member.role;
    }
  }

  private extractTokenFromHeader(request: FastifyRequest): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
