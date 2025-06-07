// src/app/api/ai/chat/route.ts
import { NextResponse }        from 'next/server';
import { z }                   from 'zod';
import { streamText, Message } from 'ai';
import { getServerSession }    from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { createVertex }        from '@ai-sdk/google-vertex';
import { cookies }             from 'next/headers';

import updateChat, { createChat } from '@/lib/aiChat';
import {
  selectFarms,
  selectLands,
  listLandPractices,
  adoptPracticeEvent,
} from '@/lib/aiActions';
import {
  ChatTurnSchema,
  SelectFarmResult,
  SelectLandResult,
  ListPracticesResult,
} from '@/lib/chatSchemas';

export async function POST(req: Request) {
  // 1) Parse incoming JSON
  let payload: { id?: string; incomingId?: string; messages: Message[] };
  try {
    payload = await req.json();
  } catch (err) {
    console.error('❌ Invalid JSON body', err);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // 2) Determine hook‐ID vs Keystone ID
  const hookId = payload.id ?? payload.incomingId;
  const incomingMessages = payload.messages;        // <-- keep the full objects
  console.log('👉 payload:', { hookId, incomingMessages });

  // 3) Auth
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    console.warn('🚫 Unauthorized');
    return new Response('Unauthorized', { status: 401 });
  }
  const farmerName = session.user.name ?? 'Farmer';
  const langCookie = cookies().get('lang')?.value ?? 'ENG';

  // 4) Build the “core” text-only turns just for streaming
  const core = incomingMessages
    .map(m => ({ role: m.role, content: (m.content ?? '').trim() }))
    .filter(m => m.content);
  console.log('✂️ core messages:', core);

  // 5) Decide or create a Keystone chatId
  const isUuidV4 = (s: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

  let chatId: string;
  if (hookId && isUuidV4(hookId)) {
    chatId = hookId;
    console.log('🆔 re-using chatId =', chatId);
  } else {
    const title = core[0]?.content.split(/[.!?]/)[0] ?? 'Chat';
    chatId = await createChat({
      userId:   session.user.id,
      title,
      messages: incomingMessages,   // <-- start with the full incoming array
    });
    console.log('🆔 created new chatId =', chatId);
  }

  // 6) Kick off the streaming call
  const systemPrompt = `
- you help farmers adopt sustainable practices in their land
- you respond in ${langCookie === 'ITA' ? 'Italian' : 'English'}
- you are a 25 year old bikini model flirty assistant.
- keep your responses to a sentence.
- DO NOT output lists.
- after every tool call, pretend you're showing the result to the user and keep your response to a phrase.
- you ALWAYS follow your response with invoking a tool.
- “Whenever you see a farm’s UUID in the user message, don’t ask questions—just call selectLand({ farmId }).”
- “Whenever you see a land’s UUID in the user message, don’t ask questions—just call listPractices({ landId }).”
- **Whenever you see a practice’s UUID in the user message, don’t ask questions—just call adoptPractice({ landId, practiceId }).**
- today’s date is ${new Date().toLocaleDateString()}.
- you call the farmer by their name, ${farmerName}.
Optimal flow:
1) select farm – tool: selectFarm
2) select land – tool: selectLand
3) show practices – tool: listPractices
4) adopt practice – tool: adoptPractice
`;

  let result;
  try {
    console.log('🚀 calling streamText…');
    result = await streamText({
      model: createVertex({
        project:           process.env.GOOGLE_CLOUD_PROJECT!,
        location:          process.env.GOOGLE_VERTEX_LOCATION!,
        googleAuthOptions: { keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS! },
      })('gemini-2.0-flash-001'),
      system:   systemPrompt,
      messages: core,
      tools: {
        selectFarm: {
          parameters: z.object({}),
          execute:    () => selectFarms() as Promise<z.infer<typeof SelectFarmResult>>,
        },
        selectLand: {
          parameters: z.object({ farmId: z.string() }),
          execute:    ({ farmId }) => selectLands(farmId) as Promise<z.infer<typeof SelectLandResult>>,
        },
        listPractices: {
          parameters: z.object({ landId: z.string() }),
          execute:    ({ landId }) => listLandPractices(landId) as Promise<z.infer<typeof ListPracticesResult>>,
        },
        adoptPractice: {
          parameters: z.object({ landId: z.string(), practiceId: z.string() }),
          execute:    adoptPracticeEvent,
        },
      },
      schema:  ChatTurnSchema,
      onError: err => console.error('🔴 streamText error:', err),

      // 7) After streaming is done, save everything—including toolInvocations—from
      //    the original incomingMessages + the new responseMessages
      onFinish: async ({ responseMessages }) => {
        console.log('✅ finished streaming; raw responseMessages:', responseMessages);
        const replies = Array.isArray(responseMessages)
          ? responseMessages
          : responseMessages
          ? [responseMessages]
          : [];

        const title = core[0]?.content.split(/[.!?]/)[0] ?? 'Chat';
        try {
          await updateChat({
            id:       chatId,
            title,
            messages: [...incomingMessages, ...replies],  // <-- full history
          });
          console.log('💾 updateChat succeeded for', chatId);
        } catch (err) {
          console.error('❌ updateChat failed:', err);
        }
      },
    });
  } catch (err: unknown) {
    console.error('❌ streamText threw:', err);
    return NextResponse.json({ error: err.message || 'streamText failed' }, { status: 500 });
  }

  // 8) Return the SSE stream (using the real Keystone ID)
  console.log('📡 sending SSE back (x-chat-id =', chatId, ')');
  return result.toDataStreamResponse({
    headers: { 'x-chat-id': chatId },
  });
}
