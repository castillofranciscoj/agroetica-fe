// src/components/ui/button.tsx
import * as React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** show an icon (optional) */
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', icon, children, ...props }, ref) => (
    <button
      ref={ref}
      className={
        'inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 ' +
        'text-sm font-medium text-white shadow hover:bg-green-700 ' +
        'disabled:cursor-not-allowed disabled:opacity-50 ' +
        className
      }
      {...props}
    >
      {icon}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
