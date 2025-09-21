// This file is deprecated. Use @/lib/facebook-tracking for new implementations
// with deduplication support between browser pixel and Conversion API.

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq: any;
  }
}

export const fbq = (...args: unknown[]) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args);
  }
};

// Common Facebook Pixel events (DEPRECATED - use FacebookEventTracker from @/lib/facebook-tracking)
export const FacebookPixelEvents = {
  // Standard events
  pageView: () => fbq('track', 'PageView'),
  purchase: (value: number, currency = 'BRL') =>
    fbq('track', 'Purchase', { value, currency }),
  addToCart: (value: number, currency = 'BRL') =>
    fbq('track', 'AddToCart', { value, currency }),
  initiateCheckout: (value: number, currency = 'BRL') =>
    fbq('track', 'InitiateCheckout', { value, currency }),
  completeRegistration: () => fbq('track', 'CompleteRegistration'),
  lead: () => fbq('track', 'Lead'),
  search: (searchString: string) =>
    fbq('track', 'Search', { search_string: searchString }),
  viewContent: (contentName: string, contentCategory?: string) =>
    fbq('track', 'ViewContent', {
      content_name: contentName,
      ...(contentCategory && { content_category: contentCategory }),
    }),

  // Custom events
  customEvent: (eventName: string, parameters?: Record<string, unknown>) =>
    fbq('trackCustom', eventName, parameters),
};
