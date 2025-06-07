'use client';
import { useEffect, useState } from 'react';
const EVT = 'portal:selectedFarmIdChange';

export default function useFarmFilter(ignore = false) {
  const [farmId, setFarmId] = useState<string | undefined>(() =>
    typeof window === 'undefined' || ignore
      ? undefined
      : localStorage.getItem('selectedFarmId') || undefined,
  );

  useEffect(() => {
    if (ignore) return;
    const refresh = () => setFarmId(localStorage.getItem('selectedFarmId') || undefined);
    window.addEventListener(EVT, refresh);
    window.addEventListener('storage', e => { if (e.key === 'selectedFarmId') refresh(); });
    return () => {
      window.removeEventListener(EVT, refresh);
      window.removeEventListener('storage', refresh as any);
    };
  }, [ignore]);

  return farmId ?? null;      // null means “all farms”
}
