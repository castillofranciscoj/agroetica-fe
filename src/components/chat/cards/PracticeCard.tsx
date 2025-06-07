// src/components/chat/cards/PracticeCard.tsx
'use client';

import React, { useState } from 'react';
import { useChat } from 'ai/react';
import { motion } from 'framer-motion';

export interface Practice {
  id: string;
  name: string;
  description?: string;
  category?: { name: string };
}

export default function PracticeCard({
  practice,
  chatId,
}: {
  chatId: string;
  practice: Practice;
}) {
  const { setInput, handleSubmit } = useChat({ api: '/api/ai/chat', id: chatId });
  const [expanded, setExpanded] = useState(false);

  const needsToggle = practice.description
    ? practice.description.length > 200
    : false;

  return (
    <button
      onClick={() => {
        setInput(practice.id);
        handleSubmit(new Event('submit') as unknown);
      }}
      className="border rounded-lg p-4 bg-white shadow transition hover:shadow-lg text-left"
    >
      <h2 className="font-semibold text-lg">{practice.name}</h2>

      {practice.description && (
        <>
          <p
            className={`text-sm text-gray-600 mt-1 ${
              !expanded ? 'line-clamp-3' : ''
            }`}
          >
            {practice.description}
          </p>
          {needsToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((x) => !x);
              }}
              className="text-blue-600 text-xs mt-1"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </>
      )}

      {practice.category?.name && (
        <p className="text-sm text-gray-600 mt-2">
          <strong>Category:</strong> {practice.category.name}
        </p>
      )}
    </button>
  );
}

export function Skeleton() {
  return (
    <motion.div
      className="h-32 w-full rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse"
      aria-busy="true"
    />
  );
}
