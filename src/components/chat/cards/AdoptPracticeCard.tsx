// src/components/chat/cards/AdoptPracticeCard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface PracticeEvent {
  id: string;
  landId: string;
  landName: string
  practiceId: string;
  practiceName: string
  parameters: { Type: string };
  appliedDate: string;
}

export default function AdoptPracticeCard({
  event,
}: {
  event: PracticeEvent;
  chatId: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-lg p-4 bg-white shadow transition hover:shadow-lg text-left"
    >
      <h2 className="font-semibold text-lg">🎉 Practice Adopted!</h2>
      <div className="text-sm text-gray-700 space-y-1">
        <div>
          <strong>Land:</strong> {event.landName}
        </div>
        <div>
          <strong>Practice:</strong> {event.practiceName}
        </div>
        <div>
          <strong>Applied:</strong>{' '}
          {new Date(event.appliedDate).toLocaleString()}
        </div>
        {event.parameters?.Type && (
          <div>
            <strong>Note:</strong> {event.parameters.Type}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function AdoptPracticeSkeleton() {
  return (
    <div
      className="h-32 rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse"
      aria-busy="true"
    />
  );
}
