import { Injectable } from '@nestjs/common';
import { hash, verify } from 'argon2';
import { IdentityConfig } from '../identity.config';

@Injectable()
export class HasherService {
  private hashPepper: Buffer;
  constructor(private readonly config: IdentityConfig) {
    const pepperString = this.config.hashPasswordPepper;
    this.hashPepper = Buffer.from(pepperString, 'utf-8');
  }

  async hash(password: string): Promise<string> {
    return await hash(password, {
      secret: this.hashPepper,
    });
  }

  async verify(password: string, hashedPassword: string): Promise<boolean> {
    return verify(hashedPassword, password, {
      secret: this.hashPepper,
    });
  }
}
