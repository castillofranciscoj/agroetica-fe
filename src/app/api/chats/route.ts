// src/app/api/chats/route.ts
import { NextResponse }     from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions }      from '@/lib/auth/options';
import { getMyChats }       from '@/lib/aiChatDb';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chats = await getMyChats(session.user.id);
    return NextResponse.json(chats);
  } catch (err) {
    console.error('❌ GET /api/chats error', err);
    return NextResponse.json({ error: 'Failed to load chats' }, { status: 500 });
  }
}
