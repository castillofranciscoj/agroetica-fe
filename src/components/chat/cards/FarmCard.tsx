// src/components/chat/cards/FarmCard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useChat } from 'ai/react';

interface Farm {
  id: string;
  name: string;
  location: { latitude: number; longitude: number };
  lands: unknown[];
}

export default function FarmCard({
  farm,
  chatId,
}: {
  farm?: Farm;
  chatId: string;
}) {
  const { setInput, handleSubmit } = useChat({ id: chatId });

  // if there's no farm yet, show a skeleton placeholder
  if (!farm) {
    return <Skeleton />;
  }

  return (
    <button
      onClick={() => {
        setInput(farm.id);
        handleSubmit(new Event('submit') as unknown);
      }}
      className="border rounded p-3 bg-white shadow transition hover:shadow-lg text-left"
    >
      <h2 className="font-semibold">{farm.name}</h2>
      <p className="text-xs text-gray-600">
        Lat {farm.location.latitude.toFixed(2)}, Lng{' '}
        {farm.location.longitude.toFixed(2)}
      </p>
      <p className="text-xs text-gray-600">Lands: {farm.lands.length}</p>
    </button>
  );
}

export function Skeleton() {
  return (
    <motion.div
      className="h-28 w-full rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse"
      aria-busy="true"
    />
  );
}
