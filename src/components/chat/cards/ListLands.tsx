// src/components/chat/cards/ListLands.tsx
'use client';

import React from 'react';
import { useChat } from 'ai/react';

export interface Land {
  id: string;
  name: string;
  landAreaHectares: number;
}

export default function ListLands({
  lands,
  chatId,
}: {
  lands: Land[];
  chatId: string;
}) {
  // explicitly point at the same API + chat-ID
  const { setInput, handleSubmit } = useChat({
    api: '/api/ai/chat',
    id: chatId,
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {lands.map((land) => (
        <button
          key={land.id}
          onClick={() => {
            // send "Name selected (UUID)" so the backend/tool still sees the ID
            setInput(`${land.name} selected (${land.id})`);
            handleSubmit(new Event('submit') as unknown);
          }}
          className="border rounded-lg p-4 bg-white shadow transition hover:shadow-lg text-left"
        >
          <h2 className="font-semibold text-lg">{land.name}</h2>
          <p className="text-sm text-gray-600">
            Area: {land.landAreaHectares} ha
          </p>
        </button>
      ))}
    </div>
  );
}

export function LandSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="h-20 rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse"
          aria-busy="true"
        />
      ))}
    </div>
  );
}
