// src/components/LanguageContext/server.ts
import { cookies } from 'next/headers';

export type Lang = 'en' | 'it' | 'es' | 'fr' | 'pt' | 'de' | 'da' | 'nl' | 'pl' | 'gr';     // ↓ lower-case

/**
 * Read the `lang` cookie set by the client LanguageContext.
 * Falls back to 'en'.
 */
export async function getLanguage(): Promise<Lang> {
  const raw = (await cookies()).get('lang')?.value?.toLowerCase() as string | undefined;

  // accept legacy uppercase values for backward-compat
  switch (raw) {
    case 'ita': case 'it': return 'it';
    case 'es':  case 'esp': return 'es';
    case 'fr':              return 'fr';
    case 'pt':              return 'pt';
    case 'de':              return 'de';
    case 'da':              return 'da';
    case 'nl':              return 'nl';
    case 'pl':              return 'pl';
    case 'gr':              return 'gr';
    default:                return 'en';
  }
}
