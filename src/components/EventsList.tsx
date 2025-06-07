// src/components/EventsList.tsx
import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function EventsList({ events }) {
  return (
    <div className="space-y-4">
      {events.map((e: unknown) => (
        <details
          key={e.id}
          className="border rounded-lg bg-white p-4"
        >
          <summary className="flex justify-between cursor-pointer">
            <span>{e.type} — {e.status}</span>
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </summary>
          <pre className="mt-2 bg-gray-50 p-2 text-sm rounded">
            {JSON.stringify(e.meta, null, 2)}
          </pre>
        </details>
      ))}
    </div>
  );
}
