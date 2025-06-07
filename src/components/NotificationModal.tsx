'use client';

import React           from 'react';
import dayjs           from 'dayjs';
import { X }           from 'lucide-react';
import { useQuery,
         useMutation } from '@apollo/client';
import {
  GET_ALERT_DETAIL,
  MARK_ALERT_READ,
  GET_UNREAD_COUNT,
  GET_INBOX,
}                      from '@/graphql/operations';
import { useLanguage } from '@/components/LanguageContext';
import { t }           from '@/i18n';

export default function NotificationModal({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { lang } = useLanguage();

  /* alert detail */
  const { data, loading } = useQuery(GET_ALERT_DETAIL, {
    variables: { id },
    skip: !id,
  });

  /* dismiss */
  const [dismiss] = useMutation(MARK_ALERT_READ, {
    variables: { id },
    refetchQueries: [GET_UNREAD_COUNT, GET_INBOX],
  });

  if (!id || loading) return null;
  const a = data?.alert;
  if (!a) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <article className="bg-white w-[380px] max-w-[90%] rounded shadow relative p-6 space-y-4">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold">{t[lang].notificationLabel}</h3>

        <p className="text-sm whitespace-pre-line">{a.message}</p>

        <div className="text-xs text-gray-500">
          {dayjs(a.createdAt).format('DD MMM YYYY, HH:mm')}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={async () => {
              await dismiss();
              onClose();
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded py-2 text-sm"
          >
            {t[lang].dismissLabel}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 rounded py-2 text-sm"
          >
            {t[lang].closeLabel}
          </button>
        </div>
      </article>
    </div>
  );
}
