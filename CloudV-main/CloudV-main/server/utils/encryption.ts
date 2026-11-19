import Cryptr from 'cryptr';
import dotenv from "dotenv";
dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY is not configured');
}

const cryptr = new Cryptr(ENCRYPTION_KEY);

export function encrypt(value: string): string {
  return cryptr.encrypt(value);
}

export function decrypt(value: string): string {
  try {
    return cryptr.decrypt(value);
  } catch {
    return value;
  }
}