// src/components/FieldsList.tsx
'use client';

import React, { useEffect, useState } from 'react';
import dynamic                       from 'next/dynamic';
import { useLocaleRouter } from '@/lib/useLocaleRouter';
import { useSession }                from 'next-auth/react';
import { ApolloError, useMutation, useQuery } from '@apollo/client';
import { useJsApiLoader }            from '@react-google-maps/api';
import { useLanguage }               from '@/components/LanguageContext';
import { t }                         from '@/i18n';

import FieldCard                     from '@/components/lands/FieldCard';
import {
  GET_FARMS,
  GET_USER_FIELDS,
  CREATE_FIELD,
  UPDATE_FIELD,
  DELETE_FIELD,
} from '@/graphql/operations';

/* ------------------------------------------------------------------ */
const BoundaryEditorModal = dynamic(
  () => import('./BoundaryEditorModal'),
  { ssr: false },
);

/* ------------------------------------------------------------------ */
type LatLng = { lat: number; lng: number };
type Field = {
  id: string;
  name: string;
  areaHectares: number;
  location: LatLng;
  boundary: GeoJSON.FeatureCollection | null;
  farm: { id: string; name: string };
};
type FarmOption = { id: string; name: string };

const LOADER_ID  = 'gmaps-shared';
const LIBRARIES: ('drawing' | 'places' | 'geometry')[] = [
  'drawing',
  'places',
  'geometry',
];

/* ================================================================== */
export default function FieldsList() {
const router = useLocaleRouter();
  const { data: session, status } = useSession();
  const { lang }              = useLanguage();
  const userId                = session?.user?.id;          // ✅ no non-null assertion

  /* Google Maps SDK ------------------------------------------------ */
  const { isLoaded: mapsLoaded, loadError: mapsError } = useJsApiLoader({
    id: LOADER_ID,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: LIBRARIES,
  });

  /* Queries -------------------------------------------------------- */
  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery<{ fields: Field[] }>(GET_USER_FIELDS, {
    variables: userId ? { userId } : undefined,
    skip     : status !== 'authenticated' || !userId,
    onError  : (err: ApolloError) => console.error(err),
  });

  const { data: farmsData } = useQuery<{ farms: FarmOption[] }>(GET_FARMS, {
    skip: status !== 'authenticated',
  });

  /* Mutations ------------------------------------------------------ */
  const [createField] = useMutation(CREATE_FIELD, {
    onCompleted: () => refetch(),
    onError    : (e) => alert(e.message),
  });

  const [updateField] = useMutation(UPDATE_FIELD, {
    onCompleted: () => refetch(),
    onError    : (e) => alert(e.message),
  });

  const refetchQueryObj =
    userId ? { query: GET_USER_FIELDS, variables: { userId } }
           : { query: GET_USER_FIELDS };

  const [deleteField] = useMutation(DELETE_FIELD, {
    refetchQueries: [refetchQueryObj],
    onError       : (e) => alert(e.message),
  });

  /* Local state ---------------------------------------------------- */
  const [editingField, setEditingField] =
    useState<Field | null>(null);                       // boundary modal target
  const [boundaryGeo, setBoundaryGeo] =
    useState<GeoJSON.FeatureCollection | null>(null);

  const [editingId, setEditingId]       = useState<string | null>(null);

  const [formMode, setFormMode]         = useState<'create' | null>(null);
  const [newName, setNewName]           = useState('');
  const [newArea, setNewArea]           = useState('');
  const [newFarmId, setNewFarmId]       = useState('');

  /* Auth redirect -------------------------------------------------- */
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/portal/login');
  }, [status, router]);

  /* Early UI states ------------------------------------------------ */
  if (status === 'loading' || loading) return <p>{t[lang].loading}…</p>;
  if (error)                           return <p className="text-red-600">{error.message}</p>;
  if (mapsError) console.error(mapsError);

  /* Helpers -------------------------------------------------------- */
  const deriveLocation = (fc: GeoJSON.FeatureCollection) => {
    const [lng, lat] = fc.features[0].geometry.coordinates[0][0];
    return { latitude: lat, longitude: lng };
  };

  /* ---------------------------------------------------------------- */
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* ── New Land Form ─────────────────────────── */}
      {formMode === 'create' && (
        <div className="border p-4 rounded-md bg-gray-50 space-y-4">
          <h3 className="text-xl font-semibold">{t[lang].newLandLabel}</h3>

          <div className="space-y-2">
            <input
              className="w-full border rounded p-2"
              placeholder={t[lang].landNameLabel}
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            <input
              className="w-full border rounded p-2"
              type="number"
              step="0.01"
              placeholder={t[lang].landAreaLabel}
              value={newArea}
              onChange={e => setNewArea(e.target.value)}
            />
            <select
              className="w-full border rounded p-2"
              value={newFarmId}
              onChange={e => setNewFarmId(e.target.value)}
            >
              <option value="">{t[lang].selectFarmLabel}</option>
              {farmsData?.farms.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>

            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => {
                setBoundaryGeo(null);
                setEditingField({
                  id          : '__new__',
                  name        : newName,
                  areaHectares: parseFloat(newArea) || 0,
                  location    : { lat: 0, lng: 0 },
                  boundary    : null,
                  farm        : { id: newFarmId, name: '' },
                } as unknown as Field);
              }}
            >
              {t[lang].drawLandBoundaryTitle}
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => {
                if (!boundaryGeo) {
                  alert(t[lang].errorNoBoundary);
                  return;
                }
                createField({
                  variables: {
                    farmId      : newFarmId,
                    name        : newName,
                    areaHectares: parseFloat(newArea),
                    location    : deriveLocation(boundaryGeo),
                    boundary    : boundaryGeo,
                  },
                }).then(() => {
                  setFormMode(null);
                  setNewName(''); setNewArea(''); setNewFarmId('');
                  setBoundaryGeo(null);
                });
              }}
            >
              {t[lang].saveChanges}
            </button>

            <button
              className="px-4 py-2 border rounded hover:bg-gray-100"
              onClick={() => setFormMode(null)}
            >
              {t[lang].cancelButtonLabel}
            </button>
          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────── */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t[lang].lands}</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setFormMode('create')}
        >
          {t[lang].newLandLabel}
        </button>
      </div>

      {/* ── List ─────────────────────────── */}
      {(data?.fields ?? []).length === 0 ? (
        <p>{t[lang].noLands}</p>
      ) : (
        data!.fields.map(field => (
          <FieldCard
            key={field.id}
            field={field}
            mapsLoaded={mapsLoaded}
            farms={farmsData?.farms ?? []}
            t={t}
            lang={lang}
            isEditing={editingId === field.id}
            onStartEdit={() => setEditingId(field.id)}
            onCancelEdit={() => setEditingId(null)}
            onView={() => router.push(`/portal/fields/${field.id}`)}
            onUpdate={({ name, area, farmId }) =>
              updateField({
                variables: {
                  id          : field.id,
                  farmId,
                  name,
                  areaHectares: parseFloat(area),
                  location    : field.location,
                  boundary    : field.boundary,
                },
              }).then(() => setEditingId(null))
            }
            onEditLocation={() => {
              setEditingField(field);
              setBoundaryGeo(field.boundary);
            }}
            onDelete={() => deleteField({ variables: { id: field.id } })}
          />
        ))
      )}

      {/* ── BoundaryEditorModal ─────────────────────────── */}
      {editingField && (
        <BoundaryEditorModal
          land={editingField}
          boundary={boundaryGeo}
          onChange={setBoundaryGeo}
          onSave={() => {
            if (!boundaryGeo) {
              alert(t[lang].errorNoBoundary);
              return;
            }

            /* compute fresh area from geometry */
            const ring        = boundaryGeo.features[0].geometry.coordinates[0];
            const latLngPath  = ring.map(([lng, lat]) => new google.maps.LatLng(lat, lng));
            const areaHa      =
              google.maps.geometry.spherical.computeArea(latLngPath) / 10_000;

            if (editingField.id === '__new__') {
              createField({
                variables: {
                  farmId      : newFarmId,
                  name        : newName,
                  areaHectares: areaHa,
                  location    : deriveLocation(boundaryGeo),
                  boundary    : boundaryGeo,
                },
              }).then(() => {
                setEditingField(null);
                setFormMode(null);
                setNewName(''); setNewArea(''); setNewFarmId('');
                setBoundaryGeo(null);
              });
            } else {
              updateField({
                variables: {
                  id          : editingField.id,
                  farmId      : editingField.farm.id,
                  name        : editingField.name,
                  areaHectares: areaHa,
                  location    : deriveLocation(boundaryGeo),
                  boundary    : boundaryGeo,
                },
              }).then(() => setEditingField(null));
            }
          }}
          onClose={() => setEditingField(null)}
        />
      )}
    </div>
  );
}
