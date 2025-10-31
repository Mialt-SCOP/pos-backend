import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from './device.entity';
import { Repository } from 'typeorm';
import { DeviceDto, RegisterDevicePayload } from './device.dto';
import { Organization } from '../organization/organization.entity';
import { createPublicKey, verify } from 'crypto';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device) private readonly repository: Repository<Device>,
  ) {}

  private publicKeyFromBase64(base64: string) {
    try {
      const prefix = Buffer.from([
        0x30,
        0x2a, // SEQUENCE (len=42)
        0x30,
        0x05, // SEQUENCE (len=5)
        0x06,
        0x03,
        0x2b,
        0x65,
        0x70, // OID 1.3.101.112 = Ed25519
        0x03,
        0x21,
        0x00, // BIT STRING (len=33)
      ]);
      const der = Buffer.concat([prefix, Buffer.from(base64, 'base64')]);
      return createPublicKey({ key: der, format: 'der', type: 'spki' });
    } catch (e) {
      console.error(`Invalid public key "${base64}": ${e}`);
    }
    return null;
  }

  private validatePublicKey(base64: string) {
    const key = this.publicKeyFromBase64(base64);
    console.log('key', key);
    if (!key) return false;
    return true;
  }

  async create(
    payload: RegisterDevicePayload,
    organization: Organization,
  ): Promise<DeviceDto> {
    if (!this.validatePublicKey(payload.publicKey)) {
      throw new BadRequestException('Invalid public key');
    }
    const existingDevice = await this.repository.findOne({
      where: { deviceId: payload.deviceId, organizationId: organization.id },
    });
    if (
      existingDevice &&
      existingDevice.publicKeyBase64 === payload.publicKey
    ) {
      return existingDevice.toDto();
    }
    const device = new Device();
    device.deviceId = payload.deviceId;
    device.organizationId = organization.id;
    device.organization = organization;
    device.publicKeyBase64 = payload.publicKey;
    device.meta = payload.meta ?? null;

    const savedDevice = await this.repository.save(device);

    return savedDevice.toDto();
  }

  async findByDeviceId(deviceId: string): Promise<Device | null> {
    return this.repository.findOne({ where: { deviceId } });
  }

  verify(device: Device, data: Buffer, signatureBase64: string) {
    const publicKey = this.publicKeyFromBase64(device.publicKeyBase64);
    if (!publicKey) return false;

    const signature = Buffer.from(signatureBase64, 'base64');
    return verify(null, data, publicKey, signature);
  }
}
