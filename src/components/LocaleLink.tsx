// src/components/LocaleLink.tsx
'use client';

import NextLink, { LinkProps } from 'next/dist/client/link'; // bypass alias
import { useParams }            from 'next/navigation';
import type { Lang }            from '@/i18n';

/**
 * Wraps next/link and prefixes internal hrefs with the current locale.
 *
 *   <Link href="/about">→ /en/about</Link>
 */
export default function L(
  { href, ...rest }: Omit<LinkProps, 'href'> & { href: string },
) {
  const { lang } = useParams<{ lang: Lang }>();      // 'en' | 'it' | 'es'

  /* strip an existing prefix (if any) before we add the current one */
  const withoutPrefix = href.replace(/^\/(en|it|es|fr|pt|de|da|nl|pl|gr)(\/|$)/, '/');

  /* skip external, protocol-relative, or hash links */
  const isAbsolute =
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//')     ||
    href.startsWith('#');

  const prefixed =
    isAbsolute ? href : `/${lang}${withoutPrefix === '/' ? '' : withoutPrefix}`;

  return <NextLink {...rest} href={prefixed} />;
}
