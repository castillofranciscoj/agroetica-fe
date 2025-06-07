// src/components/Providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { LanguageProvider } from './LanguageContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class" 
      enableSystem={false}    // ← ignore OS theme
      defaultTheme="light"    // ← always start in light
      enableColorScheme={false} 
    >
      <SessionProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
