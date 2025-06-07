'use client';

import React, { useState } from 'react';
import {
  useQuery, useLazyQuery, useMutation,
} from '@apollo/client';
import {
  Loader, Plus, Search, Trash2, Pencil, Check, X,
} from 'lucide-react';

import {
  /* partner CRUD */
  GET_REFERRAL_PARTNERS,
  CREATE_REFERRAL_PARTNER,
  CREATE_REFERRAL_PARTNER_FOR_USER,   // ★ NEW
  UPDATE_REFERRAL_PARTNER,

  /* role management */
  SEARCH_USERS,
  GET_PARTNER_MEMBERSHIPS,
  ADD_PARTNER_MEMBERSHIP,
  REMOVE_PARTNER_MEMBERSHIP,
} from '@/graphql/operations';
import { useLanguage } from '@/components/LanguageContext';
import { t }           from '@/i18n';

export default function PartnersPanel() {
  const { lang } = useLanguage();

  /* ───────────────── partner CRUD ───────────────── */
  const {
    data: partnerData, refetch: refetchPartners,
  } = useQuery(GET_REFERRAL_PARTNERS);

  const [createPartner]  = useMutation(CREATE_REFERRAL_PARTNER,
                                  { onCompleted: () => refetchPartners() });
  const [createForUser]  = useMutation(CREATE_REFERRAL_PARTNER_FOR_USER,
                                  { onCompleted: () => refetchPartners() });
  const [updatePartner]  = useMutation(UPDATE_REFERRAL_PARTNER,
                                  { onCompleted: () => refetchPartners() });

  /* create-form local state */
  const [name, setName]       = useState('');
  const [contact, setContact] = useState('');
  const [type, setType]       = useState<'shop'|'coop'|'café'|'agronomist'>('shop');
  const [pct,  setPct]        = useState('10');
  const [savingPartner, setSavingPartner] = useState(false);

  /* ───────────────── role management ────────────── */
  const { data: mData, refetch: refetchMemberships } = useQuery(GET_PARTNER_MEMBERSHIPS);

  const [query, setQuery] = useState('');
  const [runSearch, { data: sData, loading: searching }] =
    useLazyQuery(SEARCH_USERS, { fetchPolicy:'network-only' });

  const [addRole,    { loading: adding }]   =
    useMutation(ADD_PARTNER_MEMBERSHIP, { onCompleted: () => refetchMemberships() });

  const [removeRole, { loading: removing }] =
    useMutation(REMOVE_PARTNER_MEMBERSHIP, { onCompleted: () => refetchMemberships() });

  /* map owner → partner */
  const partnerByOwner: Record<string, unknown> = {};
  (partnerData?.referralPartners ?? []).forEach((p:unknown)=>{
    if (p.ownerUser) partnerByOwner[p.ownerUser.id] = p;
  });

  /* commission-edit */
  const [editId,  setEditId]  = useState<string|null>(null);
  const [editVal, setEditVal] = useState<string>('');

  /* ─────────────────────── UI ───────────────────── */
  return (
    <section className="border rounded p-4 space-y-8">

      {/* ═════ new partner form ═════ */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Plus className="w-5 h-5" /> {t[lang].partnerNewTitle}
        </h2>

        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
          onSubmit={async e=>{
            e.preventDefault();
            setSavingPartner(true);
            await createPartner({
              variables:{
                name,
                contactEmail : contact,
                type,
                commissionPct: parseFloat(pct) || 10,
              },
            });
            setSavingPartner(false);
            setName(''); setContact(''); setPct('10'); setType('shop');
          }}
        >
          <input className="border rounded p-2" required
                 placeholder={t[lang].partnerNamePH}
                 value={name} onChange={e=>setName(e.target.value)} />
          <input className="border rounded p-2" required type="email"
                 placeholder={t[lang].ownerEmailPH}
                 value={contact} onChange={e=>setContact(e.target.value)} />
          <select className="border rounded p-2"
                  value={type} onChange={e=>setType(e.target.value as unknown)}>
            <option value="shop">{t[lang].partnerTypeShop}</option>
            <option value="coop">{t[lang].partnerTypeCoop}</option>
            <option value="café">{t[lang].partnerTypeCafe}</option>
            <option value="agronomist">{t[lang].partnerTypeAgronomist}</option>
          </select>
          <input className="border rounded p-2" type="number" min={0} max={100}
                 placeholder={t[lang].commissionPH}
                 value={pct} onChange={e=>setPct(e.target.value)} />
          <button
            type="submit" disabled={savingPartner}
            className="col-span-full bg-green-600 text-white py-2 rounded
                       hover:bg-green-700 disabled:opacity-50"
          >
            {savingPartner ? t[lang].savingLabel : t[lang].createPartnerBtn}
          </button>
        </form>
      </div>

      {/* ═════ role assignment ═════ */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Search className="w-5 h-5" /> {t[lang].partnerRoleTitle}
        </h2>

        {/* search */}
        <form
          className="flex gap-2"
          onSubmit={e=>{e.preventDefault(); runSearch({ variables:{ query } });}}
        >
          <input className="border rounded p-2 flex-1"
                 placeholder={t[lang].searchUserPH}
                 value={query} onChange={e=>setQuery(e.target.value)} />
          <button disabled={searching}
                  className="border rounded px-3 bg-gray-100 hover:bg-gray-200">
            {t[lang].searchBtnLabel}
          </button>
        </form>

        {/* search results */}
        {searching && <p><Loader className="inline w-4 h-4 animate-spin" /> {t[lang].loadingLabel}</p>}

        {sData && (
          <ul className="space-y-1 text-sm">
            {sData.users.length === 0 && (
              <li className="text-gray-500">{t[lang].noResultsLabel}</li>
            )}

            {sData.users.map((u:unknown)=>(
              <li key={u.id} className="border rounded p-2 flex justify-between items-center">
                <span>{u.name || u.email}</span>

                {partnerByOwner[u.id] ? (
                  <span className="text-green-600">{t[lang].alreadyPartnerLabel}</span>
                ) : (
                  <button
                    onClick={async ()=>{
                      /* add role */
                      await addRole({ variables:{ userId:u.id } });

                      /* create ReferralPartner row with defaults (10 %) */
                      await createForUser({
                        variables:{
                          name          : u.name || u.email,
                          contactEmail  : u.email,
                          type          : 'shop',
                          commissionPct : 10,
                          ownerUserId   : u.id,
                        },
                      });

                      refetchPartners();
                      refetchMemberships();
                    }}
                    disabled={adding}
                    className="text-green-700 hover:underline"
                  >
                    {t[lang].addPartnerRoleBtn}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* current list + inline commission edit */}
        <h3 className="font-semibold">{t[lang].alreadyPartnerLabel}</h3>
        <ul className="space-y-1 text-sm">
          {(mData?.memberships ?? []).map((m:unknown)=>{
            const partner = partnerByOwner[m.user.id];
            const isEditing = editId === partner?.id;
            return (
              <li key={m.id} className="border rounded p-2 flex items-center gap-2">
                <span className="flex-1">{m.user.name || m.user.email}</span>

                {/* commission column */}
                {partner && (
                  isEditing ? (
                    <>
                      <input type="number" min={0} max={100}
                             className="border rounded p-1 w-20 text-right"
                             value={editVal}
                             onChange={e=>setEditVal(e.target.value)} />
                      <button
                        onClick={async ()=>{
                          await updatePartner({
                            variables:{
                              id            : partner.id,
                              commissionPct : parseFloat(editVal)||0,
                            },
                          });
                          setEditId(null); setEditVal('');
                        }}
                        className="text-green-700">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={()=>{ setEditId(null); setEditVal(''); }}
                              className="text-gray-500">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="w-16 text-right">
                        {partner.commission_pct != null ? `${partner.commission_pct}%` : '—'}
                      </span>
                      <button
                        onClick={()=>{
                          setEditId(partner.id);
                          setEditVal(partner.commission_pct != null
                            ? String(partner.commission_pct) : '');
                        }}
                        className="text-gray-500 hover:text-green-700">
                        <Pencil className="w-4 h-4" />
                      </button>
                    </>
                  )
                )}

                {/* remove membership */}
                <button
                  onClick={()=>removeRole({ variables:{ id:m.id } })}
                  disabled={removing}
                  className="text-red-600 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> {t[lang].removeBtnLabel}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
