import {
  IsArray,
  IsDate,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class IncomingEventDto {
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  orderId?: string | null;

  @IsString()
  @IsOptional()
  paymentId?: string | null;

  @IsString()
  type: string;

  @IsString()
  data: string; // JSON.stringify(event payload)

  @IsString()
  @IsOptional()
  prevHash?: string | null;

  @IsString()
  hash: string; // sha256

  @IsString()
  signature: string; // base64 Ed25519 signature

  @IsDate()
  createdAt: Date;
}

export class SyncEventsDto {
  @IsString()
  deviceId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IncomingEventDto)
  events: IncomingEventDto[];
}
