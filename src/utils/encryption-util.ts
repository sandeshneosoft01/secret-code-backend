import crypto from 'crypto';
import { encryption } from '@config/index';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
const KEY = crypto.createHash('sha256').update(String(encryption.secretKey)).digest();

/**
 * Encrypts a clear text string.
 * @param text The text to encrypt
 * @returns The encrypted text in the format iv:encryptedData
 */
export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY), iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypts an encrypted string.
 * @param text The encrypted text in the format iv:encryptedData
 * @returns The decrypted clear text
 */
export const decrypt = (text: string): string => {
  try {
    const textParts = text.split(':');
    if (textParts.length !== 2) {
      // If it doesn't match our format, it might be unencrypted or corrupted
      return text;
    }

    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY), iv);

    let decrypted = decipher.update(encryptedText, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    // Return original text if decryption fails (might be legacy unencrypted data)
    return text;
  }
};

/**
 * Generates a SHA-256 hash of the input text.
 * Used for creating searchable blind indexes of encrypted data.
 * @param text The text to hash
 * @returns The hex encoded hash
 */
export const generateHash = (text: string): string => {
  return crypto.createHash('sha256').update(text).digest('hex');
};
