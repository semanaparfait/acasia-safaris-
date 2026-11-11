import type { CookieOptions, Request, Response } from 'express';

// The admin login lives in httpOnly cookies, out of reach of the page's JavaScript
// (a malicious script cannot steal it the way it could from localStorage).
//   acacia_session: the login itself (7 days)
//   acacia_device:  "trust this device": no 6 digit code for 30 days on this browser
// The website reaches the API through its own /api address (see next.config.ts),
// so these are first-party cookies that every browser keeps.
export const SESSION_COOKIE = 'acacia_session';
export const DEVICE_COOKIE = 'acacia_device';

const DAY = 24 * 60 * 60 * 1000;
export const SESSION_DAYS = 7;
export const DEVICE_DAYS = 30;

// Secure (https only) online. Locally the site runs on http://localhost.
const secure = () =>
  process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === 'true'
    : process.env.NODE_ENV === 'production';

const options = (days: number, path = '/'): CookieOptions => ({
  httpOnly: true,
  secure: secure(),
  sameSite: 'lax', // never sent with requests started by other websites (except plain links)
  path,
  maxAge: days * DAY,
});

export function setSession(res: Response, token: string) {
  res.cookie(SESSION_COOKIE, token, options(SESSION_DAYS));
}

export function setTrustedDevice(res: Response, token: string) {
  res.cookie(DEVICE_COOKIE, token, options(DEVICE_DAYS, '/api/auth'));
}

export function clearSession(res: Response) {
  res.clearCookie(SESSION_COOKIE, { ...options(0), maxAge: undefined });
}

export function cookie(req: Request, name: string): string | undefined {
  const value = (req.cookies as Record<string, unknown> | undefined)?.[name];
  return typeof value === 'string' && value ? value : undefined;
}
