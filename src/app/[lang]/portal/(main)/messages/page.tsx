'use client';

import React, { useState } from 'react';
import dayjs               from 'dayjs';
import { useQuery }        from '@apollo/client';
import {
  GET_RECEIVED_MESSAGES,
  GET_SENT_MESSAGES,
  GET_ALERTS,
}                          from '@/graphql/operations';
import { useLanguage }     from '@/components/LanguageContext';
import { t }               from '@/i18n';
import {
  Loader,
  ChevronLeft,
  ChevronRight,
}                          from 'lucide-react';

/* ───────── constants ───────── */
const PAGE_SIZE    = 20;
const URGENCY_OPTS = ['all', 'low', 'normal', 'high', 'critical'] as const;

/* ───────── page ───────── */
export default function MessagesPage() {
  const { lang } = useLanguage();

  /* ------------- UI state ------------- */
  const [column , setColumn ] =
    useState<'messages' | 'notifications'>('messages');
  const [tab    , setTab    ] =
    useState<'received' | 'sent'>('received');
  const [page   , setPage   ] = useState(1);

  /* filters */
  const [search    , setSearch    ] = useState('');
  const [urgency   , setUrgency   ] =
    useState<typeof URGENCY_OPTS[number]>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [fromDate  , setFromDate  ] = useState('');
  const [toDate    , setToDate    ] = useState('');

  /* always give backend a string (never null) */
  const searchVar = search.trim();

  /* -------- build dynamic where -------- */
  const baseWhere = () => {
    const AND: unknown[] = [];

    if (urgency   !== 'all') AND.push({ urgency: { equals: urgency } });
    if (unreadOnly)         AND.push({ status  : { equals: 'unread' } });
    if (fromDate)           AND.push({
      createdAt: { gte: new Date(fromDate).toISOString() },
    });
    if (toDate)             AND.push({
      createdAt: { lte: dayjs(toDate).endOf('day').toISOString() },
    });

    return AND.length ? { AND } : {};
  };

  /* -------------- queries -------------- */
  const { data: recData,  loading: recLoading } = useQuery(
    GET_RECEIVED_MESSAGES,
    {
      variables: {
        where : baseWhere(),
        take  : PAGE_SIZE,
        skip  : (page - 1) * PAGE_SIZE,
        search: searchVar,
      },
      skip: !(column === 'messages' && tab === 'received'),
      fetchPolicy: 'network-only',
    },
  );

  const { data: sentData, loading: sentLoading } = useQuery(
    GET_SENT_MESSAGES,
    {
      variables: {
        where : baseWhere(),
        take  : PAGE_SIZE,
        skip  : (page - 1) * PAGE_SIZE,
        search: searchVar,
      },
      skip: !(column === 'messages' && tab === 'sent'),
      fetchPolicy: 'network-only',
    },
  );

  const { data: alertData, loading: alertLoading } = useQuery(
    GET_ALERTS,
    {
      variables: {
        where : baseWhere(),
        take  : PAGE_SIZE,
        skip  : (page - 1) * PAGE_SIZE,
        search: searchVar,
      },
      skip: column !== 'notifications',
      fetchPolicy: 'network-only',
    },
  );

  /* pick list + totals according to tab/column */
  const deliveries = tab === 'received'
    ? recData?.messageDeliveries ?? []
    : sentData?.messageDeliveries ?? [];

  const deliveriesCount = tab === 'received'
    ? recData?.messageDeliveriesCount ?? 0
    : sentData?.messageDeliveriesCount ?? 0;

  const alerts      = alertData?.alerts      ?? [];
  const alertsCount = alertData?.alertsCount ?? 0;

  const busy = recLoading || sentLoading || alertLoading;

  /* ------------- render -------------- */
  return (
    <main className="p-6">
      {/* page title */}
      <h1 className="text-2xl font-bold mb-4">{t[lang].inboxTitle}</h1>

      <div className="flex gap-6">
        {/* column tabs (vertical list) */}
        <nav className="w-44 space-y-2">
          {(['messages', 'notifications'] as const).map(c => (
            <button
              key={c}
              onClick={() => { setColumn(c); setPage(1); }}
              className={`w-full text-left px-3 py-2 rounded
                          ${column === c
                            ? 'bg-gray-100 border-l-4 border-green-600 font-medium'
                            : 'hover:bg-gray-50'}`}
            >
              {t[lang][`${c}TabLabel`]}
            </button>
          ))}
        </nav>

        {/* main panel */}
        <section className="flex-1 space-y-4">
          {/* sub-tabs for “Messages” */}
          {column === 'messages' && (
            <div className="flex gap-6 border-b">
              {(['received', 'sent'] as const).map(k => (
                <button
                  key={k}
                  onClick={() => { setTab(k); setPage(1); }}
                  className={`pb-1 px-2 -mb-[1px] border-b-2
                              ${tab === k
                                ? 'border-green-600 font-medium'
                                : 'border-transparent hover:border-gray-300'}`}
                >
                  {t[lang][`${k}TabLabel`]}
                </button>
              ))}
            </div>
          )}

          {/* filter bar */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* search */}
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={t[lang].searchPlaceholder}
              className="border rounded p-1.5 flex-1 min-w-[160px]"
            />

            {/* urgency */}
            <select
              value={urgency}
              onChange={e => { setUrgency(e.target.value as unknown); setPage(1); }}
              className="border rounded p-1.5"
            >
              {URGENCY_OPTS.map(u => (
                <option key={u} value={u}>
                  {u === 'all'
                    ? t[lang].allLabel
                    : t[lang][`urgency_${u}`]}
                </option>
              ))}
            </select>

            {/* unread only */}
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={e => { setUnreadOnly(e.target.checked); setPage(1); }}
              />
              {t[lang].unreadOnlyLabel}
            </label>

            {/* date range */}
            <input
              type="date"
              value={fromDate}
              onChange={e => { setFromDate(e.target.value); setPage(1); }}
              className="border rounded p-1.5"
            />
            <input
              type="date"
              value={toDate}
              onChange={e => { setToDate(e.target.value); setPage(1); }}
              className="border rounded p-1.5"
            />
          </div>

          {/* list */}
          {busy ? (
            <p>
              <Loader className="inline w-4 h-4 animate-spin" />{' '}
              {t[lang].loadingLabel}
            </p>
          ) : (
            <ul className="space-y-3">
              {column === 'messages'
                ? deliveries.map((d: unknown) => (
                    <li key={d.id} className="border rounded p-3">
                      <div className="font-semibold">{d.template.title}</div>
                      <div className="text-xs text-gray-500">
                        {d.status} ·{' '}
                        {dayjs(d.createdAt).format('DD MMM YYYY')}
                      </div>
                    </li>
                  ))
                : alerts.map((a: unknown) => (
                    <li key={a.id} className="border rounded p-3">
                      <div className="font-semibold">{a.message}</div>
                      <div className="text-xs text-gray-500">
                        {a.urgency} ·{' '}
                        {dayjs(a.createdAt).format('DD MMM YYYY')}
                      </div>
                    </li>
                  ))}
            </ul>
          )}

          {/* pagination */}
          <div className="flex items-center gap-4 justify-center pt-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 py-1 bg-green-600 text-white rounded text-sm">
              {page}
            </span>

            <button
              onClick={() => setPage(p => p + 1)}
              disabled={
                column === 'messages'
                  ? page * PAGE_SIZE >= deliveriesCount
                  : page * PAGE_SIZE >= alertsCount
              }
              className="disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
