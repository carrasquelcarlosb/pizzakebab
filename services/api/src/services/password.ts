import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto';

const ITERATIONS = 120000;
const KEY_LENGTH = 32;
const DIGEST = 'sha256';

export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return `${ITERATIONS}:${salt}:${derivedKey}`;
};

export const verifyPassword = (password: string, storedHash: string): boolean => {
  const [iterationStr, salt, storedKey] = storedHash.split(':');
  if (!iterationStr || !salt || !storedKey) {
    return false;
  }

  const iterations = Number.parseInt(iterationStr, 10);
  if (!Number.isFinite(iterations) || iterations <= 0) {
    return false;
  }

  const derived = pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST).toString('hex');
  const derivedBuffer = Buffer.from(derived, 'hex');
  const storedBuffer = Buffer.from(storedKey, 'hex');

  if (derivedBuffer.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(derivedBuffer, storedBuffer);
};
