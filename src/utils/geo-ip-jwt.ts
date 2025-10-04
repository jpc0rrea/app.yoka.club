/**
 * JWT Utility Functions for Geo IP Data Encryption/Decryption
 *
 * This utility handles JWT-based encryption and decryption of geo location data
 * for caching user location information securely in cookies.
 */

import jwt from 'jsonwebtoken';

export interface GeoIPData {
  ip: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  timestamp: number; // Unix timestamp when data was cached
}

interface JWTPayload extends GeoIPData {
  exp: number; // JWT expiration
  iat: number; // JWT issued at
}

/**
 * Get JWT secret from environment variables
 */
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

/**
 * Encrypt geo IP data into a JWT token
 *
 * @param geoData - Geo location data to encrypt
 * @returns Encrypted JWT token
 */
export function encryptGeoIPData(geoData: GeoIPData): string {
  const secret = getJWTSecret();
  const now = Math.floor(Date.now() / 1000);
  const oneYear = 365 * 24 * 60 * 60; // 1 year in seconds

  const payload: JWTPayload = {
    ...geoData,
    iat: now,
    exp: now + oneYear, // Expires in 1 year
  };

  return jwt.sign(payload, secret, { algorithm: 'HS256' });
}

/**
 * Decrypt and validate JWT token containing geo IP data
 *
 * @param token - JWT token to decrypt
 * @returns Decrypted geo IP data or null if invalid/expired
 */
export function decryptGeoIPData(token: string): GeoIPData | null {
  try {
    const secret = getJWTSecret();

    // Verify and decode the JWT
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
    }) as JWTPayload;

    // Validate required fields
    if (
      !decoded.ip ||
      !decoded.city ||
      !decoded.state ||
      !decoded.zip_code ||
      !decoded.country
    ) {
      console.warn('Invalid geo IP data structure in JWT');
      return null;
    }

    return {
      ip: decoded.ip,
      city: decoded.city,
      state: decoded.state,
      zip_code: decoded.zip_code,
      country: decoded.country,
      timestamp: decoded.timestamp || decoded.iat,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log('Geo IP JWT token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn('Invalid geo IP JWT token:', error.message);
    } else {
      console.error('Error decrypting geo IP data:', error);
    }
    return null;
  }
}

/**
 * Check if cached geo IP data is valid for the current IP
 *
 * @param cachedData - Cached geo IP data
 * @param currentIP - Current user's IP address
 * @returns True if cache is valid, false if needs refresh
 */
export function isGeoIPCacheValid(
  cachedData: GeoIPData,
  currentIP: string
): boolean {
  // Check if IP address matches
  if (cachedData.ip !== currentIP) {
    console.log('IP address changed, invalidating geo IP cache');
    return false;
  }

  // Check if data is not too old (additional safety check beyond JWT expiration)
  const now = Date.now();
  const cacheAge = now - cachedData.timestamp * 1000;
  const oneYear = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds

  if (cacheAge > oneYear) {
    console.log('Geo IP cache is older than 1 year, invalidating');
    return false;
  }

  return true;
}

/**
 * Create geo IP data object from API response
 *
 * @param apiResponse - Response from geo IP API
 * @param userIP - User's IP address
 * @returns Formatted geo IP data object
 */
export function createGeoIPData(
  apiResponse: {
    city: string;
    regionName: string;
    zip: string;
    countryCode: string;
  },
  userIP: string
): GeoIPData {
  return {
    ip: userIP,
    city: apiResponse.city || '',
    state: apiResponse.regionName || '',
    zip_code: apiResponse.zip || '',
    country: apiResponse.countryCode?.toLowerCase() || '',
    timestamp: Math.floor(Date.now() / 1000),
  };
}
