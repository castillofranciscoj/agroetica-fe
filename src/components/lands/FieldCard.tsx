'use client';

import React, { memo, useMemo } from 'react';
import MapPreview              from '@/components/lands/MapPreview';
import ActionButtons           from '@/components/lands/ActionButtons';
import InlineEditForm, { FarmOption } from '@/components/lands/InlineEditForm';

type LatLng = { lat: number; lng: number };
export type Field = {
  id: string;
  name: string;
  areaHectares: number;
  location: LatLng;
  boundary: GeoJSON.FeatureCollection | null;
  farm: { id: string; name: string };
};

interface FieldCardProps {
  field: Field;
  mapsLoaded: boolean;
  farms: FarmOption[];

  /* i18n */
  t: Record<string, unknown>;
  lang: string;

  /* parent-controlled state */
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;

  /* actions provided by parent */
  onView: () => void;
  onUpdate: (vals: { name: string; area: string; farmId: string }) => void;
  onEditLocation: () => void;
  onDelete: () => void;
}

/* helpers ---------------------------------------------------------------- */
const pathFromBoundary = (fc: GeoJSON.FeatureCollection | null): LatLng[] =>
  fc?.features?.[0]?.geometry?.coordinates?.[0]?.map(
    ([lng, lat]) => ({ lat, lng }),
  ) ?? [];

/* ------------------------------------------------------------------------ */
function FieldCardBase({
  field,
  mapsLoaded,
  farms,
  t,
  lang,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onView,
  onUpdate,
  onEditLocation,
  onDelete,
}: FieldCardProps) {
  /* compute once per render */
  const { previewPath, previewCenter } = useMemo(() => {
    const previewPath = pathFromBoundary(field.boundary);
    const previewCenter =
      previewPath[0] ??
      (Number.isFinite(field.location.latitude) &&
      Number.isFinite(field.location.longitude)
        ? { lat: field.location.latitude, lng: field.location.longitude }
        : { lat: 0, lng: 0 });
    return { previewPath, previewCenter };
  }, [field]);

  return (
    <div className="border p-4 rounded shadow space-y-4">
      <div className="flex space-x-4">
        {/* map */}
        <div className="h-32 w-48 rounded overflow-hidden border">
          <MapPreview
            mapsLoaded={mapsLoaded}
            path={previewPath}
            center={previewCenter}
          />
        </div>

        {/* details / form */}
        <div className="flex-1 space-y-2">
          {isEditing ? (
            <InlineEditForm
              initialName={field.name}
              initialArea={field.areaHectares.toString()}
              initialFarmId={field.farm.id}
              farms={farms}
              labels={{
                nameLabel: t[lang].landNameLabel,
                areaLabel: t[lang].landAreaLabel,
                selectFarmLabel: t[lang].selectFarmLabel,
                saveChanges: t[lang].saveChanges,
                cancel: t[lang].cancelButtonLabel,
              }}
              onSave={onUpdate}
              onCancel={onCancelEdit}
            />
          ) : (
            <>
              <h2 className="text-xl font-semibold">{field.name}</h2>
              <p className="text-gray-600">
                <strong>{t[lang].farmLabel}:</strong> {field.farm.name}
              </p>
              <p className="text-gray-600">
                <strong>{t[lang].landAreaLabel}:</strong>{' '}
                {field.areaHectares.toFixed(2)} ha
              </p>
            </>
          )}
        </div>
      </div>

      {!isEditing && (
        <ActionButtons
          onView={onView}
          onEditDetails={onStartEdit}
          onEditLocation={onEditLocation}
          onDelete={onDelete}
          labels={{
            view: t[lang].viewLandLabel,
            editDetails: t[lang].editDetails,
            editLocation: t[lang].editLocation,
            delete: t[lang].deleteLand,
            confirmDelete: t[lang].confirmDeleteLand,
          }}
        />
      )}
    </div>
  );
}

export default memo(FieldCardBase, (p, n) => p.field === n.field && p.isEditing === n.isEditing);
