// src/components/chat/Message.tsx
'use client';

import React from 'react';
import { ToolInvocation, Attachment } from 'ai';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

import ListFarms,        { FarmSkeleton }     from './cards/ListFarms';
import ListLands,        { LandSkeleton }     from './cards/ListLands';
import ListPractices,    { PracticeSkeleton } from './cards/ListPractices';
import AdoptPracticeCard, { AdoptPracticeSkeleton } from './cards/AdoptPracticeCard';

import { BotIcon, UserIcon } from '@/components/icons';

export default function Message({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
}: {
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
  attachments?: Attachment[];
}) {
  return (
    <motion.div
      initial={{ y: 6, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      // removed first-of-type:pt-20
      className="flex gap-4 w-full max-w-[500px]"
    >
      <div className="w-6 flex-shrink-0 text-zinc-500">
        {role === 'assistant' ? <BotIcon /> : <UserIcon />}
      </div>

      <div className="flex flex-col gap-4 w-full">
        <div className="prose">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        {toolInvocations?.map((inv) => {
          const { toolName, state, result, toolCallId } = inv;
          const isResult  = state === 'result';
          const isLoading = state === 'running' || state === 'requested';

          switch (toolName) {
            case 'selectFarm':
              return isLoading
                ? <FarmSkeleton key={toolCallId} aria-busy="true" />
                : isResult
                  ? <ListFarms key={toolCallId} chatId={chatId} farms={result as unknown[]} />
                  : null;

            case 'selectLand':
              return isLoading
                ? <LandSkeleton key={toolCallId} aria-busy="true" />
                : isResult
                  ? <ListLands key={toolCallId} chatId={chatId} lands={result as unknown[]} />
                  : null;

            case 'listPractices':
              return isLoading
                ? <PracticeSkeleton key={toolCallId} aria-busy="true" />
                : isResult
                  ? <ListPractices key={toolCallId} chatId={chatId} practices={result as unknown[]} />
                  : null;

            case 'adoptPractice':
              return isLoading
                ? <AdoptPracticeSkeleton key={toolCallId} aria-busy="true" />
                : isResult
                  ? <AdoptPracticeCard key={toolCallId} chatId={chatId} event={result as unknown} />
                  : null;

            default:
              return null;
          }
        })}

        {attachments?.length > 0 && (
          <div className="flex gap-2">
            {attachments.map((att) => (
              <pre key={(att as unknown).url} className="p-2 bg-zinc-100 rounded text-xs">
                {JSON.stringify(att, null, 2)}
              </pre>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
