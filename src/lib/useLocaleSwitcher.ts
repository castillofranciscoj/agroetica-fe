// src/lib/useLocaleSwitcher.ts
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage }            from '@/components/LanguageContext';

export function useLocaleSwitcher() {
  const router   = useRouter();
  const pathname = usePathname();          // current URL
  const { lang } = useLanguage();          // current locale ('en' | 'it' | 'es')

  return (next: 'en' | 'it' | 'es' | 'fr' | 'pt' | 'de' | 'da' |'nl'|'pl'|'gr') => {
    if (next === lang) return;             // no-op if user clicks current flag

    /* strip existing prefix, if any */
    const without = pathname.replace(/^\/(en|it|es|fr|pt|de|da|nl|pl|gr)(?=\/|$)/, '');

    /* root special-case so / → /en, not bare / */
    const target =
      next === 'en' && without === '' ? '/en' : `/${next}${without}`;

    router.push(target);                   // navigate 🚀
  };
}
