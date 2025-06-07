// src/components/ActionsCard.tsx
import React from 'react';

export default function ActionsCard() {
  // TODO: decide which buttons/forms to show based on phase.key and events statuses
  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-3">
      <p className="text-gray-700">
        Define phase-specific actions here (e.g. “Upload document”, “Start satellite scan”)…
      </p>
      {/* e.g. <button>Start Task</button> */}
    </div>
  );
}
