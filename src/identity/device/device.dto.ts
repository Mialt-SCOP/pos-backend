import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDevicePayload {
  @ApiProperty()
  deviceId: string;

  @ApiProperty()
  publicKey: string;

  @ApiPropertyOptional({
    type: 'object',
    properties: {
      brand: { type: 'string', example: 'Fairphone', required: false },
      buildId: { type: 'string', example: '13D15', required: false },
      deviceId: { type: 'string', example: 'goldfish', required: false },
      deviceName: { type: 'string', example: 'Tofu Soyeux', required: false },
      manufacturer: { type: 'string', example: 'Fairphone', required: false },
    },
  })
  meta?: Record<string, string>;
}

export class DeviceDto {
  @ApiProperty()
  id: string;
}
