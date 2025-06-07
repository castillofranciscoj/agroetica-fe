// src/components/icons.tsx
'use client';

import React from 'react';

export const BotIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-4"            /* 16 px */
    {...props}
  >
    <rect x="3" y="8" width="18" height="12" rx="2" />
    <path d="M12 5v3M9 5h6" />
    <circle cx="9" cy="14" r="1" fill="currentColor" />
    <circle cx="15" cy="14" r="1" fill="currentColor" />
  </svg>
);

export const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-4"
    {...props}
  >
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21a8.5 8.5 0 0 1 13 0" />
  </svg>
);
