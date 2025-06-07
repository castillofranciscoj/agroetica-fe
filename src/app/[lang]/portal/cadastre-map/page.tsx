// src/app/portal/cadastre-map/page.tsx
'use client';

export const dynamic = 'force-dynamic';   // ⬅️  add this as the FIRST line


import React, { useState, useEffect, useRef } from 'react';
import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';

const LIBRARIES = ['drawing', 'places', 'geometry'] as const;

// Change these as you like
const DEFAULT_CENTER = { lat: 42.0, lng: 12.5 };
const DEFAULT_ZOOM = 13;

export default function CadastreMapPage() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const overlayRef = useRef<google.maps.ImageMapType | null>(null);
  const [showCadastre, setShowCadastre] = useState(true);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: LIBRARIES,
  });

  // Convert Google tile coords → lon/lat
  const tile2lon = (x: number, z: number) => (x / 2 ** z) * 360 - 180;
  const tile2lat = (y: number, z: number) => {
    const n = Math.PI - (2 * Math.PI * y) / 2 ** z;
    return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  };

  // Whenever map instance is set or showCadastre toggles, add/remove the WMS overlay
  useEffect(() => {
    if (!map) return;
    const om = map.overlayMapTypes;

    if (showCadastre) {
      if (!overlayRef.current) {
        const wmsLayer = new google.maps.ImageMapType({
          getTileUrl: (coord, zoom) => {
            const tileSize = 256;
            const west = tile2lon(coord.x, zoom);
            const east = tile2lon(coord.x + 1, zoom);
            const north = tile2lat(coord.y, zoom);
            const south = tile2lat(coord.y + 1, zoom);
            // WMS 1.1.1 expects BBOX=minx,miny,maxx,maxy (lon,lat)
            const bbox = `${west},${south},${east},${north}`;
            const params = new URLSearchParams({
              SERVICE: 'WMS',
              VERSION: '1.1.1',
              REQUEST: 'GetMap',
              LAYERS: 'CP.CadastralParcel,fabbricati,CP.CadastralZoning',
              STYLES: '',
              FORMAT: 'image/png',
              TRANSPARENT: 'true',
              SRS: 'EPSG:4326',
              BBOX: bbox,
              WIDTH: `${tileSize}`,
              HEIGHT: `${tileSize}`,
            });
            return `/api/cartografia/wms?${params.toString()}`;
          },
          tileSize: new google.maps.Size(256, 256),
          opacity: 0.6, // semi‐transparent so underlying map shows through
        });
        om.insertAt(0, wmsLayer);
        overlayRef.current = wmsLayer;
      }
    } else {
      if (overlayRef.current) {
        const idx = om.getArray().indexOf(overlayRef.current);
        if (idx > -1) om.removeAt(idx);
        overlayRef.current = null;
      }
    }
  }, [map, showCadastre]);

  if (loadError) {
    return <div className="p-4 text-red-600">Error loading map</div>;
  }
  if (!isLoaded) {
    return <div className="p-4">Loading map…</div>;
  }

  return (
    <div className="relative w-screen h-screen p-8 box-border bg-gray-100">
      {/* Toggle button */}
      <button
        onClick={() => setShowCadastre((v) => !v)}
        className="absolute top-4 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg"
      >
        {showCadastre ? 'Hide Cadastre' : 'Show Cadastre'}
      </button>

      {/* Google Map Container */}
      <div className="w-full h-full mt-2 shadow-inner rounded-lg overflow-hidden">
        <GoogleMap
          onLoad={(m) => setMap(m)}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeId: 'hybrid',
          }}
        />
      </div>
    </div>
  );
}
