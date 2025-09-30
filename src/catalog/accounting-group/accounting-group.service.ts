import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountingGroup } from './accounting-group.entity';
import { Repository } from 'typeorm';
import { PaginatedResultsI, PaginationDto } from 'src/common/pagination';
import { Organization } from 'src/identity/organization/organization.entity';
import {
  AccountingGroupCreatePayload,
  AccountingGroupDto,
} from './accounting-group.dto';

@Injectable()
export class AccountingGroupService {
  constructor(
    @InjectRepository(AccountingGroup)
    private readonly accountingGroupRepository: Repository<AccountingGroup>,
  ) {}

  async findAll(
    organization: Organization,
    pagination: PaginationDto,
  ): Promise<PaginatedResultsI<AccountingGroupDto>> {
    if (pagination.query) {
      const [items, results] = await this.accountingGroupRepository.manager
        .createQueryBuilder(AccountingGroup, 'a')
        .select()
        .where(
          `a."organizationId" = :organizationId
                AND to_tsvector('simple', a.name) @@ (websearch_to_tsquery('simple', :query)::text || ':*')::tsquery`,
          {
            query: pagination.query,
            organizationId: organization.id,
          },
        )
        .orderBy(`a.createdAt`, 'DESC')
        .offset(pagination.offset)
        .limit(pagination.limit)
        .getManyAndCount();

      return {
        items: items.map((item) => item.toDto()),
        results,
      };
    }
    const [items, results] = await this.accountingGroupRepository.findAndCount({
      where: { organizationId: organization.id },
      skip: pagination.offset,
      take: pagination.limit,
      order: { createdAt: 'DESC' },
    });
    return {
      items: items.map((item) => item.toDto()),
      results,
    };
  }

  async create(
    organization: Organization,
    payload: AccountingGroupCreatePayload,
  ): Promise<AccountingGroupDto> {
    const accountingGroup = new AccountingGroup();
    accountingGroup.name = payload.name;
    accountingGroup.organizationId = organization.id;
    accountingGroup.vatRate = payload.vatRate;
    const createdAccountingGroup =
      await this.accountingGroupRepository.save(accountingGroup);
    return createdAccountingGroup.toDto();
  }
}
