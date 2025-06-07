//src/components/ProductSyncCard.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';

export default function ProductSyncCard() {
  const { lang }           = useLanguage();
  const [busy, setBusy]    = useState(false);
  const [msg,  setMsg ]    = useState<string>();
  const [percent, setPct]  = useState(0);
  const timerRef           = useRef<NodeJS.Timeout>();

  /* tidy up timer --------------------------------------------------- */
  useEffect(() => () => clearInterval(timerRef.current), []);

  const runSync = async () => {
    setBusy(true);
    setMsg(undefined);
    setPct(1);                          // start bar

    /* fake incremental feedback until backend returns -------------- */
    timerRef.current = setInterval(() => {
      setPct(p => (p < 95 ? p + 2 : p));  // stop at 95 %
    }, 400);

    try {
      const res  = await fetch('/api/admin/sync-products', { method: 'POST' });
      const body = await res.json();

      clearInterval(timerRef.current);
      setPct(100);                      // complete bar

      if (res.ok) {
        const c = body.created ?? 0;
        const u = body.updated ?? 0;
        const tot = body.total ?? c + u;
        setMsg(
          `${t[lang].syncFinished}\n` +
          `${t[lang].createdLabel}: ${c}\n` +
          `${t[lang].updatedLabel}: ${u}\n` +
          `${t[lang].totalLabel}:   ${tot}`,
        );
      } else {
        setMsg(body.error || t[lang].syncError);
      }
    } catch (err: unknown) {
      clearInterval(timerRef.current);
      setPct(0);
      setMsg(err.message || t[lang].syncError);
    } finally {
      setBusy(false);
      /* reset bar after a short delay so user can see 100 % -------- */
      setTimeout(() => setPct(0), 1200);
    }
  };

  return (
    <div className="p-6 border rounded">
      <h2 className="text-xl font-semibold mb-2">
        {t[lang].syncCataloguesTitle}
      </h2>

      <p className="mb-4 text-sm text-gray-600">
        {t[lang].syncCataloguesDescription}
      </p>

      <button
        onClick={runSync}
        disabled={busy}
        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
      >
        {busy ? t[lang].syncCataloguesRunning : t[lang].syncCataloguesBtn}
      </button>

      {/* progress bar */}
      {busy || percent > 0 ? (
        <div className="w-full h-2 bg-gray-200 rounded mt-4 overflow-hidden">
          <div
            className="h-full bg-green-600 transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      ) : null}

      {msg && (
        <pre className="mt-3 text-sm whitespace-pre-line">{msg}</pre>
      )}
    </div>
  );
}
