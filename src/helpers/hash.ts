const {
  createHash,
} = require('node:crypto');

export function getHashOf (plainText: string): string {
  return createHash('sha256').update(plainText).digest('hex');
}
