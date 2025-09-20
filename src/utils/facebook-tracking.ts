/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from 'uuid';
import { standardizeUserData } from './facebook-user-data-standardization';

declare global {
  interface Window {
    fbq: any;
  }
}

// Event types supported by Facebook
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

interface TrackingData {
  event_name: FacebookEventType;
  custom_data?: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    content_type?: string;
    search_string?: string;
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
  event_source_url?: string;
}

export type TrackingDataUserData = TrackingData['user_data'];
export type TrackingDataCustomData = TrackingData['custom_data'];

interface FacebookCookies {
  fbc?: string;
  fbp?: string;
}

export class FacebookEventTracker {
  private pixelId: string;

  constructor(pixelId: string) {
    this.pixelId = pixelId;
  }

  /**
   * Generate a unique event ID for deduplication
   */
  private generateEventId(): string {
    return uuidv4();
  }

  /**
   * Get Facebook click ID (fbc) and browser ID (fbp) from cookies
   */
  private getFacebookCookies(): FacebookCookies {
    if (typeof document === 'undefined') return {};

    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        acc[name] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    return {
      fbc: cookies._fbc,
      fbp: cookies._fbp,
    };
  }

  /**
   * Track event using browser pixel (fbq) with event ID for deduplication
   */
  private trackBrowserEvent(
    eventName: string,
    eventId: string,
    customData?: Record<string, any>
  ) {
    if (typeof window !== 'undefined' && window.fbq) {
      const eventData = {
        ...customData,
        event_id: eventId,
      };

      window.fbq('track', eventName, eventData);
    }
  }

  /**
   * Send event to Conversion API via our Next.js API route
   */
  private async sendToConversionAPI(
    eventName: FacebookEventType,
    eventId: string,
    customData?: Record<string, any>,
    userData?: Record<string, any>
  ): Promise<void> {
    try {
      const { fbc, fbp } = this.getFacebookCookies();

      // Standardize user data before sending to API
      const standardizedUserData = userData
        ? standardizeUserData(userData)
        : undefined;

      const payload = {
        event_name: eventName,
        event_id: eventId,
        event_source_url:
          typeof window !== 'undefined' ? window.location.href : undefined,
        custom_data: customData,
        user_data: standardizedUserData,
        fbc,
        fbp,
      };

      console.log('Sending to Conversion API:', {
        ...payload,
        user_data_standardized: !!standardizedUserData,
      });

      const response = await fetch('/api/facebook/conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to send to Conversion API:', error);
      }
    } catch (error) {
      console.error('Error sending to Conversion API:', error);
    }
  }

  /**
   * Track event with deduplication using both browser pixel and Conversion API
   */
  async trackEvent(data: TrackingData): Promise<string> {
    const eventId = this.generateEventId();

    // Track via browser pixel (fbq)
    this.trackBrowserEvent(data.event_name, eventId, data.custom_data);

    // Track via Conversion API (server-side)
    await this.sendToConversionAPI(
      data.event_name,
      eventId,
      data.custom_data,
      data.user_data
    );

    return eventId;
  }

  /**
   * Track PageView event specifically
   */
  async trackPageView(customData?: Record<string, any>): Promise<string> {
    return this.trackEvent({
      event_name: 'PageView',
      custom_data: customData,
      event_source_url:
        typeof window !== 'undefined' ? window.location.href : undefined,
    });
  }

  /**
   * Track Purchase event with value and currency
   */
  async trackPurchase({
    currency,
    value,
    customData,
    userData,
  }: {
    value: number;
    currency: string;
    customData?: TrackingDataCustomData;
    userData?: TrackingDataUserData;
  }): Promise<string> {
    return this.trackEvent({
      event_name: 'Purchase',
      custom_data: {
        value,
        currency,
        ...customData,
      },
      user_data: userData,
    });
  }

  /**
   * Track Lead event
   */
  async trackLead(
    customData?: TrackingDataCustomData,
    userData?: TrackingDataUserData
  ): Promise<string> {
    return this.trackEvent({
      event_name: 'Lead',
      custom_data: customData,
      user_data: userData,
    });
  }

  /**
   * Track AddToCart event
   */
  async trackAddToCart(
    value: number,
    currency: string = 'BRL',
    customData?: TrackingDataCustomData
  ): Promise<string> {
    return this.trackEvent({
      event_name: 'AddToCart',
      custom_data: {
        value,
        currency,
        ...customData,
      },
    });
  }

  /**
   * Track InitiateCheckout event
   */
  async trackInitiateCheckout(
    value: number,
    currency: string = 'BRL',
    userData?: TrackingDataUserData,
    customData?: TrackingDataCustomData
  ): Promise<string> {
    return this.trackEvent({
      event_name: 'InitiateCheckout',
      custom_data: {
        value,
        currency,
        ...customData,
      },
      user_data: userData,
    });
  }

  /**
   * Track ViewContent event
   */
  async trackViewContent(
    contentName: string,
    contentCategory?: string,
    value?: number,
    currency: string = 'BRL',
    customData?: Record<string, any>
  ): Promise<string> {
    return this.trackEvent({
      event_name: 'ViewContent',
      custom_data: {
        content_name: contentName,
        ...(contentCategory && { content_category: contentCategory }),
        ...(value !== undefined && { value, currency }),
        ...customData,
      },
    });
  }

  /**
   * Track Search event
   */
  async trackSearch(
    searchString: string,
    customData?: Record<string, any>
  ): Promise<string> {
    return this.trackEvent({
      event_name: 'Search',
      custom_data: {
        search_string: searchString,
        ...customData,
      },
    });
  }

  /**
   * Track CompleteRegistration event
   */
  async trackCompleteRegistration(
    customData?: Record<string, any>,
    userData?: Record<string, any>
  ): Promise<string> {
    return this.trackEvent({
      event_name: 'CompleteRegistration',
      custom_data: customData,
      user_data: userData,
    });
  }

  /**
   * Track Contact event
   */
  async trackContact(
    customData?: Record<string, any>,
    userData?: Record<string, any>
  ): Promise<string> {
    return this.trackEvent({
      event_name: 'Contact',
      custom_data: customData,
      user_data: userData,
    });
  }

  /**
   * Track Subscribe event
   */
  async trackSubscribe(
    value?: number,
    currency: string = 'BRL',
    customData?: Record<string, any>,
    userData?: Record<string, any>
  ): Promise<string> {
    return this.trackEvent({
      event_name: 'Subscribe',
      custom_data: {
        ...(value !== undefined && { value, currency }),
        ...customData,
      },
      user_data: userData,
    });
  }

  /**
   * Track StartTrial event
   */
  async trackStartTrial(
    value?: number,
    currency: string = 'BRL',
    customData?: Record<string, any>
  ): Promise<string> {
    return this.trackEvent({
      event_name: 'StartTrial',
      custom_data: {
        ...(value !== undefined && { value, currency }),
        ...customData,
      },
    });
  }

  /**
   * Track custom event
   */
  async trackCustomEvent(
    eventName: string,
    customData?: Record<string, any>,
    userData?: Record<string, any>
  ): Promise<string> {
    return this.trackEvent({
      event_name: eventName,
      custom_data: customData,
      user_data: userData,
    });
  }
}

// Singleton instance
let trackerInstance: FacebookEventTracker | null = null;

/**
 * Get or create Facebook Event Tracker instance
 */
export function getFacebookTracker(): FacebookEventTracker | null {
  if (typeof window === 'undefined') return null;

  const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
  if (!pixelId) {
    console.warn('Facebook Pixel ID not configured');
    return null;
  }

  if (!trackerInstance) {
    trackerInstance = new FacebookEventTracker(pixelId);
  }

  return trackerInstance;
}

/**
 * Convenience function to track PageView with deduplication
 */
export async function trackPageView(
  customData?: Record<string, any>
): Promise<string | null> {
  const tracker = getFacebookTracker();
  if (!tracker) return null;

  return tracker.trackPageView(customData);
}

/**
 * Convenience function to track Purchase event
 */
export async function trackPurchase({
  currency = 'BRL',
  value,
  customData,
  userData,
}: {
  value: number;
  currency?: string;
  customData?: TrackingDataCustomData;
  userData?: TrackingDataUserData;
}): Promise<string | null> {
  const tracker = getFacebookTracker();
  if (!tracker) return null;

  return tracker.trackPurchase({ value, currency, customData, userData });
}

/**
 * Convenience function to track Lead event
 */
export async function trackLead({
  customData,
  userData,
}: {
  customData?: TrackingDataCustomData;
  userData?: TrackingDataUserData;
}): Promise<string | null> {
  const tracker = getFacebookTracker();
  if (!tracker) return null;

  return tracker.trackLead(customData, userData);
}

/**
 * Convenience function to track InitiateCheckout event
 */
export async function trackInitiateCheckout(
  value: number,
  currency: string = 'BRL',
  userData?: TrackingDataUserData,
  customData?: TrackingDataCustomData
): Promise<string | null> {
  const tracker = getFacebookTracker();
  if (!tracker) return null;
  return tracker.trackInitiateCheckout(value, currency, userData, customData);
}

/**
 * Convenience function to track AddToCart event
 */
export async function trackAddToCart(
  value: number,
  currency: string = 'BRL',
  customData?: Record<string, any>
): Promise<string | null> {
  const tracker = getFacebookTracker();
  if (!tracker) return null;

  return tracker.trackAddToCart(value, currency, customData);
}

/**
 * Convenience function to track ViewContent event
 */
export async function trackViewContent(
  contentName: string,
  contentCategory?: string,
  value?: number,
  currency: string = 'BRL',
  customData?: Record<string, any>
): Promise<string | null> {
  const tracker = getFacebookTracker();
  if (!tracker) return null;

  return tracker.trackViewContent(
    contentName,
    contentCategory,
    value,
    currency,
    customData
  );
}

/**
 * Convenience function to track Search event
 */
export async function trackSearch(
  searchString: string,
  customData?: Record<string, any>
): Promise<string | null> {
  const tracker = getFacebookTracker();
  if (!tracker) return null;

  return tracker.trackSearch(searchString, customData);
}

/**
 * Convenience function to track CompleteRegistration event
 */
export async function trackCompleteRegistration(
  customData?: Record<string, any>,
  userData?: Record<string, any>
): Promise<string | null> {
  const tracker = getFacebookTracker();
  if (!tracker) return null;

  return tracker.trackCompleteRegistration(customData, userData);
}

/**
 * Convenience function to track Contact event
 */
export async function trackContact(
  customData?: Record<string, any>,
  userData?: Record<string, any>
): Promise<string | null> {
  const tracker = getFacebookTracker();
  if (!tracker) return null;

  return tracker.trackContact(customData, userData);
}

/**
 * Convenience function to track custom events
 */
export async function trackCustomEvent(
  eventName: string,
  customData?: Record<string, any>,
  userData?: Record<string, any>
): Promise<string | null> {
  const tracker = getFacebookTracker();
  if (!tracker) return null;

  return tracker.trackCustomEvent(eventName, customData, userData);
}
