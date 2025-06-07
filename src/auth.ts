// src/auth.ts
import { getServerSession } from 'next-auth/next';
import { authOptions }      from '@/lib/auth/options';

/** Lightweight wrapper so Server Actions can call `await auth()` */
export async function auth() {
  return getServerSession(authOptions);
}
