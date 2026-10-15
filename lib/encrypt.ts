import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const ALG = 'aes-256-cbc';

async function derivedKey(): Promise<Buffer> {
  const secret = process.env.SESSION_SECRET ?? 'valhalla-dev-insecure';
  return scryptAsync(secret, 'vs-fiscal-v1', 32) as Promise<Buffer>;
}

export async function encrypt(text: string): Promise<string> {
  const k = await derivedKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALG, k, iv);
  const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${enc.toString('hex')}`;
}

export async function decrypt(ciphertext: string): Promise<string> {
  const k = await derivedKey();
  const [ivHex, encHex] = ciphertext.split(':');
  if (!ivHex || !encHex) throw new Error('Encrypted value invalid');
  const decipher = createDecipheriv(ALG, k, Buffer.from(ivHex, 'hex'));
  return Buffer.concat([
    decipher.update(Buffer.from(encHex, 'hex')),
    decipher.final(),
  ]).toString('utf8');
}
