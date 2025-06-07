// src/lib/useLocaleRouter.ts
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';

/** Strip any existing prefix, then add the current one */
function withPrefix(path: string, lang: string) {
  if (
    path.startsWith('http') ||   // external
    path.startsWith('//')  ||
    path.startsWith('#')
  ) return path;

  const bare = path.replace(/^\/(en|it|es|fr|pt|de|da|nl|pl|gr)(\/|$)/, '/');
  return `/${lang}${bare}`;
}

/**
 * Same API as useRouter() but every navigation method
 * transparently adds the `/en|it|es|fr|pt` prefix.
 */
export function useLocaleRouter() {
  const router   = useRouter();
  const pathname = usePathname();
  const { lang } = useLanguage();

  // helpers used in multiple methods
  const wrap = (target: string) => withPrefix(target, lang);
  const isCurrent = (href: string) =>
    pathname === wrap(href) || pathname.startsWith(wrap(href) + '/');

  return {
    ...router,
    push:     (href: string)                => router.push(wrap(href)),
    replace:  (href: string)                => router.replace(wrap(href)),
    prefetch:(href: string)                 => router.prefetch(wrap(href)),
    refresh:  router.refresh,
    back:     router.back,
    /* convenience */
    localeHref: wrap,                       // build href for <a>/<Link>
    isActive : isCurrent,                   // check active nav item
  };
}
