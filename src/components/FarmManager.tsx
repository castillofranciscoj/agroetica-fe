'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation }      from '@apollo/client';
import { useParams }                  from 'next/navigation';
import { ArrowLeft, Save, XCircle }   from 'lucide-react';

import { useLocaleRouter }            from '@/lib/useLocaleRouter';
import { useLanguage }                from '@/components/LanguageContext';
import { t }                          from '@/i18n';

import {
  CREATE_FARM,
  UPDATE_FARM,
  GET_FARM,
  GET_USER_ORGANISATIONS,
}                                     from '@/graphql/operations';

import LocationPicker                 from '@/components/LocationPicker';

type LatLng = { lat: number; lng: number };
type Mode   = 'new' | 'edit';

interface Props {
  currentUserId : string;
  mode?         : Mode;        // default → 'new'
  onCancel?     : () => void;
  onSaved?      : () => void;
}

export default function FarmManager({
  currentUserId,
  mode = 'new',
  onCancel,
  onSaved,
}: Props) {
  const router          = useLocaleRouter();
  const { lang }        = useLanguage();
  const { farmId }      = useParams<{ farmId?: string }>();

  if (mode === 'edit' && !farmId)
    throw new Error('FarmManager: mode="edit" but no farmId in URL');

  /* ─── local state ─────────────────────────────────────────────── */
  const [name,     setName]   = useState('');
  const [orgId,    setOrgId]  = useState<string | null>(null);
  const [coords,   setCoords] = useState<LatLng | null>(null);

  /* ─── look-ups: organisations the user belongs to ─────────────── */
  const { data: orgData } = useQuery(GET_USER_ORGANISATIONS, {
    variables  : { userId: currentUserId },
    fetchPolicy: 'cache-first',
  });
  const orgs = orgData?.users?.[0]?.memberships ?? [];

  /* ─── if editing, fetch the farm to pre-fill values ───────────── */
  const { data: farmData } = useQuery(GET_FARM, {
    skip       : mode === 'new',
    variables  : { id: farmId },
    fetchPolicy: 'cache-first',
  });

  useEffect(() => {
    if (mode === 'edit' && farmData?.farm) {
      const f = farmData.farm;
      setName(f.name ?? '');
      if (f.organisation?.id) setOrgId(f.organisation.id);
      if (f.location?.lat && f.location?.lng) {
        setCoords({ lat: f.location.lat, lng: f.location.lng });
      }
    }
  }, [farmData, mode]);

  /* ─── mutations ──────────────────────────────────────────────── */
  const [createFarm, { loading: creating }] = useMutation(CREATE_FARM);
  const [updateFarm, { loading: updating }] = useMutation(UPDATE_FARM);

  const handleSave: React.FormEventHandler = async e => {
    e.preventDefault();
    if (!name.trim())         return alert(t[lang].errorFarmNameRequired);
    if (!coords)              return alert(t[lang].errorFarmLocationRequired);

    try {
      if (mode === 'new') {
        await createFarm({
          variables: {
            name        : name.trim(),
            createdById : currentUserId,
            organisationId: orgId,
            location    : coords,
          },
        });
      } else {
        await updateFarm({
          variables: {
            id          : farmId,
            name        : name.trim(),
            organisationId: orgId,
            location    : coords,
          },
        });
      }
      onSaved ? onSaved() : router.back();
    } catch (err: any) {
      console.error(err);
      alert(err.message ?? 'Failed to save the farm.');
    }
  };

  /* ─────────────────────────── Render ─────────────────────────── */
  return (
    <div className="flex h-full flex-1">
      {/* ───── Left pane (form) ───── */}
      <div className="w-full md:w-1/2 p-6 overflow-y-auto">
        <button
          onClick={() => (onCancel ? onCancel() : router.back())}
          className="flex items-center gap-1 text-green-600 hover:underline mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          {t[lang].backLabel}
        </button>

        <h1 className="text-3xl font-bold mb-6">
          {mode === 'new' ? t[lang].addFarmTitle : t[lang].editFarmTitle}
        </h1>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Name ----------------------------------------------------- */}
          <div>
            <label className="block font-medium mb-1">
              {t[lang].farmNameLabel} *
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t[lang].farmNamePlaceholder}
              className="border rounded w-full p-2"
            />
          </div>

          {/* Organisation ------------------------------------------- */}
          <div>
            <label className="block font-medium mb-1">
              {t[lang].organisationLabel}
            </label>
            <select
              value={orgId ?? ''}
              onChange={e => setOrgId(e.target.value || null)}
              className="border rounded w-full p-2"
            >
              <option value="">{t[lang].selectLabel}</option>
              {orgs.map((m: any) => (
                <option key={m.organisation.id} value={m.organisation.id}>
                  {m.organisation.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location read-out -------------------------------------- */}
          <div>
            <p className="font-medium mb-1">{t[lang].locationTitle}</p>
            {coords ? (
              <p className="text-sm text-gray-700">
                <strong>Lat:</strong> {coords.lat.toFixed(6)}<br/>
                <strong>Lng:</strong> {coords.lng.toFixed(6)}
              </p>
            ) : (
              <p className="text-sm text-gray-500">{t[lang].noLocationSelected}</p>
            )}
          </div>

          {/* Buttons ------------------------------------------------- */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={creating || updating}
              className="flex items-center gap-1 bg-green-600 text-white px-4 py-2
                         rounded hover:bg-green-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4"/>
              {mode === 'new' ? t[lang].addFarmBtn : t[lang].saveChanges}
            </button>

            <button
              type="button"
              onClick={() => (onCancel ? onCancel() : router.back())}
              className="flex items-center gap-1 border px-4 py-2 rounded hover:bg-gray-100"
            >
              <XCircle className="w-4 h-4"/>
              {t[lang].cancelLabel}
            </button>
          </div>
        </form>
      </div>

      {/* ───── Right pane (map) ───── */}
      <div className="hidden md:block w-1/2 h-full">
        <LocationPicker
          position={coords ?? undefined}
          onChange={setCoords}
        />
      </div>
    </div>
  );
}
