'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/** All native <textarea> props are accepted */
export type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
        className,
      )}
      {...props}
    />
  ),
);

TextArea.displayName = 'TextArea';
