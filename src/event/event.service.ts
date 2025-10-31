import { Injectable, BadRequestException } from '@nestjs/common';
import { EventRepository } from './event.repository';
import { createHash } from 'crypto';
import { DeviceService } from 'src/identity/device/device.service';
import { IncomingEventDto, SyncEventsDto } from './event.dto';
import { canonicalize } from 'json-canonicalize';
import { Organization } from 'src/identity/organization/organization.entity';

@Injectable()
export class EventService {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly eventRepo: EventRepository,
  ) {}

  async sync(dto: SyncEventsDto, organization: Organization) {
    const device = await this.deviceService.findByDeviceId(dto.deviceId);
    if (!device) throw new BadRequestException('Unknown device');

    const storedEvents = [];
    const rejectedEvents = [];

    for (const event of dto.events) {
      const eventData: Omit<IncomingEventDto, 'hash' | 'signature'> = {
        id: event.id,
        type: event.type,
        data: event.data,
        createdAt: event.createdAt,
        prevHash: event.prevHash ?? undefined,
      };
      if (event.orderId) eventData.orderId = event.orderId;
      if (event.paymentId) eventData.paymentId = event.paymentId;
      const data = canonicalize(eventData);

      const computedHash = createHash('sha256').update(data).digest('base64');
      if (event.hash !== computedHash) {
        console.error('Invalid hash', event.hash, computedHash, data);
        rejectedEvents.push({ id: event.id, reason: 'Invalid hash' });
        continue;
      }

      const dataWithHash = Buffer.from(
        canonicalize({
          ...eventData,
          hash: event.hash,
        }),
      );
      const isValid = this.deviceService.verify(
        device,
        dataWithHash,
        event.signature,
      );

      if (!isValid) {
        console.error(`Invalid signature`, event.signature);
        rejectedEvents.push({ id: event.id, reason: 'Invalid signature' });
        continue;
      }

      // Vérifie idempotence
      const exists = await this.eventRepo.exists(event.id);
      if (exists) {
        storedEvents.push(event.id);
        continue;
      }

      // Enregistre l’event
      await this.eventRepo.insert({
        id: event.id,
        orderId: event.orderId ?? null,
        paymentId: event.paymentId ?? null,
        type: event.type,
        data: event.data,
        prevHash: event.prevHash ?? null,
        hash: event.hash,
        signature: event.signature,
        createdAt: event.createdAt,
        deviceId: dto.deviceId,
        organizationId: organization.id,
      });

      storedEvents.push(event.id);
    }

    return {
      accepted: storedEvents,
      rejected: rejectedEvents,
    };
  }
}
