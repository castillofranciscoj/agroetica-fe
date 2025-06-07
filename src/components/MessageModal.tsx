'use client';

import React from 'react';
import { X } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_MESSAGE_DETAIL,
  MARK_DELIVERY_READ,
  MARK_DELIVERY_REMIND,   // ← new import
  GET_UNREAD_COUNT,
  GET_INBOX,
} from '@/graphql/operations';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';
import Image from 'next/image';

export default function MessageModal({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { lang } = useLanguage();

  /* full delivery payload */
  const { data, loading } = useQuery(GET_MESSAGE_DETAIL, {
    variables: { id },
    skip: !id,
  });

  /* mark read vs. remind-later */
  const [markRead] = useMutation(MARK_DELIVERY_READ, {
    variables: { id },
    refetchQueries: [GET_UNREAD_COUNT, GET_INBOX],
  });

  const [remindLater] = useMutation(MARK_DELIVERY_REMIND, {
    variables: { id, ts: new Date().toISOString() },
    refetchQueries: [GET_UNREAD_COUNT, GET_INBOX],
  });

  if (!id || loading) return null;

  const d   = data?.messageDelivery;
  const tpl = d?.template;
  if (!tpl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative bg-white w-[420px] max-w-[90%] rounded shadow-lg overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        {tpl.mediaId && (
          <Image src={tpl.mediaId} alt="" className="w-full h-40 object-cover" />
        )}

        <div className="p-5 space-y-4">
          <h3 className="text-lg font-semibold">{tpl.title}</h3>

          <div
            className="prose text-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(tpl.bodyMarkdown ?? ''),
            }}
          />

          {tpl.ctaLink && tpl.ctaLabel && (
            <a
              href={tpl.ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-green-600 text-white rounded py-2 hover:bg-green-700"
            >
              {tpl.ctaLabel}
            </a>
          )}

          {/* footer */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={async () => {
                await markRead();
                onClose();
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 rounded py-2 text-sm"
            >
              {t[lang].readBtnLabel}
            </button>

            <button
              onClick={async () => {
                /* just bump lastShownAt → stays “unread” */
                await remindLater();
                onClose();
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded py-2 text-sm"
            >
              {t[lang].laterBtnLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
