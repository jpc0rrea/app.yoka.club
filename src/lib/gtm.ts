// lib/gtm.ts
export const dlPush = (obj: Record<string, any>) => {
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push(obj);
};
