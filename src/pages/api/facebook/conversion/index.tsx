/**
 * Facebook Conversion API endpoint using facebook-nodejs-business-sdk
 *
 * This endpoint handles server-side tracking for Facebook events with deduplication support.
 * It works in conjunction with client-side pixel tracking to ensure accurate attribution.
 *
 * Supported events: PageView, Purchase, Lead, CompleteRegistration, AddToCart, InitiateCheckout,
 * ViewContent, Search, AddToWishlist, Contact, CustomizeProduct, Donate, FindLocation,
 * Schedule, StartTrial, SubmitApplication, Subscribe, and custom events.
 *
 * Usage example:
 * ```
 * POST /api/facebook/conversion
 * {
 *   "event_name": "Purchase",
 *   "event_id": "unique-event-id-for-deduplication",
 *   "event_source_url": "https://example.com/checkout",
 *   "custom_data": {
 *     "value": 29.99,
 *     "currency": "BRL",
 *     "content_name": "Course ABC"
 *   },
 *   "user_data": {
 *     "email": "user@example.com",
 *     "phone": "+5511999999999"
 *   },
 *   "fbp": "_fbp_cookie_value",
 *   "fbc": "_fbc_cookie_value"
 * }
 * ```
 */

import * as bizSdk from 'facebook-nodejs-business-sdk';
import { getClientIp } from '../../../../utils/getClientIP';
import { standardizeUserData } from '../../../../utils/facebook-user-data-standardization';

import {
  encryptGeoIPData,
  decryptGeoIPData,
  isGeoIPCacheValid,
  createGeoIPData,
  type GeoIPData,
} from '../../../../utils/geo-ip-jwt';
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  encryptUserPersonalInfo,
  decryptUserPersonalInfo,
  type UserPersonalInfo,
} from '../../../../utils/user-personal-jwt';

// Event types supported by the Conversion API
export type FacebookEventType =
  | 'PageView'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'ViewContent'
  | 'Search'
  | 'AddToWishlist'
  | 'Contact'
  | 'CustomizeProduct'
  | 'Donate'
  | 'FindLocation'
  | 'Schedule'
  | 'StartTrial'
  | 'SubmitApplication'
  | 'Subscribe'
  | string; // Allow custom events

interface ConversionEventRequest {
  event_name: FacebookEventType;
  event_id: string; // Required for deduplication
  event_source_url?: string;
  custom_data?: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    content_type?: string;
    search_string?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  user_data?: {
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  };
  fbp?: string; // Facebook browser ID
  fbc?: string; // Facebook click ID
}

// Keep secrets in env vars
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN as string;
const PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID as string;
const TEST_EVENT_CODE = process.env.FACEBOOK_TEST_EVENT_CODE as string; // optional, for Events Manager test tool

/**
 * Get cached geo IP data from JWT cookie or fetch from external API
 */
async function getCachedOrFetchGeoIPData(
  req: NextApiRequest,
  clientIp: string
): Promise<GeoIPData | null> {
  const cookieName = 'ugi';

  // Try to get cached data from cookie
  const cookieData = req.cookies[cookieName];

  if (cookieData) {
    try {
      const cachedGeoData = decryptGeoIPData(cookieData);

      if (cachedGeoData && isGeoIPCacheValid(cachedGeoData, clientIp)) {
        console.log('Using cached geo IP data:', cachedGeoData);
        return cachedGeoData;
      } else {
        console.log(
          'Cached geo IP data is invalid or IP changed, fetching new data'
        );
      }
    } catch (error) {
      console.warn(
        'Failed to decrypt geo IP cookie, fetching new data:',
        error
      );
    }
  }

  // Fetch new geo IP data from external API
  try {
    console.log('Fetching geo IP data from external API for IP:', clientIp);

    const geoIPResponse = await axios.get<{
      query: string;
      status: string;
      country: string;
      countryCode: string;
      region: string;
      regionName: string;
      city: string;
      zip: string;
      lat: number;
      lon: number;
      timezone: string;
      isp: string;
      org: string;
      as: string;
    }>(`http://ip-api.com/json/${clientIp}`);

    if (geoIPResponse.data.status === 'success') {
      const geoData = createGeoIPData(geoIPResponse.data, clientIp);

      console.log('Fetched new geo IP data:', geoData);
      console.log('Full API Response:', geoIPResponse.data);

      return geoData;
    } else {
      console.warn(
        'Geo IP API returned unsuccessful status:',
        geoIPResponse.data.status
      );
      return null;
    }
  } catch (error) {
    console.error('Error fetching geo IP data:', error);
    return null;
  }
}

/**
 * Set geo IP data cookie with JWT encryption
 */
function setGeoIPCookie(geoData: GeoIPData): string {
  const token = encryptGeoIPData(geoData);
  const oneYear = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = [
    `ugi=${token}`,
    `Max-Age=${Math.floor(oneYear / 1000)}`, // Max-Age in seconds
    `Path=/`,
    // `HttpOnly`,
    `SameSite=Lax`,
  ];

  // Only add Secure flag in production
  if (isProduction) {
    cookieOptions.push('Secure');
  }

  return cookieOptions.join('; ');
}

/**
 * Set user personal info cookie with JWT encryption
 */
function setUserPersonalCookie(info: UserPersonalInfo): string {
  const token = encryptUserPersonalInfo(info);
  const oneYear = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = [
    `upi=${token}`,
    `Max-Age=${Math.floor(oneYear / 1000)}`,
    `Path=/`,
    // Not HttpOnly by requirement
    `SameSite=Lax`,
  ];

  if (isProduction) {
    cookieOptions.push('Secure');
  }

  return cookieOptions.join('; ');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    if (!ACCESS_TOKEN || !PIXEL_ID) {
      return res.status(500).json({
        error: 'Missing FACEBOOK_ACCESS_TOKEN or FACEBOOK_PIXEL_ID envs',
      });
    }

    const {
      event_name,
      event_id,
      event_source_url,
      custom_data,
      user_data,
      fbp,
      fbc,
    }: ConversionEventRequest = await req.body;

    // Validate required fields
    if (!event_name || !event_id) {
      return res
        .status(400)
        .json({ error: 'event_name and event_id are required' });
    }

    const userAgent = req.headers['user-agent'] ?? '';
    const clientIp = getClientIp(req);

    console.log('Facebook Conversion Event:', {
      event_name,
      event_id,
      event_source_url,
      custom_data,
      user_data,
      clientIp,
      has_fbp: Boolean(fbp),
      has_fbc: Boolean(fbc),
    });

    // Init SDK once per invocation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const api = bizSdk.FacebookAdsApi.init(ACCESS_TOKEN);

    const UserData = bizSdk.UserData;
    const ServerEvent = bizSdk.ServerEvent;
    const EventRequest = bizSdk.EventRequest;

    // Build user_data (Meta recommends IP + UA; include fbp/fbc when available)
    const userData = new UserData();
    if (clientIp) userData.setClientIpAddress(clientIp);
    if (userAgent) userData.setClientUserAgent(userAgent);

    // Add Facebook cookies if available
    if (fbp) userData.setFbp(fbp);
    if (fbc) userData.setFbc(fbc);

    // Prepare user data for standardization and enhancement
    let enhancedUserData = { ...user_data };

    // Accumulate cookies to set in the response
    const cookiesToSet: string[] = [];

    // Get cached geo IP data from JWT-encrypted cookie or fetch from API
    const geoIPData = await getCachedOrFetchGeoIPData(req, clientIp ?? '');

    if (geoIPData) {
      // Enhance user data with cached/fetched geo location data
      enhancedUserData = {
        ...enhancedUserData,
        city: enhancedUserData.city || geoIPData.city,
        state: enhancedUserData.state || geoIPData.state,
        zip_code: enhancedUserData.zip_code || geoIPData.zip_code,
        country: enhancedUserData.country || geoIPData.country,
      };

      console.log('Enhanced user data with geo IP:', {
        cached: true,
        geoData: geoIPData,
      });
    }

    // Handle User Personal Info cookie (upi)
    const upiCookie = req.cookies['upi'];
    const cachedUpi = upiCookie ? decryptUserPersonalInfo(upiCookie) : null;

    const incomingPersonal: UserPersonalInfo = {
      email: user_data?.email,
      phone: user_data?.phone,
      firstName: user_data?.first_name,
      lastName: user_data?.last_name,
    };

    // Enrich missing fields from cookie if present and body omitted them
    if (cachedUpi) {
      enhancedUserData = {
        ...enhancedUserData,
        email: enhancedUserData.email || cachedUpi.email,
        phone: enhancedUserData.phone || cachedUpi.phone,
        first_name: enhancedUserData.first_name || cachedUpi.firstName,
        last_name: enhancedUserData.last_name || cachedUpi.lastName,
      };
    }

    // Update or create upi cookie based on differences or absence
    const hasIncomingPersonal = Boolean(
      incomingPersonal.email ||
        incomingPersonal.phone ||
        incomingPersonal.firstName ||
        incomingPersonal.lastName
    );

    if (cachedUpi) {
      if (hasIncomingPersonal) {
        const merged: UserPersonalInfo = { ...cachedUpi };
        let changed = false;
        (['email', 'phone', 'firstName', 'lastName'] as const).forEach(
          (key) => {
            const value = incomingPersonal[key];
            if (typeof value !== 'undefined' && value !== merged[key]) {
              merged[key] = value;
              changed = true;
            }
          }
        );

        if (changed) {
          cookiesToSet.push(setUserPersonalCookie(merged));
          console.log('Updating upi cookie with new user info');
        }
      }
    } else if (hasIncomingPersonal) {
      cookiesToSet.push(setUserPersonalCookie(incomingPersonal));
      console.log('Setting new upi cookie');
    }

    // Standardize user data according to Facebook's requirements
    const standardizedUserData = standardizeUserData(enhancedUserData, '55'); // Default country code for Brazil

    console.log('User Data Standardization:', {
      raw: enhancedUserData,
      standardized: standardizedUserData,
    });

    // Add standardized user data to Facebook userData object
    if (standardizedUserData.email)
      userData.setEmail(standardizedUserData.email);
    if (standardizedUserData.phone)
      userData.setPhone(standardizedUserData.phone);
    if (standardizedUserData.first_name)
      userData.setFirstName(standardizedUserData.first_name);
    if (standardizedUserData.last_name)
      userData.setLastName(standardizedUserData.last_name);
    if (standardizedUserData.city) userData.setCity(standardizedUserData.city);
    if (standardizedUserData.state)
      userData.setState(standardizedUserData.state);
    if (standardizedUserData.zip_code)
      userData.setZip(standardizedUserData.zip_code);
    if (standardizedUserData.country)
      userData.setCountry(standardizedUserData.country);

    // Build the server event
    const serverEvent = new ServerEvent()
      .setEventName(event_name)
      .setEventTime(Math.floor(Date.now() / 1000))
      .setEventSourceUrl(event_source_url ?? '')
      .setActionSource('website')
      .setEventId(event_id) // Required for deduplication
      .setUserData(userData);

    // Add custom data if provided
    if (custom_data) {
      const CustomData = bizSdk.CustomData;
      const customDataObj = new CustomData();

      // Set standard custom data fields
      if (custom_data.value !== undefined)
        customDataObj.setValue(custom_data.value);
      if (custom_data.currency) customDataObj.setCurrency(custom_data.currency);
      if (custom_data.content_name)
        customDataObj.setContentName(custom_data.content_name);
      if (custom_data.content_category)
        customDataObj.setContentCategory(custom_data.content_category);
      if (custom_data.content_ids)
        customDataObj.setContentIds(custom_data.content_ids);
      if (custom_data.content_type)
        customDataObj.setContentType(custom_data.content_type);
      if (custom_data.search_string)
        customDataObj.setSearchString(custom_data.search_string);

      // Add any additional custom properties
      const additionalData: Record<string, unknown> = {};
      Object.keys(custom_data).forEach((key) => {
        if (
          ![
            'value',
            'currency',
            'content_name',
            'content_category',
            'content_ids',
            'content_type',
            'search_string',
          ].includes(key)
        ) {
          additionalData[key] = custom_data[key];
        }
      });

      if (Object.keys(additionalData).length > 0) {
        customDataObj.setCustomProperties(additionalData);
      }

      serverEvent.setCustomData(customDataObj);
    }

    // Create request for your Pixel
    const facebookRequest = new EventRequest(ACCESS_TOKEN, PIXEL_ID).setEvents([
      serverEvent,
    ]);

    if (TEST_EVENT_CODE) {
      facebookRequest.setTestEventCode(TEST_EVENT_CODE);
    }

    const response = await facebookRequest.execute();

    console.log('Facebook Conversion API Response:', response);

    // Prepare response with geo IP cookie if new data was fetched
    const responseData = {
      success: true,
      sent: {
        event_name,
        event_id,
        event_source_url: event_source_url ?? null,
        client_ip: clientIp || null,
        has_fbp: Boolean(fbp),
        has_fbc: Boolean(fbc),
        has_custom_data: Boolean(custom_data),
        has_user_data: Boolean(user_data),
        geo_ip_cached: Boolean(geoIPData),
      },
      meta_response: response, // Meta API response payload
    };

    // Set geo IP cookie if new data was fetched and not from cache
    if (geoIPData) {
      // Check if we need to set a new cookie (either no existing cookie or IP changed)
      const existingCookie = req.cookies['ugi'];
      let shouldSetCookie = !existingCookie;

      if (existingCookie && !shouldSetCookie) {
        const cachedData = decryptGeoIPData(existingCookie);
        shouldSetCookie =
          !cachedData || !isGeoIPCacheValid(cachedData, clientIp ?? '');
      }

      if (shouldSetCookie) {
        cookiesToSet.push(setGeoIPCookie(geoIPData));
        console.log('Setting new geo IP cookie for IP:', clientIp);
      }
    }

    if (cookiesToSet.length > 0) {
      res.setHeader('Set-Cookie', cookiesToSet);
    }

    return res.status(200).json(responseData);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('Facebook Conversion API Error:', err);
    return res.status(500).json({
      error: err?.message ?? 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
    });
  }
}
