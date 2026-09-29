// Backend/services/cryptoService.js - Password Hashing & Token Service
import crypto from 'crypto';

const ITERATIONS = 100000;
const KEY_LEN = 32;
const DIGEST = 'sha256';

export function hashPasswordSync(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST).toString('hex');
  return `${salt}:${hash}`;
}

export async function hashPassword(password) {
  return hashPasswordSync(password);
}

export function verifyPasswordSync(password, storedHash) {
  if (!password || !storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) return false;
  try {
    const testHash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch (e) {
    return false;
  }
}

export async function verifyPassword(password, storedHash) {
  return verifyPasswordSync(password, storedHash);
}

export function generateToken(payload, secret = process.env.JWT_SECRET || 'skillswap_secret') {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}
