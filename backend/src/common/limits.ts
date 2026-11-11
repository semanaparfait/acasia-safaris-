import { Throttle } from '@nestjs/throttler';

// Request limits, per visitor (IP address). Too many requests get a 429 with
// "Too many attempts…" (set in AppModule). Every other route allows 120 per minute.
const MINUTE = 60_000;

// Admin login: guessing passwords takes forever
export const LoginLimit = () =>
  Throttle({ default: { limit: 5, ttl: MINUTE } });

// "Forgot password": sends an email, so very few
export const ResetEmailLimit = () =>
  Throttle({ default: { limit: 3, ttl: 15 * MINUTE } });

// Typing the 6 digit code / setting the new password (each code also allows only 5 tries)
export const ResetCodeLimit = () =>
  Throttle({ default: { limit: 10, ttl: 15 * MINUTE } });

// Website forms that create something or send an email: booking, contact, review, quotation
export const FormLimit = () =>
  Throttle({ default: { limit: 5, ttl: 10 * MINUTE } });

// The visitor's chat on their booking page
export const ChatLimit = () =>
  Throttle({ default: { limit: 30, ttl: MINUTE } });
