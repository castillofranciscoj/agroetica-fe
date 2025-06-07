// src/lib/auth.ts
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Server-side helper used by Route Handlers (e.g. /api/stripe/checkout)
 * Returns the JWT payload or null when the request isn’t authenticated.
 */
export async function auth(req: NextRequest) {
  return getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,   // set this in .env
  });
}
