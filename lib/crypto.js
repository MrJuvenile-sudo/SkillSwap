// lib/crypto.js - Pure WebCrypto PBKDF2 Password Hashing & Session Cryptography

const ITERATIONS = 100000;
const KEY_LEN = 256;
const DIGEST = 'SHA-256';

/**
 * Derives a PBKDF2 hash from a plaintext password using WebCrypto
 */
export async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('');

  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: ITERATIONS,
      hash: DIGEST
    },
    passwordKey,
    KEY_LEN
  );

  const hashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${saltHex}:${hashHex}`;
}

/**
 * Verifies a plaintext password against a stored salt:hash string
 */
export async function verifyPassword(password, storedHash) {
  if (!password || !storedHash || !storedHash.includes(':')) {
    return false;
  }

  const [saltHex, expectedHashHex] = storedHash.split(':');
  if (!saltHex || !expectedHashHex) return false;

  const saltBytes = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: ITERATIONS,
      hash: DIGEST
    },
    passwordKey,
    KEY_LEN
  );

  const derivedHashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
  return derivedHashHex === expectedHashHex;
}

/**
 * Generates a cryptographically secure random token (e.g. for sessions or password resets)
 */
export function generateSecureToken(byteLength = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}