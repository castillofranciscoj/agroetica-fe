'use client';
import { usePathname } from 'next/navigation';

export default function HideOnAuth({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return pathname.includes('/auth/') ? null : <>{children}</>;
}
