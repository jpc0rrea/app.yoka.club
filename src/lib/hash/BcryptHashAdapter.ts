import { compare, genSaltSync, hashSync } from 'bcryptjs';
import { HashAdapter } from './hashAdapter';

export class BcryptHashAdapter implements HashAdapter {
  hash(value: string, salt: number): string {
    const genSalt = genSaltSync(salt);
    const hash = hashSync(value, genSalt);

    return hash;
  }

  async compareHash(value: string, hash: string): Promise<boolean> {
    const isValueAndHashEquals = await compare(value, hash);

    return isValueAndHashEquals;
  }
}
