// lib/getClientIp.ts
import type { NextApiRequest } from 'next';

export function getClientIp(req: NextApiRequest): string | null {
  // Check common reverse proxy headers first
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string') {
    // "x-forwarded-for" can be a comma-separated list -> take first
    return forwardedFor.split(',')[0]?.trim() || null;
  }

  // Some hosting providers (Vercel, Cloudflare, etc.) use "x-real-ip"
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') {
    return realIp;
  }

  // Fallback: direct connection IP
  return (req.socket?.remoteAddress as string) || null;
}
