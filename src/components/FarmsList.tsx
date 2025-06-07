'use client';

import React, { useEffect, useState } from 'react';
import dynamic                        from 'next/dynamic';
import { useLocaleRouter } from '@/lib/useLocaleRouter';
import { useSession }                 from 'next-auth/react';
import { useQuery, useMutation, ApolloError } from '@apollo/client';
import {
  GET_FARMS,
  DELETE_FARM,
  CREATE_FARM,
  UPDATE_FARM,
} from '@/graphql/operations';
import { useLanguage } from '@/components/LanguageContext';
import { t }           from '@/i18n';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
});

type Farm = {
  id: string;
  name: string;
  location: { latitude: number; longitude: number };
  fields: { areaHectares: number }[];
};

// fallback centre (Italy)
const DEFAULT_CENTER = { lat: 41.8719, lng: 12.5674 };

/* ──────────────────────────────────────────────────────────────── */
/*  Map picker modal                                                */
/* ──────────────────────────────────────────────────────────────── */
function MapModal({
  open,
  initialPos,
  onPick,
  onClose,
}: {
  open: boolean;
  initialPos?: { lat: number; lng: number };
  onPick: (loc: { lat: number; lng: number }) => void;
  onClose: () => void;
}) {
  const { lang } = useLanguage();

  const [lat, setLat] = useState(initialPos?.lat ?? DEFAULT_CENTER.lat);
  const [lng, setLng] = useState(initialPos?.lng ?? DEFAULT_CENTER.lng);

  /* reset marker every time the modal re-opens */
  useEffect(() => {
    setLat(initialPos?.lat ?? DEFAULT_CENTER.lat);
    setLng(initialPos?.lng ?? DEFAULT_CENTER.lng);
  }, [initialPos]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-11/12 md:w-2/3 lg:w-1/2 bg-white rounded-lg p-4">
        <h2 className="text-xl font-bold mb-2">{t[lang].pickOnMap}</h2>

        <div className="h-80 w-full border rounded overflow-hidden mb-4">
          <LocationPicker
            position={initialPos ? { lat, lng } : undefined}
            onChange={({ lat: newLat, lng: newLng }) => {
              setLat(newLat);
              setLng(newLng);
            }}
          />
        </div>

        {/* lat/lng numeric inputs */}
        <div className="grid gap-4 mb-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t[lang].latitudeLabel}
            </label>
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(parseFloat(e.target.value))}
              className="mt-1 w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t[lang].longitudeLabel}
            </label>
            <input
              type="number"
              step="any"
              value={lng}
              onChange={(e) => setLng(parseFloat(e.target.value))}
              className="mt-1 w-full border rounded p-2"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            {t[lang].cancelButtonLabel}
          </button>
          <button
            onClick={() => {
              onPick({ lat, lng });
              onClose();
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {t[lang].confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/*  Farm create / edit form                                        */
/* ──────────────────────────────────────────────────────────────── */
function FarmForm({
  initial,
  onDone,
  onCancel,
}: {
  initial?: Farm;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { lang } = useLanguage();
  const { data: session } = useSession();
  const createdById = session?.user?.id; // ✅ no non-null assertion

  /* local state */
  const [name, setName] = useState(initial?.name ?? '');
  const [lat,  setLat]  = useState(
    initial?.location.latitude.toString()  ?? ''
  );
  const [lng,  setLng]  = useState(
    initial?.location.longitude.toString() ?? ''
  );
  const [showMap, setShowMap] = useState(false);

  const isEdit = Boolean(initial);

  /* if “initial” changes reset the local state */
  useEffect(() => {
    if (!initial) return;
    setName(initial.name);
    setLat(initial.location.latitude.toString());
    setLng(initial.location.longitude.toString());
  }, [initial]);

  /* mutations */
  const [createFarm, { loading: creating }] = useMutation(CREATE_FARM, {
    refetchQueries: ['GetFarms'],
    awaitRefetchQueries: true,
  });

  const [updateFarm, { loading: updating }] = useMutation(UPDATE_FARM, {
    refetchQueries: ['GetFarms'],
    awaitRefetchQueries: true,
  });

  /* submit handler */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const latitude  = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) {
      alert(t[lang].invalidLatLng);
      return;
    }

    /* area to satisfy backend requirement ----------------------- */
    const areaHectares = initial
      ? initial.fields.reduce((s, fld) => s + (fld.areaHectares || 0), 0)
      : 0;

    try {
      if (isEdit && initial) {
        await updateFarm({
          variables: {
            id: initial.id,
            name,
            location: { latitude, longitude },
            areaHectares,
          },
        });
      } else {
        if (!createdById) {
          alert(t[lang].errorLoadingFarms); // fallback message
          return;
        }
        await createFarm({
          variables: {
            name,
            createdById,
            location: { latitude, longitude },
            areaHectares: 0,
          },
        });
      }
      onDone();
    } catch (err: unknown) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mb-6 space-y-4 rounded-md border bg-gray-50 p-4"
      >
        <h3 className="text-xl font-semibold">
          {isEdit ? t[lang].editFarmLabel : t[lang].newFarmLabel}
        </h3>

        {/* name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t[lang].farmNameLabel}
          </label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        {/* location pick / display */}
        <div className="flex items-center space-x-2">
          <label className="block text-sm font-medium text-gray-700">
            {t[lang].locationLabel}
          </label>
          <span>
            {lat && lng
              ? `${parseFloat(lat).toFixed(5)}, ${parseFloat(lng).toFixed(5)}`
              : t[lang].noLocationSelected}
          </span>
          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="ml-2 rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-700"
          >
            {t[lang].pickOnMap}
          </button>
        </div>

        {/* buttons */}
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={creating || updating}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isEdit
              ? updating
                ? t[lang].updatingLabel
                : t[lang].updateFarm
              : creating
              ? t[lang].creatingLabel
              : t[lang].createFarm}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded border px-4 py-2 hover:bg-gray-100"
          >
            {t[lang].cancelButtonLabel}
          </button>
        </div>
      </form>

      <MapModal
        open={showMap}
        initialPos={initial ? { lat: +lat, lng: +lng } : undefined}
        onPick={({ lat: la, lng: lo }) => {
          setLat(la.toString());
          setLng(lo.toString());
        }}
        onClose={() => setShowMap(false)}
      />
    </>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/*  Farms list page                                                */
/* ──────────────────────────────────────────────────────────────── */
export default function FarmsList() {
  const router = useLocaleRouter();
  const { status } = useSession();
  const { lang }   = useLanguage();

  const { data, loading, error } = useQuery<{ farms: Farm[] }>(GET_FARMS, {
    fetchPolicy: 'cache-and-network',
    onError(err: ApolloError) {
      console.error(err.networkError?.result || err);
    },
  });

  const [deleteFarm] = useMutation(DELETE_FARM, {
    refetchQueries: ['GetFarms'],
    awaitRefetchQueries: true,
  });

  const [formMode,    setFormMode]    = useState<'create' | 'edit' | null>(null);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);

  /* redirect if not authenticated */
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/portal/login');
  }, [status, router]);

  if (status === 'loading') return <p>{t[lang].checkingAuth}</p>;
  if (loading)              return <p>{t[lang].loading}</p>;
  if (error)
    return (
      <p className="text-red-600">
        {t[lang].errorLoadingFarms}:{' '}
        {error.graphQLErrors.map((e) => e.message).join('; ')}
      </p>
    );

  const farms = data?.farms ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* create form */}
      {formMode === 'create' && (
        <FarmForm
          key="form-create"
          onDone={() => setFormMode(null)}
          onCancel={() => setFormMode(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t[lang].farms}</h1>
        <button
          onClick={() => {
            setEditingFarm(null);
            setFormMode('create');
          }}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          {t[lang].newFarm}
        </button>
      </div>

      {farms.length === 0 ? (
        <p>{t[lang].noFarms}</p>
      ) : (
        farms.map((farm) => {
          const totalArea = farm.fields.reduce(
            (sum, fld) => sum + (fld.areaHectares || 0),
            0
          );

          /* inline-edit card ------------------------------------------------ */
          return (
            <div key={farm.id} className="space-y-3 rounded border p-4 shadow">
              {formMode === 'edit' && editingFarm?.id === farm.id ? (
                <FarmForm
                  key={`form-edit-${farm.id}`}
                  initial={editingFarm}
                  onDone={() => setFormMode(null)}
                  onCancel={() => setFormMode(null)}
                />
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{farm.name}</h2>
                    <p className="text-gray-600">
                      {t[lang].latLng}:{' '}
                      {farm.location.latitude.toFixed(5)}, {farm.location.longitude.toFixed(5)}
                    </p>
                    <p className="mt-2 text-gray-600">
                      {t[lang].totalArea}:{' '}
                      <strong>{totalArea.toFixed(2)} ha</strong>
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setFormMode('edit');
                        setEditingFarm(farm);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      {t[lang].editLocation}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(t[lang].confirmDeleteFarm)) {
                          deleteFarm({ variables: { id: farm.id } });
                        }
                      }}
                      className="text-red-600 hover:underline"
                    >
                      {t[lang].deleteFarm}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
