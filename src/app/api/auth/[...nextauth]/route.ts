// src/app/api/auth/[...nextauth]/route.ts
import NextAuth          from 'next-auth';
import { authOptions }   from '@/lib/auth/options';

/** every request is user-specific – skip route cache */
export const dynamic = 'force-dynamic';

/* create a single NextAuth handler instance */
const authHandler = NextAuth(authOptions);

/* valid App-Router exports — NO OTHER NAMES! */
export const GET  = authHandler;
export const POST = authHandler;
