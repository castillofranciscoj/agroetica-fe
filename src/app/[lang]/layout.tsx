'use client';

import { usePathname } from 'next/navigation';
import Header       from '@/components/Header';
import HideOnAuth   from '@/components/HideOnAuth';
import { LanguageProvider } from '@/components/LanguageContext';

/* ------------------------------------------------------------------ */
/*  Helper to coerce the first URL segment into a supported locale    */
/* ------------------------------------------------------------------ */
const VALID = [
  'en','it','es','fr','pt','de','da','nl','pl','gr',
] as const;
type Lang = typeof VALID[number];

function getLang(pathname: string): Lang {
  const seg = pathname.split('/')[1];
  return (VALID.includes(seg as Lang) ? seg : 'en') as Lang;
}

/* ------------------------------------------------------------------ */
/*  Layout                                                            */
/* ------------------------------------------------------------------ */
export default function LangLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();          // eg. /it/portal or /en/auth/…
  const lang = getLang(pathname);

  return (
    <LanguageProvider value={lang}>
      {/* header hides automatically on every /auth/* route */}
      <HideOnAuth>
        <Header />
      </HideOnAuth>

      {children}
    </LanguageProvider>
  );
}
