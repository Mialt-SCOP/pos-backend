import { Injectable } from '@nestjs/common';
import { MoreThan, Not, Repository } from 'typeorm';
import { EventEntity } from './event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from 'src/identity/organization/organization.entity';

@Injectable()
export class EventRepository {
  constructor(
    @InjectRepository(EventEntity)
    private readonly repo: Repository<EventEntity>,
  ) {}

  async exists(id: string) {
    return await this.repo.existsBy({ id });
  }

  async insert(event: Partial<EventEntity>) {
    await this.repo.insert(event);
  }

  async findMissingForDevice(
    organization: Organization,
    excludeDeviceId: string,
    afterId: string,
  ) {
    return this.repo.find({
      where: {
        organizationId: organization.id,
        deviceId: Not(excludeDeviceId),
        id: MoreThan(afterId),
      },
      order: { id: 'ASC' },
    });
  }
}
