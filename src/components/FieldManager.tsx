// src/components/FieldManager.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams }        from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { ArrowLeft } from 'lucide-react';

import { useLocaleRouter }  from '@/lib/useLocaleRouter';
import { useLanguage }      from '@/components/LanguageContext';
import { t }                from '@/i18n';

import {
  GET_USER_FARMS,
  GET_FIELD,
  CREATE_FIELD,
  UPDATE_FIELD,
}                           from '@/graphql/operations';

import useFieldGeometry     from '@/components/useFieldGeometry';
import FieldForm            from '@/components/FieldForm';
import FieldBoundaryMap     from '@/components/FieldBoundaryMap';

/* ───────────────────────────────────────────────────────────── */
type Mode = 'new' | 'edit';
interface Props {
  currentUserId: string;
  mode?: Mode;
  onSaved?: () => void;
  onCancel?: () => void;
}
/* ───────────────────────────────────────────────────────────── */
export default function FieldManager({
  currentUserId,
  mode = 'new',
  onSaved,
  onCancel,
}: Props) {
  const router            = useLocaleRouter();
  const { fieldId }       = useParams<{ fieldId?: string }>();
  const { lang }          = useLanguage();

  if (mode === 'edit' && !fieldId)
    throw new Error('FieldManager: mode="edit" but no fieldId in URL');

  /* ---------- state ---------- */
  const [farmId, setFarmId]       = useState<string>('');
  const [name,   setName]         = useState('');
  const [boundary, setBoundary]   = useState<GeoJSON.FeatureCollection | null>(null);

  /* ---------- farms for selector ---------- */
  const { data: farmsData } = useQuery(GET_USER_FARMS, {
    variables:{ userId: currentUserId },
    fetchPolicy:'cache-first',
  });
  const farms = farmsData?.farms ?? [];
  const currentFarm = farms.find(f => f.id === farmId);

  /* ---------- existing field (edit) ---------- */
  const { data: fieldData } = useQuery(GET_FIELD, {
    skip       : mode === 'new',
    variables  : { id: fieldId },
    fetchPolicy: 'cache-first',
  });
  useEffect(()=>{
    if (mode==='edit' && fieldData?.field) {
      const f = fieldData.field;
      setFarmId(f.farm?.id ?? '');
      setName(f.name ?? '');
      setBoundary(f.boundary ?? null);
    }
  },[fieldData,mode]);

  /* ---------- geometry helpers ---------- */
  const ring: number[][] | undefined = useMemo(()=>(
    boundary?.features?.[0]?.geometry?.coordinates?.[0] as number[][] | undefined
  ),[boundary]);

  const { areaHa, centroid } = useFieldGeometry(ring);

  /* ---------- mutations ---------- */
  const [createField, { loading: creating }] = useMutation(CREATE_FIELD);
  const [updateField, { loading: updating }] = useMutation(UPDATE_FIELD);

  const handleSubmit = async () => {
    if (!farmId)        { alert(t[lang].errorSelectFarm);       return; }
    if (!name.trim())   { alert(t[lang].errorFieldNameRequired);return; }
    if (!boundary)      { alert(t[lang].errorDrawBoundary);     return; }

    const vars = {
      farmId,
      name        : name.trim(),
      areaHectares: areaHa,
      location    : centroid,   // <— centre of polygon
      boundary,
    };

    try {
      if (mode==='new') await createField({ variables: vars });
      else              await updateField({ variables:{ id:fieldId, ...vars } });
      onSaved ? onSaved() : router.back();
    } catch (err:any) { alert(err.message); }
  };

  /* ---------- render ---------- */
  return (
    <div className="flex h-full">
      {/* left — back + form */}
      <div className="w-full md:max-w-sm flex-none p-6 overflow-y-auto">
        <button
          onClick={() => (onCancel ? onCancel() : router.back())}
          className="flex items-center gap-1 text-green-600 hover:underline mb-4"
        >
          <ArrowLeft className="w-5 h-5"/>{t[lang].backLabel}
        </button>

        <h1 className="text-3xl font-bold mb-6">
          {mode==='new' ? t[lang].addFieldTitle : t[lang].editFieldTitle}
        </h1>

        <FieldForm
          farms={farms}
          values={{ farmId, name, areaHa }}
          onChange={(k,v)=>{
            if (k==='farmId') setFarmId(v);
            else if (k==='name') setName(v);
          }}
          boundaryDrawn={!!boundary}
          onSubmit={handleSubmit}
          onCancel={()=> (onCancel ? onCancel() : router.back())}
          submitting={creating||updating}
          mode={mode}
        />
      </div>

      {/* right — inline boundary editor */}
      <FieldBoundaryMap
        title={name || t[lang].untitledField}
        boundary={boundary}
        onBoundaryChange={setBoundary}
        farmGeo={currentFarm?.boundary ?? null}
      />
    </div>
  );
}
