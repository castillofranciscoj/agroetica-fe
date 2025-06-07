'use client';

import { usePathname } from 'next/navigation';
import MarketingHeader from '@/components/MarketingHeader';
import PortalHeader    from '@/components/PortalHeader';

/**
 * Chooses which top-bar to render based on the route.
 * `/en/portal`, `/it/portal/xyz`          → <PortalHeader>
 * everything else                         → <MarketingHeader>
 */
export default function Header() {
  const pathname = usePathname();                    // e.g. "/en/portal/chat"

  // strip optional locale segment
  const pathNoLocale = pathname.replace(
    /^\/(en|it|es|fr|pt|de|da|nl|pl|gr)(?=\/|$)/,
    '',
  );

  const onPortal =
    pathNoLocale === '/portal' || pathNoLocale.startsWith('/portal/');

  return onPortal ? <PortalHeader /> : <MarketingHeader />;
}
