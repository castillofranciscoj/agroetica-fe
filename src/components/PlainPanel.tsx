'use client';

import React from 'react';

interface PlainPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** extra Tailwind / CSS classes */
  className?: string;
}

/**
 * A generic blurred card that simply wraps its children.
 * All other props (style, data-attrs, onClick, …) are forwarded to the <div>.
 */
export default function PlainPanel({
  className = '',
  children,
  ...rest
}: PlainPanelProps) {
  return (
    <div
      {...rest}
      className={`bg-black/50 backdrop-blur p-3 rounded ${className}`.trim()}
    >
      {children}
    </div>
  );
}
