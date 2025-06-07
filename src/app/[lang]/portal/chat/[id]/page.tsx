// src/app/portal/chat/[id]/page.tsx
import { notFound }    from 'next/navigation';
import { getChatById } from '@/lib/aiChatDb';
import ChatPage        from '../page';

/* ----------------------------------------------------------- */
/* `params` must be a **Promise** (or undefined) to satisfy    */
/* Next.js’ generated `PageProps` constraint.                  */
/* ----------------------------------------------------------- */
export default async function ChatIdPage(
  { params }: { params: Promise<{ id: string }> },
) {
  /* 👉  unwrap the promise before using `id` */
  const { id } = await params;

  const chat = await getChatById({ id });
  if (!chat) return notFound();

  return <ChatPage initialId={chat.id} initialMsgs={chat.messages} />;
}
