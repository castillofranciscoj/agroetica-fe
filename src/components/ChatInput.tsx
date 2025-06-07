// src/components/ChatInput.tsx
'use client';

import * as React from 'react';

// 🔄  interface → type alias (no lint complaint)
export type ChatInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const ChatInput = React.forwardRef<HTMLInputElement, ChatInputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={
        'flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ' +
        (className ?? '')
      }
      {...props}
    />
  )
);

ChatInput.displayName = 'ChatInput';
