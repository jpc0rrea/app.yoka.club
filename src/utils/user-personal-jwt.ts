/**
 * JWT Utility Functions for User Personal Info Encryption/Decryption
 */

import jwt from 'jsonwebtoken';

export type UserPersonalInfo = {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

type UserPersonalJWTPayload = UserPersonalInfo & {
  exp: number;
  iat: number;
};

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

export function encryptUserPersonalInfo(info: UserPersonalInfo): string {
  const secret = getJWTSecret();
  const now = Math.floor(Date.now() / 1000);
  const oneYear = 365 * 24 * 60 * 60; // seconds

  const payload: UserPersonalJWTPayload = {
    ...info,
    iat: now,
    exp: now + oneYear,
  };

  return jwt.sign(payload, secret, { algorithm: 'HS256' });
}

export function decryptUserPersonalInfo(
  token: string
): UserPersonalInfo | null {
  try {
    const secret = getJWTSecret();
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
    }) as UserPersonalJWTPayload;

    // Defensive pick of only allowed keys
    const result: UserPersonalInfo = {};
    if (decoded.email) result.email = decoded.email;
    if (decoded.firstName) result.firstName = decoded.firstName;
    if (decoded.lastName) result.lastName = decoded.lastName;
    if (decoded.phone) result.phone = decoded.phone;

    return result;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log('User personal info JWT token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn('Invalid user personal info JWT token:', error.message);
    } else {
      console.error('Error decrypting user personal info:', error);
    }
    return null;
  }
}
