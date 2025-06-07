/* ----------------------------------------------------------------------
   src/app/[lang]/portal/(main)/farm/fields/[fieldId]/add-crop/page.tsx
   -------------------------------------------------------------------- */
'use client';
export const dynamic = 'force-dynamic';

import React, { useMemo, useState } from 'react';
import { useParams }       from 'next/navigation';
import { useLocaleRouter } from '@/lib/useLocaleRouter';
import { useQuery, useMutation } from '@apollo/client';
import {
  useJsApiLoader, GoogleMap, Polygon,
} from '@react-google-maps/api';
import dayjs               from 'dayjs';
import { ArrowLeft, Save, XCircle } from 'lucide-react';

import {
  GET_FIELD,
  GET_CROP_TYPES,
  CREATE_CROP,
  /* 🔸  NEW  — we also need existing crops */
  GET_CROPS,
}                          from '@/graphql/operations';

import { useLanguage }     from '@/components/LanguageContext';
import { t }               from '@/i18n';

import CropBoundaryEditor  from '@/components/CropBoundaryEditor';
import useFieldGeometry    from '@/components/useFieldGeometry';

/* ------------------------------------------------------------------ */
/* Maps loader (shared id)                                            */
/* ------------------------------------------------------------------ */
const LOADER_ID = 'gmaps-shared';
const LIBS: ('drawing' | 'places' | 'geometry')[] =
  ['drawing', 'places', 'geometry'];

/* ------------------------------------------------------------------ */
export default function AddCropPage() {
  const router        = useLocaleRouter();
  const { fieldId }   = useParams<{ fieldId: string }>();
  const { lang }      = useLanguage();

  /* maps SDK ----------------------------------------------------- */
  const { isLoaded: mapsLoaded } = useJsApiLoader({
    id: LOADER_ID,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: LIBS,
  });

  /* field + crop-type look-ups ---------------------------------- */
  const { data: fieldData, loading: fldLoading } = useQuery(GET_FIELD, {
    variables   : { id: fieldId },
    fetchPolicy : 'cache-first',
  });
  const { data: ctData } = useQuery(GET_CROP_TYPES);

  /* 🔸  fetch *all* existing crops for that field ---------------- */
  const { data: cropsData } = useQuery(GET_CROPS, {
    variables   : { fieldId },
    fetchPolicy : 'cache-and-network',
  });

  /* create-mutation --------------------------------------------- */
  const [createCrop, { loading: saving }] = useMutation(CREATE_CROP, {
    onCompleted  : () => router.push('/portal/farm/fields'),
    refetchQueries: ['GetCrops'],
    onError      : err => alert(err.message),
  });

  /* form state --------------------------------------------------- */
  const [cropTypeId, setCropTypeId] = useState('');
  const [boundary  , setBoundary  ] = useState<GeoJSON.FeatureCollection|null>(null);
  const [areaHa    , setAreaHa    ] = useState('');
  const [plantDate , setPlantDate ] = useState('');
  const [note      , setNote      ] = useState('');
  const [gmo       , setGmo       ] = useState(false);
  const [photoUrl  , setPhotoUrl  ] = useState('');

  /* geometry helper (area / centroid) ---------------------------- */
  const ring: number[][]|undefined = useMemo(
    () => boundary?.features?.[0]?.geometry?.coordinates?.[0] as number[][]|undefined,
    [boundary],
  );
  const { areaHa: drawnAreaHa, centroid } = useFieldGeometry(ring);

  /* guards ------------------------------------------------------- */
  if (fldLoading || !ctData) return <p className="p-6">{t[lang].loadingLabel}…</p>;
  if (!fieldData?.field)      return <p className="p-6 text-red-600">{t[lang].errorLoadingData}</p>;

  const field = fieldData.field;

  /* ---------------------------------------------------------------- */
  /* submit                                                           */
  /* ---------------------------------------------------------------- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropTypeId) { alert(t[lang].errorSelectCropType); return; }
    if (!boundary  ) { alert(t[lang].errorDrawBoundary);   return; }

    createCrop({
      variables:{
        landId          : fieldId,
        cropTypeId,
        cropAreaHectares: drawnAreaHa,
        boundary,
        location        : centroid,
        plantedDate     : plantDate ? new Date(plantDate) : null,
        note, photoUrl, isGmo:gmo,
      },
    });
  };

  /* ---------------------------------------------------------------- */
  /* other crops’ boundaries  →  orange overlays in the editor         */
  /* ---------------------------------------------------------------- */
  const otherBoundaries: GeoJSON.FeatureCollection[] =
    (cropsData?.crops ?? []).map((c:any)=>c.boundary).filter(Boolean);

  /* ---------------------------------------------------------------- */
  /* Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="flex h-full">
      {/* ───────── Left – form ───────── */}
      <div className="w-full md:max-w-sm p-6 overflow-y-auto space-y-6">
        {/* back */}
        <button onClick={()=>router.back()}
                className="flex items-center gap-1 text-green-600 hover:underline mb-2">
          <ArrowLeft className="w-5 h-5"/>{t[lang].backLabel}
        </button>

        <h1 className="text-3xl font-bold">{t[lang].addCropTitle}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* crop-type */}
          <div>
            <label className="block font-medium mb-1">{t[lang].cropTypeLabel} *</label>
            <select value={cropTypeId} onChange={e=>setCropTypeId(e.target.value)}
                    className="border rounded w-full p-2">
              <option value="">{t[lang].selectLabel}</option>
              {ctData.cropTypes.map((ct:any)=>(
                <option key={ct.id} value={ct.id}>{ct.name}</option>
              ))}
            </select>
          </div>

          {/* readonly area */}
          <p className="text-sm">
            {t[lang].areaHectaresLabel}: <strong>{drawnAreaHa.toFixed(2)} ha</strong>
          </p>

          {/* (rest of the inputs unchanged)… */}
          {/* … area override, plant date, GMO, note, photo URL … */}
          {/* buttons */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
                    className="inline-flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
              <Save className="w-4 h-4"/>{t[lang].saveLabel}
            </button>
            <button type="button" onClick={()=>router.back()}
                    className="inline-flex items-center gap-1 border px-4 py-2 rounded hover:bg-gray-100">
              <XCircle className="w-4 h-4"/>{t[lang].cancelLabel}
            </button>
          </div>
        </form>
      </div>

      {/* ───────── Right – boundary editor ───────── */}
      <div className="hidden md:block flex-1 h-full">
        <CropBoundaryEditor
          title={
            cropTypeId
              ? (ctData.cropTypes.find((c:any)=>c.id===cropTypeId)?.name ?? '')
              : t[lang].untitledCrop
          }
          boundary={boundary}
          onChange={setBoundary}
          fieldBoundary={field.boundary}
          otherCropBoundaries={otherBoundaries}
        />
      </div>
    </div>
  );
}
