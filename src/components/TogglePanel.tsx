'use client';

import React, { useState } from 'react';

interface TogglePanelProps {
  title: string;
  children: React.ReactNode;
  /** start opened or closed – defaults to `true` (open) */
  defaultOpen?: boolean;
}

/**
 * A reusable “card” with a title bar that lets the user collapse/expand
 * its content.  Styling is the same as the old inline version in FieldView.
 */
export default function TogglePanel({
  title,
  children,
  defaultOpen = true,
}: TogglePanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-black/50 backdrop-blur rounded shadow p-3 text-white">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-lg">{title}</h2>
        <button
          className="text-sm text-white/70 hover:text-white"
          onClick={() => setOpen(o => !o)}
        >
          {open ? '−' : '+'}
        </button>
      </div>

      {open && <div>{children}</div>}
    </div>
  );
}
