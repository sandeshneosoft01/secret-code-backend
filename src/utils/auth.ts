import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { tokenInfo } from '@config/index';
import admin from 'firebase-admin';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  user_id?: string;
  _id?: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, tokenInfo.jwtSecret, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, tokenInfo.jwtSecret) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export async function isFirebaseIdToken(token: string): Promise<admin.auth.DecodedIdToken | null> {
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded; // valid Firebase token
  } catch (err) {
    return null; // invalid or not a Firebase token
  }
}
