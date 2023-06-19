export interface HashAdapter {
  hash: (value: string, salt: number) => string;
  compareHash: (value: string, hash: string) => Promise<boolean>;
}
