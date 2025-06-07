// src/app/chat/layout.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Edit2,
} from 'lucide-react';
import { useLocaleRouter } from '@/lib/useLocaleRouter';
import { t } from '@/i18n';
import { useLanguage } from '@/components/LanguageContext';

interface ChatSummary {
  id: string;
  title: string;
  createdAt: string;
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { lang } = useLanguage();
  const router = useLocaleRouter();

  const [open, setOpen]         = useState(false);
  const [chats, setChats]       = useState<ChatSummary[]>([]);
  const [exp7, setExp7]         = useState(false);
  const [exp30, setExp30]       = useState(false);
  const [expOlder, setExpOlder] = useState(false);

  // ——— NEW: auto‐collapse/open based on window width ———
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // initialize once
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // fetch my chats
  useEffect(() => {
    if (!session?.user) return;
    fetch('/api/chats')
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch chats');
        return r.json();
      })
      .then(setChats)
      .catch(console.error);
  }, [session]);

  // bucket by date
  const { chats7, chats30, chatsOlder } = useMemo(() => {
    const now  = Date.now();
    const d7   = now - 7  * 24*60*60*1000;
    const d30  = now - 30 * 24*60*60*1000;
    const c7:    ChatSummary[] = [];
    const c30:   ChatSummary[] = [];
    const older: ChatSummary[] = [];
    for (const c of chats) {
      const t = new Date(c.createdAt).getTime();
      if      (t >= d7)  c7.push(c);
      else if (t >= d30) c30.push(c);
      else               older.push(c);
    }
    return { chats7: c7, chats30: c30, chatsOlder: older };
  }, [chats]);

  const renderGroup = (
    label: string,
    list: ChatSummary[],
    expanded: boolean,
    toggle: () => void
  ) => {
    if (!list.length) return null;
    const toShow = expanded ? list : list.slice(0, 5);
    return (
      <div className="px-4 py-2">
        <button
          onClick={toggle}
          className="w-full flex justify-between items-center text-sm font-semibold text-zinc-600 dark:text-zinc-300"
        >
          <span>{label} ({list.length})</span>
          {expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
        </button>
        <div className="mt-1 space-y-1">
          {toShow.map(chat => (
            <button
              key={chat.id}
              onClick={() => router.push(`/portal/chat/${chat.id}`)}
              className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 text-xs"
            >
              {chat.title}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full">
      <aside
        className={`
          bg-white dark:bg-zinc-800
          transition-all duration-200
          ${open ? 'w-64' : 'w-16'}
        `}
        style={{ position: 'sticky', top: 0, alignSelf: 'flex-start' }}
      >
        {/* collapse + new chat */}
        <div className="flex justify-between items-center px-2 py-3">
          <button
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700"
          >
            {open ? <X size={20}/> : <Menu size={20}/>}
          </button>
          <button
            onClick={() => router.push('/portal/chat')}
            aria-label="New Chat"
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700"
          >
            <Edit2 size={20}/>
          </button>
        </div>

        {open && (
          <nav className="overflow-y-auto h-full">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-zinc-700">
              <h2 className="text-sm font-bold dark:text-zinc-100">
                {t[lang].guidedFlowsLabel}
              </h2>
              <button
                onClick={() => router.push('/portal/chat?flow=optimise')}
                className="mt-2 w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 text-sm"
              >
                {t[lang].optimizeFlowLabel}
              </button>
            </div>

            <h2 className="px-4 py-2 text-sm font-bold dark:text-zinc-100">
              {t[lang].myChatsLabel}
            </h2>
            {renderGroup(t[lang].previous7DaysLabel,  chats7,  exp7,  () => setExp7(v => !v))}
            {renderGroup(t[lang].previous30DaysLabel, chats30, exp30, () => setExp30(v => !v))}
            {renderGroup(t[lang].olderLabel,          chatsOlder, expOlder, () => setExpOlder(v => !v))}
          </nav>
        )}
      </aside>

      <main className="flex-1 bg-gray-50 dark:bg-zinc-900">
        {children}
      </main>
    </div>
  );
}
