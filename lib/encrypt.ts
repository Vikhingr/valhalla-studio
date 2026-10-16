/**
 * lib/encrypt.ts — Cifrado simétrico AES-256-CBC para datos fiscales sensibles.
 *
 * Se usa exclusivamente para guardar en Supabase las llaves de FacturAPI y los
 * archivos del CSD (certificado de sello digital) del SAT. El valor cifrado se
 * almacena como string "ivHex:ciphertextHex".
 *
 * Variables de entorno:
 *   ENCRYPTION_KEY  — clave maestra dedicada a cifrado en reposo. NUNCA debe
 *                     rotarse una vez que hay datos en producción, porque haría
 *                     ilegibles todos los registros cifrados existentes.
 *   SESSION_SECRET  — se usa como fallback solo en dev si ENCRYPTION_KEY no existe.
 *
 * Restricción de seguridad: ENCRYPTION_KEY y SESSION_SECRET deben ser distintas.
 * SESSION_SECRET es para cookies de sesión; ENCRYPTION_KEY es para datos en reposo.
 */
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const ALG = 'aes-256-cbc';

/**
 * Deriva la clave de 32 bytes a partir de ENCRYPTION_KEY usando scrypt.
 * La sal 'vs-fiscal-v1' es fija e identifica este esquema de cifrado —
 * cambiarla equivaldría a rotar la clave y rompería los datos existentes.
 */
async function derivedKey(): Promise<Buffer> {
  const secret = process.env.ENCRYPTION_KEY ?? process.env.SESSION_SECRET ?? 'valhalla-dev-insecure';
  return scryptAsync(secret, 'vs-fiscal-v1', 32) as Promise<Buffer>;
}

/**
 * Cifra un string de texto plano.
 * Genera un IV aleatorio de 16 bytes por cada llamada para garantizar que
 * el mismo texto siempre produzca un ciphertext distinto.
 * @returns string con formato "ivHex:ciphertextHex"
 */
export async function encrypt(text: string): Promise<string> {
  const k = await derivedKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALG, k, iv);
  const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${enc.toString('hex')}`;
}

/**
 * Descifra un string producido por `encrypt`.
 * @throws Error si el formato no es "ivHex:ciphertextHex" válido.
 */
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
