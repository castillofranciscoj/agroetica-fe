// src/app/api/auth/forgot-password/route.ts
import { SEND_USER_PASSWORD_RESET_LINK } from '@/graphql/operations';
import apolloClient from '@/lib/apolloClient';

export async function POST(req: Request) {
  const { email } = await req.json();

  await apolloClient.mutate({
    mutation : SEND_USER_PASSWORD_RESET_LINK,
    variables: { email },
  });

  return Response.json({ ok: true });
}
