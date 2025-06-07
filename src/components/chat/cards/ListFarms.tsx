// src/components/chat/cards/ListFarms.tsx
'use client';

import React from 'react';
import { useChat } from 'ai/react';

export interface Farm {
  id: string;
  name: string;
  location: { latitude: number; longitude: number };
  lands: unknown[];
}

export default function ListFarms({
  farms,
  chatId,
}: {
  farms: Farm[];
  chatId: string;
}) {
  // point at the same API + chat ID
  const { setInput, handleSubmit } = useChat({
    api: '/api/ai/chat',
    id:  chatId,
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {farms.map((farm) => (
        <button
          key={farm.id}
          onClick={() => {
            // send "Name selected (UUID)" so the backend/tool still sees the ID
            setInput(`${farm.name} selected (${farm.id})`);
            handleSubmit(new Event('submit') as unknown);
          }}
          className="border rounded-lg p-4 bg-white shadow transition hover:shadow-lg text-left"
        >
          <h2 className="font-semibold text-lg">{farm.name}</h2>
          <p className="text-sm text-gray-600">
            Lat {farm.location.latitude.toFixed(4)}, Lng {farm.location.longitude.toFixed(4)}
          </p>
          <p className="text-sm text-gray-600">Lands: {farm.lands.length}</p>
        </button>
      ))}
    </div>
  );
}

export function FarmSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="h-28 rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse"
          aria-busy="true"
        />
      ))}
    </div>
  );
}
