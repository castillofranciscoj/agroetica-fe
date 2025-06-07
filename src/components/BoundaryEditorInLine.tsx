// src/components/BoundaryEditorInline.tsx
'use client';

import React, {
  useMemo, useState, useEffect, useRef,
} from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  DrawingManager,
  Polygon,
  Autocomplete,
} from '@react-google-maps/api';
import { Layers } from 'lucide-react';

import {
  GMAPS_LOADER_ID,
  GMAPS_LIBRARIES,
} from '@/components/LocationPicker';

type LatLng = { lat: number; lng: number };

interface Props {
  title: string;
  boundary: GeoJSON.FeatureCollection | null;
  farmBoundary?: GeoJSON.FeatureCollection | null;
  onChange: (fc: GeoJSON.FeatureCollection | null) => void;
}

const ITALY_CENTER: LatLng = { lat: 41.8719, lng: 12.5674 };

export default function BoundaryEditorInline({
  title,
  boundary,
  farmBoundary,
  onChange,
}: Props) {
  /* ─────────────────────── maps loader (shared id/libs) ────────────────────── */
  const { isLoaded } = useJsApiLoader({
    id: GMAPS_LOADER_ID,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: GMAPS_LIBRARIES,              // <-- same order everywhere
  });

  /* ─────────────────────── helpers ─────────────────────── */
  const geoRingToPath = (ring?: number[][]): LatLng[] =>
    ring ? ring.map(([lng, lat]) => ({ lat, lng })) : [];

  /* ─────────────────────── current field path ─────────────────────── */
  const initialPath = useMemo(() => {
    const ring = boundary?.features?.[0]?.geometry?.coordinates?.[0] as number[][] | undefined;
    return geoRingToPath(ring);
  }, [boundary]);
  const [path, setPath] = useState<LatLng[]>(initialPath);

  /* keep local state in sync with prop */
  useEffect(() => { setPath(initialPath); }, [initialPath]);

  /* ─────────────────────── farm overlay ─────────────────────── */
  const farmPath = useMemo(() => {
    const ring = farmBoundary?.features?.[0]?.geometry?.coordinates?.[0] as number[][] | undefined;
    return geoRingToPath(ring);
  }, [farmBoundary]);
  const [showFarm, setShowFarm] = useState(true);

  /* ─────────────────────── map ref (to pan/fit) ─────────────────────── */
  const mapRef = useRef<google.maps.Map | null>(null);
  const onLoadMap = (m: google.maps.Map) => (mapRef.current = m);

  /* when farm changes & user hasn’t drawn yet → fit to farm */
  useEffect(() => {
    if (!mapRef.current || farmPath.length === 0 || path.length > 0) return;
    const bounds = new google.maps.LatLngBounds();
    farmPath.forEach(p => bounds.extend(p));
    mapRef.current.fitBounds(bounds);
  }, [farmPath, path]);

  /* ─────────────────────── drawing -> FeatureCollection ───────────────────── */
  const toFC = (pts: LatLng[]): GeoJSON.FeatureCollection => ({
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {},
      geometry: { type: 'Polygon', coordinates: [pts.map(p => [p.lng, p.lat])], },
    }],
  });

  const handleComplete = (poly: google.maps.Polygon) => {
    const pts = poly.getPath().getArray().map(p => ({ lat: p.lat(), lng: p.lng() }));
    setPath(pts);
    onChange(toFC(pts));
    poly.setMap(null);
  };

  const polyRef = useRef<google.maps.Polygon | null>(null);
  const syncEdit = () => {
    if (!polyRef.current) return;
    const pts = polyRef.current.getPath().getArray().map(p => ({ lat: p.lat(), lng: p.lng() }));
    setPath(pts);
    onChange(toFC(pts));
  };

  /* ─────────────────────── centre / zoom ───────────────────── */
  const center = path[0] || farmPath[0] || ITALY_CENTER;
  const zoom   = (path.length || farmPath.length) ? 15 : 6;

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-full text-gray-400">Loading…</div>;
  }

  return (
    <div className="w-full h-full relative">
      {/* global css: BIGGER drawing buttons */}
      <style jsx global>{`
        .gm-style .gm-drawing-icon{width:56px!important;height:56px!important}
        .gm-style .gm-drawing-icon img{width:100%!important;height:100%!important}
      `}</style>

      {/* title */}
      <div className="absolute top-2 left-2 z-20 bg-white/90 rounded px-2 py-1 text-xs shadow">
        {title}
      </div>

      {/* farm overlay toggle */}
      {farmPath.length > 0 && (
        <button
          title="Toggle farm boundary" onClick={() => setShowFarm(v => !v)}
          className="absolute top-2 right-2 z-20 bg-white/90 rounded p-2 shadow hover:bg-gray-100"
        >
          <Layers className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {/* search */}
      <Autocomplete
        onPlaceChanged={() => {
          const place = (window as any).google?.maps?.places?.Autocomplete
            ? (document.querySelector('#boundary-search') as HTMLInputElement)
            : null;
          const auto = place && (place as any).autocomplete;
          const loc  = auto?.getPlace()?.geometry?.location;
          if (loc && mapRef.current) {
            mapRef.current.panTo(loc);
            mapRef.current.setZoom(15);
          }
        }}
      >
        <input
          id="boundary-search"
          type="text"
          placeholder="Search by name…"
          className="absolute top-2 left-1/2 -translate-x-1/2 z-20 w-80 px-2 py-1 border rounded shadow bg-white/90"
        />
      </Autocomplete>

      <GoogleMap
        onLoad={onLoadMap}
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={zoom}
        mapTypeId="hybrid"          /* ← satellite+labels default */
        options={{
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,   /* hide “Map / Hybrid” toggle */
        }}
      >
        {/* farm outline */}
        {showFarm && farmPath.length > 0 && (
          <Polygon
            path={farmPath}
            options={{
              strokeColor: '#2563eb',
              strokeWeight: 2,
              fillOpacity: 0,
            }}
          />
        )}

        {/* field polygon */}
        {path.length > 0 && (
          <Polygon
            path={path}
            onLoad={p => (polyRef.current = p)}
            onMouseUp={syncEdit}
            options={{
              fillColor: '#38a169',
              fillOpacity: 0.18,
              strokeColor: '#38a169',
              strokeWeight: 2,
              editable: true,
            }}
          />
        )}

        {/* drawing tools */}
        <DrawingManager
          onPolygonComplete={handleComplete}
          options={{
            drawingControl: true,
            drawingControlOptions: {
              position: google.maps.ControlPosition.TOP_RIGHT,
              drawingModes: ['polygon'],
            },
            polygonOptions: {
              fillColor: '#38a169',
              fillOpacity: 0.18,
              strokeColor: '#38a169',
              strokeWeight: 2,
              editable: true,
            },
          }}
        />
      </GoogleMap>
    </div>
  );
}
