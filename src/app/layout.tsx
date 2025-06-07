// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';

import Providers      from '@/components/Providers';
import ApolloWrapper  from '@/components/ApolloWrapper';
import Header         from '@/components/Header';
import HideOnAuth     from '@/components/HideOnAuth';   // ⬅︎ NEW

/* ──────────────────────────────────────────────── */
/*  Disable static prerendering for every page      */
/*  below this root layout (fixes useSearchParams   */
/*  & friends during `next build`).                 */
/* ──────────────────────────────────────────────── */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title:       'Agroetica',
  description: 'Farmer management dashboard',
};

export default function RootLayout(
  { children }: { children: React.ReactNode },
) {
  return (
    <html lang="en" className="light">
      <body className="flex flex-col min-h-screen">
        <Providers>
          <ApolloWrapper>
            {/* Header is automatically hidden on every /auth/* page */}
            <HideOnAuth>
              <Header />
            </HideOnAuth>

            {/* Uses the same padding everywhere; when the header is
                hidden the CSS variable --header-height isn’t set, so
                padding collapses to 0 without extra code.            */}
            <main
              className="flex-1 overflow-auto"
              style={{ paddingTop: 'var(--header-height)' }}
            >
              {children}
            </main>
          </ApolloWrapper>
        </Providers>
      </body>
    </html>
  );
}
