// src/components/FieldView.tsx
'use client';

import React, { useRef, useState, Fragment } from 'react';
import {
  useJsApiLoader,
  GoogleMap,
  Polygon,
  DrawingManager,
} from '@react-google-maps/api';
import { useLanguage } from '@/components/LanguageContext';
import { useSession } from 'next-auth/react';
import { useLocaleRouter } from '@/lib/useLocaleRouter';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_CROPS,
  GET_FARMS,
  GET_USER_FIELDS,
  CREATE_FIELD,
  UPDATE_FIELD,
  DELETE_FIELD,
} from '@/graphql/operations';
import { t } from '@/i18n';
import CurrentWeatherCard from './CurrentWeatherCard';
import CropManager from './CropManager';
import type { GoogleMap as GoogleMapInstance } from '@react-google-maps/api';
import CatastoOverlay from '@/components/CatastoOverlay';
import AnalogClock from '@/components/AnalogClock';
import TogglePanel from '@/components/TogglePanel';
import PlainPanel from '@/components/PlainPanel';
import FieldToolbar from '@/components/FieldToolbar';
import ExistingCropPolygons from '@/components/ExistingCropPolygons';




/* ────────────────────────────────────────────────────────────────────────────
   Types & constants
   ──────────────────────────────────────────────────────────────────────────── */

export type Field = {
  id: string;
  name: string;
  areaHectares: number;
  location: { latitude: number; longitude: number };
  boundary: GeoJSON.FeatureCollection | null;
  farm: { id: string; name: string };
};

const LOADER_ID = 'gmaps-shared';
const LIBRARIES: ('drawing' | 'places' | 'geometry')[] = [
  'drawing',
  'places',
  'geometry',
];

/* ────────────────────────────────────────────────────────────────────────────
   Component
   ──────────────────────────────────────────────────────────────────────────── */
export default function FieldView({ field }: { field: Field }) {
  const { lang } = useLanguage();
  const { data: session } = useSession();
  const router = useLocaleRouter();

  const mapRef = useRef<GoogleMapInstance | null>(null);
  const [gmap, setGmap] = useState<GoogleMapInstance | null>(null);

  /* ── STATE ─────────────────────────────────────────────────────────────── */
  const [drawingMode, setDrawingMode] = useState(false);
  const [currentCropBoundary, setCurrentCropBoundary] =
    useState<GeoJSON.FeatureCollection | null>(null);
  const [currentCropArea, setCurrentCropArea] = useState<number | null>(null);

  // panels & cadastre toggle
  const [showFieldPanel, setShowFieldPanel] = useState(false);
  const [showWeatherPanel, setShowWeatherPanel] = useState(true);
  const [showCropsPanel, setShowCropsPanel] = useState(false);
  const [showCadastre, setShowCadastre] = useState(false);

  // WMS layers
  const [wmsLayers] = useState<{ name: string; title: string }[]>(
    []
  );
  const [selectedLayers, setSelectedLayers] = useState<string[]>([
    'CP.CadastralParcel',
    'fabbricati',
    'vestizioni',
  ]);

  /* ─────────────────────────────────────────────────────────────────────────
     GraphQL data (hooks are always called; `skip` guards control execution)
     ───────────────────────────────────────────────────────────────────────── */
  const fieldId = field?.id;
  const fieldLocation =
    field?.location ?? /* fallback to avoid undefined access */ {
      latitude: 41.8719,
      longitude: 12.5674,
    };

  const { data: cropsData } = useQuery(GET_CROPS, {
    variables: fieldId ? { fieldId } : undefined,
    skip: !fieldId,
    fetchPolicy: 'network-only',
  });

  const { data: fieldsData } = useQuery(GET_USER_FIELDS, {
    variables: session?.user?.id ? { userId: session.user.id } : undefined,
    skip: !session?.user?.id,
  });

  const { data: farmsData } = useQuery(GET_FARMS, {
    skip: !session?.user?.id,
  });

  const [_createField] = useMutation(CREATE_FIELD); // intentionally unused for now
  const [updateField] = useMutation(UPDATE_FIELD);
  const [deleteField] = useMutation(DELETE_FIELD);

  /* ─────────────────────────────────────────────────────────────────────────
     Google Maps loader
     ───────────────────────────────────────────────────────────────────────── */
  const { isLoaded, loadError } = useJsApiLoader({
    id: LOADER_ID,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: LIBRARIES,
  });

  /* Geometry helpers ------------------------------------------------------- */
  const path =
    field?.boundary?.features[0]?.geometry?.coordinates[0]?.map(
      ([lng, lat]) => ({ lat, lng })
    ) ?? [];

  const center = useRef<{ lat: number; lng: number }>({
    lat: fieldLocation.latitude,
    lng: fieldLocation.longitude,
  });

  const onMapLoad = (m: GoogleMapInstance) => {
    mapRef.current = m;
    setGmap(m);
    if (path.length) {
      const bounds = new window.google.maps.LatLngBounds();
      path.forEach((pt) => bounds.extend(pt));
      m.fitBounds(bounds);
    }
  };

  /* ─────────────────────────────────────────────────────────────────────────
     Field-editing state & helpers
     ───────────────────────────────────────────────────────────────────────── */
  const [editingField, setEditingField] = useState(false);
  const [editedName, setEditedName] = useState(field?.name ?? '');
  const [editedArea, setEditedArea] = useState(
    field?.areaHectares.toString() ?? ''
  );
  const [selectedFarmId, setSelectedFarmId] = useState(field?.farm.id ?? '');

  const getCentroid = (coords: { lat: number; lng: number }[]) => {
    let lat = 0,
      lng = 0;
    coords.forEach((pt) => {
      lat += pt.lat;
      lng += pt.lng;
    });
    return { lat: lat / coords.length, lng: lng / coords.length };
  };

  const handleDrawCropBoundary = () => setDrawingMode(true);
  const handleClearCropBoundary = () => {
    setCurrentCropBoundary(null);
    setCurrentCropArea(null);
  };

  const handlePolygonComplete = (polygon: google.maps.Polygon) => {
    const pts = polygon.getPath().getArray().map((p) => ({
      lat: p.lat(),
      lng: p.lng(),
    }));
    const areaHectares =
      google.maps.geometry.spherical.computeArea(polygon.getPath()) / 10000;
    setCurrentCropArea(areaHectares);
    setCurrentCropBoundary({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [pts.map((p) => [p.lng, p.lat])],
          },
        },
      ],
    });
    setDrawingMode(false);
  };

  const handleEditSubmit = async () => {
    if (!field) return;
    await updateField({
      variables: {
        id: field.id,
        name: editedName,
        farmId: selectedFarmId,
        areaHectares: parseFloat(editedArea),
        location: field.location,
        boundary: field.boundary,
      },
    });
    setEditingField(false);
  };

  const handleDelete = async () => {
    if (field && confirm(t[lang].confirmDeleteField)) {
      await deleteField({ variables: { id: field.id } });
      router.push('/portal');
    }
  };




// ─────────────────────────────────────────────────────────────────────────
//  Render
// ─────────────────────────────────────────────────────────────────────────
if (!field)
  return (
    <div className="flex h-screen w-full items-center justify-center">
      Loading field …
    </div>
  );

if (loadError)
  return <p className="text-red-600 p-6">{t[lang].loadingError}</p>;

return (
  <div className="relative h-screen w-full overflow-hidden !mt-0 -mt-px">
    {/* ─────────────────────── Control buttons (top-right) ─────────────── */}
    <div
      className="absolute right-16 z-20 flex"
      style={{ top: 'var(--header-gap-lg)' }}
    >
      
    <FieldToolbar
      showFieldPanel={showFieldPanel}
      showCadastre={showCadastre}
      showWeatherPanel={showWeatherPanel}
      showCropsPanel={showCropsPanel}
      onToggleFieldPanel={() => setShowFieldPanel(v => !v)}
      onToggleCadastre={() => setShowCadastre(v => !v)}
      onToggleWeatherPanel={() => setShowWeatherPanel(v => !v)}
      onToggleCropsPanel={() => setShowCropsPanel(v => !v)}
      labels={{
        field: t[lang].currentLand,
        weather: t[lang].currentWeatherLabel,
        crops: t[lang].cropsPanelTitle ?? 'Crops',
      }}
    />

      {/* ── Crops panel ────────────────────────────────────────────────── */}
      {showCropsPanel && (
        <div className="max-w-sm w-full">
          <TogglePanel title={t[lang].cropsPanelTitle ?? 'Crops'}>
            <div className="max-h-[50vh] overflow-y-auto">
              <CropManager
                fieldId={field.id}
                fieldArea={field.areaHectares}
                onDrawBoundary={handleDrawCropBoundary}
                onClearBoundary={handleClearCropBoundary}
                currentBoundary={currentCropBoundary}
                currentArea={currentCropArea}
              />
            </div>
          </TogglePanel>
        </div>
      )}
    </div>

    {/* ───────────────────── Layer checkbox panel ─────────────────────── */}
    {showCadastre && (
      <PlainPanel
        className="absolute right-4 z-30 max-h-[60vh] overflow-y-auto"
        style={{
          top: 'calc(var(--header-gap-lg) + var(--toolbar-height) + .5rem)',
        }}
      >
        <h3 className="text-white font-bold mb-2">Catasto – Layer</h3>

        {wmsLayers.map(({ name, title }) => (
          <label
            key={name}
            className="flex items-center space-x-2 mb-1 cursor-pointer"
          >
            <input
              type="checkbox"
              className="accent-green-500"
              checked={selectedLayers.includes(name)}
              onChange={(e) =>
                setSelectedLayers((prev) =>
                  e.target.checked
                    ? [...prev, name]
                    : prev.filter((l) => l !== name)
                )
              }
            />
            <span className="text-white text-sm">
              {title}{' '}
              <code className="text-gray-400 text-xs">{name}</code>
            </span>
          </label>
        ))}
      </PlainPanel>
    )}


      {/* ─────────────────────── Map ─────────────────────────────────────── */}
      {isLoaded && (
        <GoogleMap
          onLoad={onMapLoad}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center.current}
          zoom={13}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            zoomControlOptions: {
              position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
            },
            mapTypeId: 'hybrid',
          }}
        >
          {/* cadastre layer */}
          <CatastoOverlay
              map={gmap}
              visible={showCadastre}
              layers={selectedLayers}
            />

          {/* Land boundary */}
          {path.length > 0 && (
            <Polygon
              path={path}
              options={{
                fillColor: '#1976D2',
                fillOpacity: 0.1,
                strokeColor: '#1976D2',
                strokeOpacity: 1,
                strokeWeight: 2,
              }}
            />
          )}

          {/* Drawing crop boundary */}
          <DrawingManager
            drawingMode={
              drawingMode ? google.maps.drawing.OverlayType.POLYGON : null
            }
            onPolygonComplete={handlePolygonComplete}
            options={{
              drawingControl: false,
              polygonOptions: {
                fillColor: '#34D399',
                fillOpacity: 0.2,
                strokeColor: '#34D399',
                strokeOpacity: 1,
                strokeWeight: 2,
              },
            }}
          />

          {/* Current drawn boundary */}
          {currentCropBoundary?.features?.[0]?.geometry?.coordinates[0] && (
            <Polygon
              path={currentCropBoundary.features[0].geometry.coordinates[0].map(
                ([lng, lat]) => ({ lat, lng })
              )}
              options={{
                fillColor: '#34D399',
                fillOpacity: 0.4,
                strokeColor: '#34D399',
                strokeOpacity: 1,
                strokeWeight: 2,
              }}
            />
          )}

          <ExistingCropPolygons
            crops={cropsData?.crops ?? []}
            getCentroid={getCentroid}
            t={t}
            lang={lang}
          />

        </GoogleMap>
      )}

      {/* ─────────────────────── Left-side panels ────────────────────────── */}
        <div
    className="absolute left-4 z-20 …"
    style={{ top: 'var(--header-gap-lg)' }}
  >
        {/* Land Selector */}
        <TogglePanel title={t[lang].yourLands}>
          {fieldsData?.fields.length > 0 && (
            <select
              onChange={(e) => router.push(`/portal/fields/${e.target.value}`)}
              value={field.id}
              className="w-full bg-black/50 text-white border-white border px-2 py-1 rounded mb-2"
            >
              <option value="">{t[lang].selectLand}</option>
              {fieldsData.fields.map((f: Field) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          )}
        </TogglePanel>

        {/* Current Land & Edit */}
        {showFieldPanel && (
          <TogglePanel title={t[lang].currentLand}>
            {editingField ? (
              <div className="space-y-2">
                <input
                  className="w-full bg-black/50 border border-white text-white p-1 rounded"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                />
                <input
                  type="number"
                  className="w-full bg-black/50 border border-white text-white p-1 rounded"
                  value={editedArea}
                  onChange={(e) => setEditedArea(e.target.value)}
                />
                <select
                  className="w-full bg-black/50 border border-white text-white p-1 rounded"
                  value={selectedFarmId}
                  onChange={(e) => setSelectedFarmId(e.target.value)}
                >
                  <option value="">{t[lang].selectFarmLabel}</option>
                  {farmsData?.farms.map((f: unknown) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <div className="flex space-x-2">
                  <button
                    onClick={handleEditSubmit}
                    className="bg-green-600 text-white px-2 py-1 rounded"
                  >
                    {t[lang].saveChanges}
                  </button>
                  <button
                    onClick={() => setEditingField(false)}
                    className="bg-gray-500 text-white px-2 py-1 rounded"
                  >
                    {t[lang].cancelButtonLabel}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    {t[lang].deleteLand}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p>
                  <strong>{t[lang].landNameLabel}:</strong> {field.name}
                </p>
                <p>
                  <strong>{t[lang].landAreaLabel}:</strong>{' '}
                  {field.areaHectares.toFixed(2)} ha
                </p>
                <p>
                  <strong>{t[lang].farmLabel}:</strong> {field.farm.name}
                </p>
                <button
                  onClick={() => setEditingField(true)}
                  className="text-sm text-white/70 hover:text-white underline mt-2"
                >
                  {t[lang].editDetails}
                </button>
              </>
            )}
          </TogglePanel>
        )}

        {/* Weather */}
        {showWeatherPanel && (
          <TogglePanel title={t[lang].currentWeatherLabel}>
            <div className="bg-black/50 p-3 rounded text-white flex items-center space-x-4">
              <AnalogClock
                lat={field.location.latitude}
                lng={field.location.longitude}
              />
              <CurrentWeatherCard
                lat={field.location.latitude}
                lon={field.location.longitude}
              />
            </div>
          </TogglePanel>
        )}
      </div>
    </div>
  );
}