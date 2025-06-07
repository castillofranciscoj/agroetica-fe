// src/components/MessageDelivery.tsx
'use client';

import React, { useState, useEffect } from 'react';
import dayjs                     from 'dayjs';
import relativeTime              from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import {
  Loader, RefreshCcw, Repeat2, Ban,
  Link as LinkIcon, Image as ImgIcon, Send,
  Users as UsersIcon,
}                                from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client';

import {
  GET_MESSAGE_DELIVERIES,
  UPDATE_MESSAGE_DELIVERY,
  GET_MESSAGE_TEMPLATES,
  CREATE_MESSAGE_DELIVERY,
  GET_USERS_BY_ROLE,
}                                from '@/graphql/operations';

import { useLanguage }           from '@/components/LanguageContext';
import { t }                     from '@/i18n';

/* -------------------- constants -------------------- */
const PAGE_SIZE = 20;
const ROLE_OPTS = ['all', 'admin', 'farmer', 'advisor', 'worker', 'partner'] as const;
type RoleOpt    = typeof ROLE_OPTS[number];

/* -------------------- helpers ---------------------- */
function uniq<T, K extends keyof T>(arr: T[], key: K): T[] {
  const map: Record<string | number | symbol, T> = {};
  arr.forEach(item => { map[String(item[key])] = item; });
  return Object.values(map);
}
const excerpt = (md?: string) =>
  md ? md.replace(/[#_*`>~\-!\[\]\(\)]/g, '').slice(0, 120) + (md.length > 120 ? '…' : '') : '';

/* =================================================== */
export default function MessageDelivery() {
  const { lang } = useLanguage();

  /* ------------- list filters / paging -------------- */
  const [statusFilter, setStatusFilter] =
    useState<'all' | 'unread' | 'read' | 'remindLater' | 'dismissed'>('all');
  const [skip, setSkip] = useState(0);
  const whereVar = statusFilter === 'all' ? {} : { status: { equals: statusFilter } };

  /* ------------- fetch existing deliveries ---------- */
  const { data, loading, error, fetchMore, refetch } = useQuery(GET_MESSAGE_DELIVERIES, {
    variables: { where: whereVar, take: PAGE_SIZE, skip: 0 },
    fetchPolicy: 'network-only',
  });
  const deliveries: unknown[] = data?.messageDeliveries ?? [];

  /* ------------- template list ---------------------- */
  const { data: tplData } = useQuery(GET_MESSAGE_TEMPLATES);
  const templates: unknown[] = tplData?.messageTemplates ?? [];

  /* ------------- mutations -------------------------- */
  const [updateDelivery] = useMutation(UPDATE_MESSAGE_DELIVERY, {
    onCompleted: () => refetch(),
  });
  const [createDelivery] = useMutation(CREATE_MESSAGE_DELIVERY, {
    onCompleted: () => refetch(),
  });

  /* ------------- quick-add form --------------------- */
  const [tplId, setTplId] = useState('');
  const [role, setRole]   = useState<RoleOpt>('all');
  const [users, setUsers] = useState<unknown[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  /* fetch users when role changes (skip "all") -------- */
  const { data: userData, refetch: refetchUsers } = useQuery(GET_USERS_BY_ROLE, {
    variables: { role },
    skip: role === 'all',
  });

  /* whenever role data arrives, pre-select all -------- */
  useEffect(() => {
    if (role === 'all') {
      setUsers([]);
      setSelected(new Set());
      return;
    }
    const mems = userData?.memberships ?? [];
    const list = uniq(mems.map((m: unknown) => m.user), 'id');
    setUsers(list);
    setSelected(new Set(list.map((u: unknown) => u.id)));
  }, [userData, role]);

  const selCount = selected.size;

  /* bulk creation confirmation ----------------------- */
  const [showConfirm, setShowConfirm] = useState(false);

  const sendBulk = async () => {
    setShowConfirm(false);
    if (!tplId || selCount === 0) return;

    await Promise.all(
      Array.from(selected).map(uid =>
        createDelivery({ variables: { templateId: tplId, userId: uid } }),
      ),
    );
    // reset mini-form
    setTplId('');
    setRole('all');
    setUsers([]);
    setSelected(new Set());
  };

  /* ------------- helpers --------------------------- */
  const loadMore = async () => {
    const next = skip + PAGE_SIZE;
    await fetchMore({ variables: { where: whereVar, take: PAGE_SIZE, skip: next } });
    setSkip(next);
  };

  /* ===============  UI  ============================ */
  return (
    <section className="border rounded p-4 space-y-4">
      {/* -------- TITLE & REFRESH --------------------- */}
      <h2 className="text-xl font-semibold flex items-center gap-2">
        {t[lang].deliveriesTitle}
        <button
          onClick={() => {
            setSkip(0);
            refetch({ where: whereVar, take: PAGE_SIZE, skip: 0 });
          }}
          className="ml-2 text-gray-600 hover:text-gray-800"
          title={t[lang].refreshLabel}
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </h2>

      {/* -------- quick bulk-send form ---------------- */}
      <div className="border rounded p-3 space-y-2 bg-gray-50">
        {/* template select */}
        <select
          value={tplId}
          onChange={e => setTplId(e.target.value)}
          className="border rounded p-2 text-sm w-full"
        >
          <option value="">{t[lang].templateLabel}</option>
          {templates.map(tpl => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.title}
            </option>
          ))}
        </select>

        {/* role select */}
        <select
          value={role}
          onChange={e => {
            const v = e.target.value as RoleOpt;
            setRole(v);
            setUsers([]);
            setSelected(new Set());
            if (v !== 'all') refetchUsers({ role: v });
          }}
          className="border rounded p-2 text-sm w-full"
        >
          {ROLE_OPTS.map(r => (
            <option key={r} value={r}>
              {r === 'all' ? t[lang].allRolesLabel : r}
            </option>
          ))}
        </select>

        {/* user list checkboxes (only when a role chosen) */}
          {users.length > 0 ? (
            <div className="max-h-40 overflow-y-auto border rounded p-2">
              {users.map(u => (
                <label key={u.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.has(u.id)}
                    onChange={e => {
                      const next = new Set(selected);
                      if (e.target.checked) {
                        next.add(u.id);
                      } else {
                        next.delete(u.id);
                      }
                      setSelected(next);
                    }}
                  />
                  {u.email ?? u.name ?? u.id}
                </label>
              ))}
            </div>
          ) : null}


        {/* send button */}
        <button
          onClick={() => setShowConfirm(true)}
          disabled={!tplId || (role !== 'all' && selCount === 0)}
          className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded disabled:opacity-40"
        >
          <Send className="w-4 h-4" /> {t[lang].sendLabel}
        </button>
      </div>

      {/* -------- confirmation modal ------------------ */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg p-6 w-[90%] max-w-sm space-y-4 text-center">
            <UsersIcon className="w-10 h-10 mx-auto text-green-600" />
            <p className="font-medium">
              {t[lang].confirmSendBody.replace(
                '{count}',
                String(role === 'all' ? t[lang].allLabel : selCount),
              )}
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <button onClick={sendBulk} className="bg-green-600 text-white px-4 py-2 rounded">
                {t[lang].confirmBtnLabel}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded border hover:bg-gray-50"
              >
                {t[lang].cancelBtnLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------- status filter ----------------------- */}
      <select
        className="border rounded p-2 h-10"
        value={statusFilter}
        onChange={e => {
          const v = e.target.value as typeof statusFilter;
          setStatusFilter(v);
          setSkip(0);
          refetch({ where: v === 'all' ? {} : { status: { equals: v } }, take: PAGE_SIZE, skip: 0 });
        }}
      >
        <option value="all">{t[lang].status_all}</option>
        <option value="unread">{t[lang].status_unread}</option>
        <option value="read">{t[lang].status_read}</option>
        <option value="remindLater">{t[lang].status_remindLater}</option>
        <option value="dismissed">{t[lang].status_dismissed}</option>
      </select>

      {/* -------- loader / error ---------------------- */}
      {loading && skip === 0 && (
        <p>
          <Loader className="inline w-4 h-4 animate-spin" /> {t[lang].loadingLabel}
        </p>
      )}
      {error && <p className="text-red-600">{error.message}</p>}

      {/* -------------- list -------------------------- */}
      <ul className="space-y-3">
        {deliveries.map(d => (
          <li key={d.id} className="border rounded p-3 relative">
            {/* row actions */}
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() =>
                  updateDelivery({ variables: { id: d.id, data: { status: 'unread', views: 0 } } })
                }
                title={t[lang].resendLabel}
                className="text-blue-600 hover:text-blue-800"
              >
                <Repeat2 className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  updateDelivery({ variables: { id: d.id, data: { status: 'dismissed' } } })
                }
                title={t[lang].forceDismissLabel}
                className="text-red-600 hover:text-red-800"
              >
                <Ban className="w-4 h-4" />
              </button>
            </div>

            {/* title & chips */}
            <div className="font-semibold flex items-center gap-2 flex-wrap">
              {d.template.title}
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                {t[lang][`type_${d.template.type}`]}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                  d.urgency === 'critical'
                    ? 'bg-red-600 text-white'
                    : d.urgency === 'high'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {t[lang][`urgency_${d.urgency}`]}
              </span>
              {d.template.mediaId && <ImgIcon className="w-4 h-4 text-gray-400" title="media" />}
              {d.template.ctaLabel && (
                <span className="flex items-center gap-1 text-xs text-blue-600">
                  <LinkIcon className="w-3 h-3" /> {d.template.ctaLabel}
                </span>
              )}
            </div>

            {d.template.bodyMarkdown && (
              <p className="text-sm text-gray-700 mt-1">
                {excerpt(d.template.bodyMarkdown)}
              </p>
            )}

            {/* channels */}
            <div className="mt-1 flex flex-wrap gap-1">
              {d.template.channelMask?.map((c: string) => (
                <span key={c} className="text-[11px] px-1.5 py-[1px] bg-gray-200 rounded">
                  {c}
                </span>
              ))}
            </div>

            {/* meta */}
            <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 mt-1">
              <span>{d.user.email}</span>
              <span>
                {t[lang][`status_${d.status}`]} · {dayjs(d.createdAt).format('DD MMM YYYY')}
              </span>
              <span>
                {d.views} {t[lang].viewsLabel}
                {d.lastShownAt &&
                  ` · ${t[lang].lastShownAtLabel} ${dayjs(d.lastShownAt).fromNow()}`}
              </span>
              <span>
                {d.clicks.length} {t[lang].clicksLabel}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* load-more */}
      {deliveries.length === skip + PAGE_SIZE && (
        <button onClick={loadMore} className="mt-2 text-sm text-blue-600 hover:underline">
          {t[lang].loadMoreLabel}
        </button>
      )}
    </section>
  );
}
