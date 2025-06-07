//src/components/LanguageContext.tsx

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import { usePathname } from 'next/navigation';

/* ───────── supported language codes ───────── */
export type Lang = 'en' | 'it' | 'es' | 'fr' | 'pt' | 'de' | 'da' | 'nl'|'pl' | 'gr';
const VALID: Lang[] = ['en', 'it', 'es', 'fr', 'pt', 'de', 'da', 'nl', 'pl', 'gr'];

/* ───────── helper that coerces any input to a valid Lang ───────── */
function normalise(input: unknown): Lang {
  const seg = String(input ?? '').toLowerCase();
  return (VALID.includes(seg as Lang) ? seg : 'en') as Lang;
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  /* ───── initial lang from URL (runs both server & client) ───── */
  const pathname   = usePathname();         // e.g. "/it/about"
  const firstSeg   = pathname.split('/')[1];
  const [lang, _setLang] = useState<Lang>(normalise(firstSeg));

  /* ───── setter that syncs cookie + storage and *always* normalises ───── */
  const setLang = (next: Lang | string) => {
    const final = normalise(next);
    _setLang(final);
    try {
      localStorage.setItem('language', final);
    } catch { /* ignore SSR / private-mode */ }
    document.cookie = `lang=${final};path=/;max-age=${60 * 60 * 24 * 365}`;
  };

  /* ───── keep state in sync when the URL prefix changes ───── */
  useEffect(() => {
    const seg = pathname.split('/')[1];
    _setLang(normalise(seg));
  }, [pathname]);

  /* ───── first mount: migrate legacy stored values ───── */
  useEffect(() => {
    const stored = localStorage.getItem('language');
    if (stored && !VALID.includes(stored as Lang)) {
      // remove legacy "ENG"/"ITA"/"ES" and fall back to normal flow
      localStorage.removeItem('language');
      document.cookie = 'lang=;path=/;max-age=0';   // delete cookie
    } else if (stored) {
      setLang(stored as Lang);                      // use valid stored pref
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

/* ───────── consumer hook ───────── */
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx)
    throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
