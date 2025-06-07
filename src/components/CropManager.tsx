'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  CREATE_CROP, DELETE_CROP, UPDATE_CROP,
  GET_CROPS,   GET_CROP_TYPES, GET_FIELD,
} from '@/graphql/operations';
import { t }           from '@/i18n';
import { useLanguage } from './LanguageContext';

import CropBoundaryEditor from './CropBoundaryEditor';   // 🟢 swap-in
import useFieldGeometry   from './useFieldGeometry';

type Props = {
  fieldId   : string;
  fieldArea : number;
};

export default function CropManager({ fieldId, fieldArea }: Props) {
  const { lang } = useLanguage();

  /* ───── fetches ───── */
  const { data: fieldData }      = useQuery(GET_FIELD,  { variables:{ id: fieldId }});
  const { data: cropTypesData }  = useQuery(GET_CROP_TYPES);
  const { data: cropsData, refetch } = useQuery(GET_CROPS, {
    variables   : { fieldId },
    fetchPolicy : 'cache-and-network',
  });




  const [createCrop] = useMutation(CREATE_CROP, { onCompleted: refetch });
  const [updateCrop] = useMutation(UPDATE_CROP, { onCompleted: refetch });
  const [deleteCrop] = useMutation(DELETE_CROP, { onCompleted: refetch });

  /* ───── local state ───── */
  const [cropTypeId, setCropTypeId] = useState('');
  const [boundary,   setBoundary]   = useState<GeoJSON.FeatureCollection|null>(null);
  const [editingId,  setEditingId]  = useState<string|null>(null);
  const [error,      setError]      = useState<string|null>(null);

  /* ───── geometry helpers ───── */
  const ring: number[][]|undefined = useMemo(
    () => boundary?.features?.[0]?.geometry?.coordinates?.[0] as number[][]|undefined,
    [boundary],
  );
  const { areaHa: currentArea } = useFieldGeometry(ring);

  /* … (form / submit logic stays exactly as you have it) … */

  /* ───── helper arrays for the map ───── */
  const fieldBoundary          = fieldData?.field?.boundary ?? null;
    /* ───────── existing crops → grey overlays on the map ───────── */
  const otherCropBoundaries = useMemo(
    () => (cropsData?.crops ?? [])
          .filter((c:any) => c.id !== editingId && c.boundary)
          .map((c:any) => c.boundary),
    [cropsData, editingId],
 );


  /* ───── render ───── */
  return (
    <div className="flex h-full">
      {/* ------- left: form & list (unchanged) ------- */}
      {/* …your existing JSX here… */}

      {/* ------- right: map ------- */}
      <div className="hidden md:block flex-1 h-full">
        <CropBoundaryEditor
          title={
            cropTypeId
              ? cropTypesData?.cropTypes.find((c:any)=>c.id===cropTypeId)?.name ?? ''
              : t[lang].untitledCrop
          }
          boundary={boundary}
          onChange={setBoundary}
          fieldBoundary={fieldBoundary}
          otherCropBoundaries={otherCropBoundaries}  
        />
      </div>
    </div>
  );
}
