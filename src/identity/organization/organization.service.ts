import {
  BadRequestException,
  ForbiddenException,
  Inject,
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
  OrganizationMembersDto,
  OrganizationSummary,
} from './organization.dto';
import { UserOrganizationRole } from './organization.types';
import { User } from '../user/user.entity';
import {
  MAIL_PROVIDER,
  type MailServiceI,
} from 'src/common/mail/mail.interface';
import { PaginatedResultsI, PaginationDto } from 'src/common/pagination';

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
    @Inject(MAIL_PROVIDER) private readonly mailService: MailServiceI,
  ) {}

  async findAll(user: User): Promise<OrganizationSummary[]> {
    const organizations = await this.organizationRepository.find({
      where: {
        members: {
          userId: user.id,
        },
      },
    });
    return organizations.map((organization) => organization.toSummaryDto());
  }

  async create(
    createOrganizationData: CreateOrganizationDto,
    user: User,
  ): Promise<Organization> {
    const organization = new Organization();
    organization.name = createOrganizationData.name;
    const createdOrganization =
      await this.organizationRepository.save(organization);
    const organizationMember = new OrganizationMembers();
    organizationMember.organizationId = createdOrganization.id;
    organizationMember.userId = user.id;
    organizationMember.role = UserOrganizationRole.OWNER;
    const createdMember =
      await this.organizationMembersRepository.save(organizationMember);
    createdOrganization.members = [createdMember];
    return createdOrganization;
  }

  async findOrganizationMembers(
    organization: Organization,
    pagination: PaginationDto,
  ): Promise<PaginatedResultsI<OrganizationMembersDto>> {
    let query = this.organizationMembersRepository.manager
      .createQueryBuilder(OrganizationMembers, 'm')
      .select()
      .where(`m."organizationId" = :organizationId`, {
        organizationId: organization.id,
      })
      .leftJoinAndSelect('m.user', 'u');

    if (pagination.query) {
      query = query.andWhere(
        `to_tsvector('simple', u.username) @@ (websearch_to_tsquery('simple', :query)::text || ':*')::tsquery`,
        { query: pagination.query },
      );
    }
    query = query
      .addOrderBy(`u.createdAt`, 'DESC')
      .offset(pagination.offset)
      .limit(pagination.limit);

    const [items, results] = await query.getManyAndCount();

    return {
      items: items.map((item) => item.toDto()),
      results,
    };
  }

  async inviteMember(
    user: User,
    organization: Organization,
    payload: InviteMemberDto,
  ): Promise<InviteMemberDto> {
    const existingInvitation =
      await this.organizationMemberInvitation.findOneBy({
        organizationId: organization.id,
        email: payload.email,
        used: false,
      });
    if (existingInvitation) {
      existingInvitation.role = payload.role;
      await this.organizationMemberInvitation.save(existingInvitation);
      return existingInvitation.toDto();
    }

    const invitation = new OrganizationMemberInvitation();
    invitation.organizationId = organization.id;
    invitation.email = payload.email;
    invitation.role = payload.role;
    const createdInvitation =
      await this.organizationMemberInvitation.save(invitation);

    await this.mailService.sendEmail(
      { email: createdInvitation.email },
      `Vous avez été invité·e à rejoindre ${organization.name}`,
      `<html><head></head><body>
        <p>Bonjour,<br />${user.displayName} vous a invité à rejoindre ${organization.name}</p>
        <p>Cliquez sur le lien suivant pour rejoindre : <a href="${this.frontendBaseUrl}/invitation/${invitation.id}">${this.frontendBaseUrl}/invitation/${invitation.id}</a></p>
      </body></html>`,
    );
    return createdInvitation.toDto();
  }

  async getInvitedPeople(
    organization: Organization,
    pagination: PaginationDto,
  ): Promise<PaginatedResultsI<InviteMemberDto>> {
    let query = this.organizationMemberInvitation.manager
      .createQueryBuilder(OrganizationMemberInvitation, 'm')
      .select()
      .where(`m."organizationId" = :organizationId`, {
        organizationId: organization.id,
      })
      .andWhere(`m.used = false`);

    if (pagination.query) {
      query = query.andWhere(
        `to_tsvector('simple', u.email) @@ (websearch_to_tsquery('simple', :query)::text || ':*')::tsquery`,
        { query: pagination.query },
      );
    }
    query = query
      .addOrderBy(`m.createdAt`, 'DESC')
      .offset(pagination.offset)
      .limit(pagination.limit);

    const [items, results] = await query.getManyAndCount();

    return {
      items: items.map((item) => item.toDto()),
      results,
    };
  }

  async getInvitation(invitationId: string): Promise<OrganizationInvitation> {
    const invitation = await this.organizationMemberInvitation.findOne({
      where: {
        id: invitationId,
        used: false,
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
      email: invitation.email,
    };
  }

  async acceptInvitation(
    organization: Organization,
    user: User,
    invitationId: string,
  ): Promise<true> {
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
