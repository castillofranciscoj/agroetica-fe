// src/app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import apolloClient from '@/lib/apolloClient';
import { REDEEM_USER_PASSWORD_RESET_TOKEN } from '@/graphql/operations';
import { z } from 'zod';

export async function POST(req: Request) {
  const { email, token, password } = await req.json();
  const schema = z.object({
    email: z.string().email(),
    token: z.string().min(1),
    password: z.string().min(8),
  });
  schema.parse({ email, token, password });

  const { data } = await apolloClient.mutate({
    mutation: REDEEM_USER_PASSWORD_RESET_TOKEN,
    variables: { email, token, password },
    errorPolicy: 'all',
  });

  const res = data?.redeemUserPasswordResetToken;
  if (res === null) return NextResponse.json({ success: true });
  return NextResponse.json(res, { status: 400 });
}
