'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation }    from '@apollo/client';
import dayjs                        from 'dayjs';
import {
  Loader, Plus, QrCode, Trash, Download,
}                                   from 'lucide-react';
import {
  GET_REFERRAL_PARTNERS,
  GET_REFERRAL_CAMPAIGNS,
  CREATE_REFERRAL_CAMPAIGN,
  DELETE_REFERRAL_CAMPAIGN,
}                                   from '@/graphql/operations';
import { useLanguage }              from '@/components/LanguageContext';
import { t }                        from '@/i18n';
import Image from 'next/image';

export default function CampaignsPanel() {
  const { lang } = useLanguage();

  /* ── queries & mutations ─────────────────────────────────────── */
  const { data: partners } = useQuery(GET_REFERRAL_PARTNERS);
  const { data, loading, error, refetch } = useQuery(GET_REFERRAL_CAMPAIGNS);

  const [createCampaign, { loading: saving }] = useMutation(
    CREATE_REFERRAL_CAMPAIGN,
    { onCompleted: () => refetch() },
  );

  const [deleteCampaign, { loading: deleting }] = useMutation(
    DELETE_REFERRAL_CAMPAIGN,
    { onCompleted: () => refetch() },
  );

  /* ── form state ──────────────────────────────────────────────── */
  const [partnerId, setPartnerId] = useState('');
  const [code, setCode]           = useState('');
  const [discount, setDiscount]   = useState('10');
  const [start, setStart]         = useState(dayjs().format('YYYY-MM-DD'));
  const [end, setEnd]             = useState('');
  const [errorMsg, setErrorMsg]   = useState<string | null>(null);

  /* suggested code = partnerName + discount%  -------------------- */
  const suggested = useMemo(() => {
    const p = partners?.referralPartners.find((x: unknown) => x.id === partnerId);
    if (!p) return '';
    return `${p.name.replace(/\s+/g, '').toUpperCase()}${discount}`;
  }, [partnerId, partners, discount]);

  /* duplicate-code check ----------------------------------------- */
  const existingCodes: string[] = useMemo(
    () => data?.referralCampaigns.map((c: unknown) => c.code.toUpperCase()) ?? [],
    [data],
  );
  const finalCode   = (code || suggested).toUpperCase().trim();
  const isDuplicate = finalCode && existingCodes.includes(finalCode);

  /* helpers ------------------------------------------------------- */
  const PORTAL_BASE =
    (process.env.NEXT_PUBLIC_PORTAL_URL ?? '').replace(/\/+$/, '') ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  /* ── render ──────────────────────────────────────────────────── */
  return (
    <section className="border rounded p-4 space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Plus className="w-5 h-5" /> {t[lang].newCampaignLabel}
      </h2>

      {/* ── form ─────────────────────────────────────────────── */}
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
        onSubmit={async e => {
          e.preventDefault();
          setErrorMsg(null);
          if (isDuplicate) {
            setErrorMsg(t[lang].duplicateCodeError);
            return;
          }
          try {
            await createCampaign({
              variables: {
                partnerId,
                code        : finalCode,
                discountPct : parseFloat(discount) || 0,
                startDate   : start ? new Date(start) : null,
                endDate     : end   ? new Date(end)   : null,
              },
            });
            setPartnerId(''); setCode(''); setDiscount('10');
            setStart(dayjs().format('YYYY-MM-DD')); setEnd('');
          } catch (err: unknown) {
            if (err?.message?.includes('Unique constraint failed')) {
              setErrorMsg(t[lang].duplicateCodeError);
            } else setErrorMsg(err.message);
          }
        }}
      >
        {/* row 1 — partner & code */}
        <select
          className="border rounded p-2 h-10"
          value={partnerId}
          onChange={e => setPartnerId(e.target.value)}
          required
        >
          <option value="">{t[lang].selectPartnerPlaceholder}</option>
          {partners?.referralPartners.map((p: unknown) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <input
          className={`border rounded p-2 h-10 uppercase tracking-wider ${
            isDuplicate ? 'border-red-500' : ''
          }`}
          placeholder={t[lang].codePlaceholder}
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
        />

        {/* row 2 — discount */}
        <input
          className="border rounded p-2 h-10 md:col-span-2"
          type="number"
          min={0}
          max={100}
          placeholder={t[lang].discountPlaceholder}
          value={discount}
          onChange={e => setDiscount(e.target.value)}
        />

        {/* row 3 — dates */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">
            {t[lang].validFromLabel}
          </label>
          <input
            className="border rounded p-2 h-10"
            type="date"
            value={start}
            onChange={e => setStart(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">
            {t[lang].validUntilLabel}
          </label>
          <input
            className="border rounded p-2 h-10"
            type="date"
            value={end}
            onChange={e => setEnd(e.target.value)}
          />
        </div>

        {/* submit */}
        <button
          type="submit"
          disabled={saving || isDuplicate}
          className="col-span-full bg-green-600 text-white py-2 rounded
                     hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? t[lang].savingEllipsis : t[lang].createCampaignBtn}
        </button>
      </form>

      {/* errors & loaders */}
      {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
      {loading && (
        <p><Loader className="inline w-4 h-4 animate-spin" /> {t[lang].loadingLabel}</p>
      )}
      {error && <p className="text-red-600">{error.message}</p>}

      {/* ── campaigns list ───────────────────────────────────── */}
      <ul className="grid md:grid-cols-2 gap-4">
        {data?.referralCampaigns.map((c: unknown) => {
          const signupURL = `${PORTAL_BASE}/portal/login?ref=${encodeURIComponent(c.code)}`;
          /* --- QR urls (note param `size`, *before* url) ------------ */
          const qrSmall = `/api/qr?size=256&data=${encodeURIComponent(signupURL)}`;
          const qrLarge = `/api/qr?size=1024&data=${encodeURIComponent(signupURL)}`;

          return (
            <li key={c.id} className="border rounded p-3 space-y-2 relative">
              {/* delete */}
              <button
                onClick={() => {
                  if (confirm(t[lang].confirmDeleteCampaign))
                    deleteCampaign({ variables: { id: c.id } });
                }}
                disabled={deleting}
                title={t[lang].deleteCampaignLabel}
                className="absolute right-2 top-2 text-red-600 hover:text-red-800
                           disabled:opacity-50"
              >
                {deleting ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash className="w-4 h-4" />
                )}
              </button>

              {/* code & partner */}
              <div className="text-3xl font-mono font-bold tracking-wider">{c.code}</div>
              <div className="text-sm text-gray-500">
                {c.discount_pct}% {t[lang].offLabel} | {c.partner.name}
              </div>

              {/* QR preview */}
              <Image src={qrSmall}   width={256}
  height={256} alt="QR" className="w-32 h-32" />

              {/* actions */}
              <div className="flex gap-4">
                <a
                  href={signupURL}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1 text-green-700 hover:underline text-sm"
                >
                  <QrCode className="w-4 h-4" /> {t[lang].openSignupLabel}
                </a>

                {/* download large QR */}
                <a
                  href={qrLarge}
                  download={`${c.code}.png`}
                  className="inline-flex items-center gap-1 text-green-700 hover:underline text-sm"
                >
                  <Download className="w-4 h-4" /> {t[lang].downloadQrLabel}
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
