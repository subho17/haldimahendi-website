// Password hashing helpers using Node's built-in crypto (scrypt).
// Passwords are never stored in plaintext — only a salt + derived hash.
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

const KEY_LEN = 64;

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, KEY_LEN)) as Buffer;
  return { hash: derivedKey.toString('hex'), salt };
}

export async function verifyPassword(
  password: string,
  hash: string,
  salt: string
): Promise<boolean> {
  try {
    const expected = Buffer.from(hash, 'hex');
    const derivedKey = (await scrypt(password, salt, expected.length || KEY_LEN)) as Buffer;
    return derivedKey.length === expected.length && timingSafeEqual(derivedKey, expected);
  } catch {
    return false;
  }
}