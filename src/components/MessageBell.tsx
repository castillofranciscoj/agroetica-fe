'use client';

import React, { useState } from 'react';
import Link                from 'next/link';
import {
  Bell,
  BellRing,
  CheckCircle,        /* NEW */
} from 'lucide-react';
import MessageModal        from '@/components/MessageModal';
import NotificationModal   from '@/components/NotificationModal';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_UNREAD_COUNT,
  GET_INBOX,
  MARK_DELIVERY_READ,
  MARK_ALERT_READ,
} from '@/graphql/operations';
import { useLanguage } from '@/components/LanguageContext';
import { t }           from '@/i18n';

export default function MessageBell() {
  /* ----------------------------------------------------- */
  const { lang }          = useLanguage();
  const [open, setOpen]   = useState(false);
  const [tab , setTab ]   = useState<'messages' | 'notifications'>('messages');

  const [msgId  , setMsgId  ] = useState<string | null>(null);
  const [alertId, setAlertId] = useState<string | null>(null);

  /* counters & inbox ------------------------------------ */
  const { data: cnt }   = useQuery(GET_UNREAD_COUNT, { pollInterval: 30_000 });
  const { data: inbox } = useQuery(GET_INBOX,        { skip: !open });

  const [markDelivery] = useMutation(MARK_DELIVERY_READ, {
    refetchQueries: [GET_UNREAD_COUNT, GET_INBOX],
  });
  const [markAlert]    = useMutation(MARK_ALERT_READ, {
    refetchQueries: [GET_UNREAD_COUNT, GET_INBOX],
  });

  const deliveries = inbox?.messageDeliveries ?? [];
  const alerts     = inbox?.alerts            ?? [];

  const unread = (cnt?.deliveriesUnread ?? 0) + (cnt?.alertsUnread ?? 0);
  const Icon   = unread > 0 ? BellRing : Bell;

  /* miniature list row ---------------------------------- */
  const Item = ({
    title, ts, isAlert, onClick,
  }: {
    title: string; ts: string; isAlert: boolean; onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="flex flex-col text-left px-3 py-2 hover:bg-gray-50 w-full"
    >
      <span className="text-sm font-medium">{title}</span>
      <span className="text-xs text-gray-500">
        {new Date(ts).toLocaleString()}
      </span>
      {isAlert && (
        <span className="mt-1 inline-block bg-red-100 text-red-600 text-[10px] px-1.5 py-[1px] rounded">
          {t[lang].alertLabel}
        </span>
      )}
    </button>
  );

  /* ----------------------------------------------------- */
  return (
    <div className="relative">
      {/* bell ================================================ */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-1.5 rounded hover:bg-gray-100"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Icon className="w-5 h-5" />
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 text-[10px] leading-none
                       bg-red-600 text-white rounded-full px-1.5 py-[1px]"
          >
            {unread}
          </span>
        )}
      </button>

      {/* pop-up ============================================= */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
          <div className="px-4 py-2 border-b font-semibold text-sm">
            {t[lang].notificationCenterLabel}
          </div>

          {/* top-level column tabs */}
          <div className="flex text-sm">
            {(['messages', 'notifications'] as const).map(k => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`flex-1 text-center py-1 border-b-2 ${
                  tab === k
                    ? 'border-green-600 font-medium'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                {t[lang][`${k}TabLabel`]}
              </button>
            ))}
          </div>

          {/* list / empty-state */}
          <div className="max-h-72 overflow-y-auto">
            {/* ---------- EMPTY ---------- */}
            { (tab === 'messages'      && deliveries.length === 0) ||
              (tab === 'notifications' && alerts.length     === 0) ? (
              <div className="flex flex-col items-center py-10 text-gray-400">
                <CheckCircle className="w-14 h-14" /> {/* NEW – green tick */}
                <span className="mt-2 text-sm">
                  {tab === 'messages'
                    ? t[lang].noMessagesLabel      /* NEW */
                    : t[lang].noNotificationsLabel /* NEW */}
                </span>
              </div>
            ) : (
              /* ---------- LIST ---------- */
              <>
                {tab === 'notifications' && alerts.map((a: unknown) => (
                  <Item
                    key={a.id}
                    title={a.message}
                    ts={a.createdAt}
                    isAlert
                    onClick={() => {
                      setAlertId(a.id);
                      markAlert({ variables: { id: a.id } });
                    }}
                  />
                ))}

                {tab === 'messages' && deliveries.map((d: unknown) => (
                  <Item
                    key={d.id}
                    title={d.template.title}
                    ts={d.createdAt}
                    isAlert={false}
                    onClick={() => {
                      setMsgId(d.id);
                      markDelivery({ variables: { id: d.id } });
                    }}
                  />
                ))}
              </>
            )}
          </div>

          <Link
            href="/portal/messages"
            onClick={() => setOpen(false)}
            className="block text-center bg-blue-600 text-white py-2 rounded-b hover:bg-blue-700 text-sm"
          >
            {t[lang].allBtnLabel}
          </Link>
        </div>
      )}

      {/* modals */}
      {msgId   && (
        <MessageModal
          id={msgId}
          onClose={() => setMsgId(null)}
        />
      )}
      {alertId && (
        <NotificationModal
          id={alertId}
          onClose={() => setAlertId(null)}
        />
      )}
    </div>
  );
}
