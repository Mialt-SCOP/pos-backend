import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Organization,
  OrganizationMemberInvitation,
  OrganizationMembers,
} from './organization.entity';
import { Repository } from 'typeorm';
import {
  CreateOrganizationDto,
  InviteMemberDto,
  OrganizationInvitation,
  PendingInvitation,
} from './organization.dto';
import { UserOrganizationRole } from './organization.types';
import { User } from '../user/user.entity';
import { MailService } from 'src/common/mail/mail.service';

@Injectable()
export class OrganizationService {
  private readonly frontendBaseUrl: string;
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationMembers)
    private readonly organizationMembersRepository: Repository<OrganizationMembers>,
    @InjectRepository(OrganizationMemberInvitation)
    private readonly organizationMemberInvitation: Repository<OrganizationMemberInvitation>,
    private readonly mailService: MailService,
  ) {}

  async create(
    createOrganizationData: CreateOrganizationDto,
    userId: string,
  ): Promise<Organization> {
    const organization = new Organization();
    organization.name = createOrganizationData.name;
    const createdOrganization =
      await this.organizationRepository.save(organization);
    const organizationMember = new OrganizationMembers();
    organizationMember.organizationId = createdOrganization.id;
    organizationMember.userId = userId;
    organizationMember.role = UserOrganizationRole.OWNER;
    const createdMember =
      await this.organizationMembersRepository.save(organizationMember);
    createdOrganization.members = [createdMember];
    return createdOrganization;
  }

  async inviteMember(
    user: User,
    organization: Organization,
    payload: InviteMemberDto,
  ): Promise<boolean> {
    const existingInvitation =
      await this.organizationMemberInvitation.findOneBy({
        organizationId: organization.id,
        email: payload.email,
        used: false,
      });
    if (existingInvitation) {
      existingInvitation.role = payload.role;
      await this.organizationMemberInvitation.save(existingInvitation);
      return true;
    }

    const invitation = new OrganizationMemberInvitation();
    invitation.organizationId = organization.id;
    invitation.email = payload.email;
    invitation.role = payload.role;
    const createdInvitation =
      await this.organizationMemberInvitation.save(invitation);
    const mailSent = await this.mailService.sendEmail(
      { email: createdInvitation.email },
      `Vous avez été invité·e à rejoindre ${organization.name}`,
      `<html><head></head><body>
        <p>Bonjour,<br />${user.displayName} vous a invité à rejoindre ${organization.name}</p>
        <p>Cliquez sur le lien suivant pour rejoindre : <a href="${this.frontendBaseUrl}/invitation/${invitation.id}">${this.frontendBaseUrl}/invitation/${invitation.id}</a></p>
      </body></html>`,
    );
    return mailSent;
  }

  async getInvitedPeople(
    organization: Organization,
  ): Promise<PendingInvitation[]> {
    const invitations = await this.organizationMemberInvitation.findBy({
      organizationId: organization.id,
    });
    return invitations.map((invitation) => ({
      email: invitation.email,
      role: invitation.role,
      createdAt: invitation.createdAt,
    }));
  }

  async getInvitation(invitationId: string): Promise<OrganizationInvitation> {
    const invitation = await this.organizationMemberInvitation.findOne({
      where: {
        id: invitationId,
      },
      relations: ['organization'],
    });
    if (!invitation) {
      throw new NotFoundException();
    }
    return {
      organization: {
        id: invitation.organization.id,
        name: invitation.organization.name,
      },
      role: invitation.role,
    };
  }

  async acceptInvitation(
    organization: Organization,
    user: User,
    invitationId: string,
  ): Promise<boolean> {
    const invitation = await this.organizationMemberInvitation.findOneBy({
      id: invitationId,
    });
    if (!invitation) throw new NotFoundException();

    if (invitation.organizationId !== organization.id) {
      throw new BadRequestException(
        'This invitation is not for this organization',
      );
    }

    if (invitation.used) {
      throw new BadRequestException('This invitation has already been used.');
    }

    if (
      !user.email ||
      invitation.email.toLocaleLowerCase() !== user.email.toLowerCase()
    ) {
      throw new ForbiddenException('This invitation was not for you.');
    }

    invitation.used = true;
    invitation.usedAt = new Date();

    const organizationMember = new OrganizationMembers();
    organizationMember.organizationId = invitation.organizationId;
    organizationMember.userId = user.id;
    organizationMember.role = invitation.role;

    await this.organizationMemberInvitation.manager.transaction(
      async (transactionEntityManager) => {
        await transactionEntityManager.save(invitation);
        await transactionEntityManager.save(organizationMember);
      },
    );
    return true;
  }

  async findOne(id: string, fetchMembers = true): Promise<Organization | null> {
    return this.organizationRepository.findOne({
      where: { id },
      relations: fetchMembers ? { members: true } : {},
    });
  }

  async findByMember(userId: string): Promise<Organization[]> {
    const organizations = await this.organizationMembersRepository.findBy({
      userId,
    });
    return organizations.map((organization) => organization.organization);
  }
}
