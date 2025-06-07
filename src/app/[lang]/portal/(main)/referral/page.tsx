/* ──────────────────────────────────────────────────────────────
   src/app/portal/(main)/referral/page.tsx
──────────────────────────────────────────────────────────────── */
'use client';

import React                 from 'react';
import { useQuery }          from '@apollo/client';
import { useSession }        from 'next-auth/react';
import dayjs                 from 'dayjs';
import { Copy, Loader, Download } from 'lucide-react';   // ← added Download
import Image from 'next/image';
import {
  CHECK_PARTNER_MEMBERSHIP,
  GET_PARTNER_DASHBOARD,
}                            from '@/graphql/operations';
import { useLanguage }       from '@/components/LanguageContext';
import { t }                 from '@/i18n';

/* ────────────────────────────────────────────────────────────── */
export default function ReferralDashboard() {
  const { data: session } = useSession();
  const { lang }          = useLanguage();
  const userId            = session?.user?.id;

  /* 1️⃣  – cheap membership check */
  const { data: mData, loading: mLoad } = useQuery(
    CHECK_PARTNER_MEMBERSHIP,
    { variables: { userId }, skip: !userId },
  );
  const isPartner = (mData?.memberships?.length ?? 0) > 0;

  /* 2️⃣  – dashboard query (only if partner) */
  const { data, loading, error } = useQuery(
    GET_PARTNER_DASHBOARD,
    { variables: { userId }, skip: !isPartner },
  );

  /* ── early returns ─────────────────────── */
  if (mLoad || loading) return <LoaderRow text={t[lang].loadingLabel} />;
  if (!isPartner)       return <p className="p-6">{t[lang].noPartnerFound}</p>;
  if (error)            return <p className="p-6 text-red-600">{error.message}</p>;

  const partner = data?.referralPartners?.[0];
  if (!partner)        return <p className="p-6">{t[lang].noPartnerFound}</p>;

  /* flatten redemptions from every campaign */
  const redemptions = partner.campaigns.flatMap((c:unknown)=>c.redemptions);

  /* aggregates */
  const total      = redemptions.length;
  const activeSubs = redemptions.filter((r:unknown)=>r.subscription?.status==='active').length;
  const commission = redemptions
    .reduce((s:number,r:unknown)=>s+(r.discountValue||0)*(partner.commission_pct/100),0)
    .toFixed(2);

  const copy = (val:string)=>navigator.clipboard.writeText(val).catch(()=>{});

  /* ── JSX ───────────────────────────────── */
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">{t[lang].referralDashboardTitle}</h1>

      {/* counters */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card title={t[lang].totalSignUps}   value={total} />
        <Card title={t[lang].activeSubs}     value={activeSubs} />
        <Card title={t[lang].projCommission} value={`€ ${commission}`} />
      </div>

      {/* redemptions */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">{t[lang].redemptionsTable}</h2>
        <Table rows={redemptions} pct={partner.commission_pct} lang={lang} />
      </section>

      {/* campaigns */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">{t[lang].campaignsList}</h2>
        <ul className="grid md:grid-cols-2 gap-4">
          {partner.campaigns.map((c:unknown)=>{
            const now      = new Date();
            const active   =
              (!c.startDate || new Date(c.startDate)<=now) &&
              (!c.endDate   || new Date(c.endDate)  >=now);
            const signup   = `${location.origin}/portal/login?ref=${c.code}`;
            const qrSmall  = `/api/qr?data=${encodeURIComponent(signup)}&size=256`;
            const qrLarge  = `/api/qr?data=${encodeURIComponent(signup)}&size=1024`;

            return (
              <li key={c.id} className="border rounded p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold">{c.code}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${active?'bg-green-500':'bg-gray-400'}`}
                    title={active ? t[lang].statusActive : t[lang].statusExpired}
                  />
                  <button
                    onClick={()=>copy(signup)}
                    title={t[lang].copyLabel}
                    className="ml-auto text-gray-500 hover:text-green-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm text-gray-500">
                  {c.discount_pct}% {t[lang].offLabel}
                </p>

                {/* thumbnail QR */}
                <Image src={qrSmall} alt="QR" className="w-24 h-24 mt-1" />

                {/* hi-res download */}
                <a
                  href={qrLarge}
                  download={`${c.code}.png`}
                  className="inline-flex items-center gap-1 text-green-700 hover:underline text-sm"
                >
                  <Download className="w-4 h-4" /> {t[lang].downloadQrLabel}
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

/* ── tiny helpers ───────────────────────────────────────────── */
const LoaderRow = ({text}:{text:string})=>(
  <p className="p-6">
    <Loader className="inline w-4 h-4 animate-spin" /> {text}
  </p>
);

const Card = ({title,value}:{title:string;value:unknown})=>(
  <div className="border rounded p-4 text-center space-y-1">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const Table = ({rows,pct,lang}:{rows:unknown[];pct:number;lang:string})=>(
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm border-collapse">
      <thead className="bg-gray-50">
        <tr>
          <Th>{t[lang].dateHdr}</Th>
          <Th>{t[lang].farmerHdr}</Th>
          <Th>{t[lang].discountHdr}</Th>
          <Th>{t[lang].commissionHdr}</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r:unknown)=>(
          <tr key={r.id} className="even:bg-gray-50">
            <Td>{dayjs(r.signupDate).format('YYYY-MM-DD')}</Td>
            <Td>{r.farmerUser?.name || '—'}</Td>
            <Td>{r.discountValue ?? '—'}</Td>
            <Td>€ {((r.discountValue||0)*(pct/100)).toFixed(2)}</Td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Th = ({children}:{children:React.ReactNode})=>(
  <th className="px-3 py-2 text-left font-semibold">{children}</th>
);
const Td = ({children}:{children:React.ReactNode})=>(
  <td className="px-3 py-2 whitespace-nowrap">{children}</td>
);
