// src/components/chat/cards/ListPractices.tsx
'use client';

import React from 'react';
import { useChat } from 'ai/react';

export interface Practice {
  id: string;
  name: string;
  description?: string;
  category?: { name: string };
}

export default function ListPractices({
  practices,
  chatId,
}: {
  practices: Practice[];
  chatId: string;
}) {
  // point at the same chat stream
  const { setInput, handleSubmit } = useChat({
    api: '/api/ai/chat',
    id: chatId,
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {practices.map((p) => (
        <button
          key={p.id}
          onClick={() => {
            // send "Name selected (UUID)" so the tool still gets the ID
            setInput(`${p.name} selected (${p.id})`);
            handleSubmit(new Event('submit') as unknown);
          }}
          className="border rounded-lg p-4 bg-white shadow transition hover:shadow-lg text-left"
        >
          <h2 className="font-semibold text-lg">{p.name}</h2>
          {p.description && (
            <p className="text-sm text-gray-600">{p.description}</p>
          )}
          {p.category?.name && (
            <p className="text-sm text-gray-600">Type: {p.category.name}</p>
          )}
        </button>
      ))}
    </div>
  );
}

export function PracticeSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse"
          aria-busy="true"
        />
      ))}
    </div>
  );
}
