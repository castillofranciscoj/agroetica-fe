// src/app/chat/page.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useChat }            from 'ai/react';
import { useSearchParams } from 'next/navigation';
import { useLocaleRouter } from '@/lib/useLocaleRouter';

import { Message as AIMsg }   from 'ai';

import ChatMessage    from '@/components/chat/Message';
import LoadingOverlay from '@/components/chat/LoadingOverlay';
import { ChatInput }  from '@/components/ChatInput';
import { useLanguage }from '@/components/LanguageContext';
import { t }          from '@/i18n';

interface ChatPageProps {
  initialId?:   string;
  initialMsgs?: AIMsg[];
}

export default function ChatPage({
  initialId,
  initialMsgs = [],
}: ChatPageProps) {
  const { lang } = useLanguage();
  const params = useSearchParams();
  const flow   = params.get('flow');
  const router = useLocaleRouter();

  const [didFlow,   setDidFlow]   = useState(false);
  const [showTitle, setShowTitle] = useState(true);
  const [chatId,    setChatId]    = useState<string|undefined>(initialId);

  const {
    id: currentId,
    messages,
    input,
    setInput,
    append,
    handleSubmit,
    isLoading,
    stop,
  } = useChat({
    api: '/api/ai/chat',
    id: chatId,
    initialMessages: initialMsgs,
    onResponse: res => {
      const real = res.headers.get('x-chat-id');
      if (real && real !== chatId) {
        setChatId(real);
        window.history.replaceState({}, '', `/portal/chat/${real}`);
      }
    },
  });

  // auto‐trigger flow
  useEffect(() => {
    if (flow === 'optimise' && !didFlow) {
      append({ role: 'user', content: t[lang].quickOptimizeLabel });
      setDidFlow(true);
    }
  }, [flow, didFlow, append, lang]);

  // hide once user types
  useEffect(() => {
    if (messages.some(m => m.role === 'user')) {
      setShowTitle(false);
    }
  }, [messages]);

  // scroll container
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    containerRef.current?.scrollTo({
      top:      containerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  // focus & esc-to-stop
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && stop();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [stop]);

  const booting = messages.length === 0 && isLoading;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {booting && <LoadingOverlay />}

      {/* ─── message list (this alone scrolls) ─── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto bg-gray-50 dark:bg-zinc-900
                   pt-4 space-y-6 px-4 md:px-6"
      >
        {messages.map(m => (
          <ChatMessage
            key={m.id}
            chatId={chatId ?? ''}
            role={m.role as 'user' | 'assistant'}
            content={m.content}
            toolInvocations={(m as unknown).toolInvocations}
            attachments={(m as unknown).experimental_attachments}
            onCardClick={id => append({ role: 'user', content: id })}
          />
        ))}
      </div>

      {/* ─── footer stays put at bottom ─── */}
      <div className="bg-gray-50 dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-700 p-4 md:p-6">
        {showTitle && (
          <h1 className="text-2xl font-bold mb-3">
            {t[lang].subChatLabel}
          </h1>
        )}

        <fieldset disabled={isLoading} className="flex gap-2 mb-3">
          <form onSubmit={handleSubmit} className="flex gap-2 flex-1">
            <ChatInput
              ref={inputRef}
              id="chat-input"
              name="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t[lang].chatPlaceholder}
              className="flex-1"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {t[lang].sendButtonLabel}
            </button>
          </form>
        </fieldset>

        {showTitle && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push('/portal/chat?flow=optimise')}
              className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 text-sm rounded-full hover:bg-gray-300 dark:hover:bg-zinc-600"
            >
              {t[lang].optimizeFlowLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
