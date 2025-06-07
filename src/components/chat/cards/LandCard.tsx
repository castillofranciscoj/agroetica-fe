'use client';

import { useChat }   from 'ai/react';
import { motion }    from 'framer-motion';   // ✅ add this

export default function LandCard({
  land,
  chatId,
}: {
  chatId: string;
  land: { id: string; name: string; landAreaHectares: number };
}) {
  const { setInput, handleSubmit } = useChat({ id: chatId });

  return (
    <button
      onClick={() => {
        setInput(land.id);
        handleSubmit(new Event('submit') as unknown);
      }}
      className="border rounded p-3 bg-white shadow transition
                 hover:shadow-lg text-left"
    >
      <h2 className="font-semibold">{land.name}</h2>
      <p className="text-xs text-gray-600">
        Area&nbsp;{land.landAreaHectares}&nbsp;ha
      </p>
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
