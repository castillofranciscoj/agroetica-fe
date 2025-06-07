// src/components/BoundaryEditorModal.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Polygon,
  DrawingManager,
} from '@react-google-maps/api';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';

type Land = {
  id: string;
  name: string;
};

interface Props {
  land: Land;
  boundary: GeoJSON.FeatureCollection | null;
  onChange: (b: GeoJSON.FeatureCollection | null) => void;
  onSave: () => void;
  onClose: () => void;
}

// Italy fallback center
const ITALY_CENTER: google.maps.LatLngLiteral = {
  lat: 41.8719,
  lng: 12.5674,
};

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Shared loader options
const LOADER_ID = 'gmaps-shared';
const LIBRARIES: (
  | 'drawing'
  | 'geometry'
  | 'places'
  | 'visualization'
)[] = ['drawing', 'places', 'geometry'];

export default function BoundaryEditorModal({
  land,
  boundary,
  onChange,
  onSave,
  onClose,
}: Props) {
  const { lang } = useLanguage();

  const { isLoaded, loadError } = useJsApiLoader({
    id: LOADER_ID,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: LIBRARIES,
  });

  // Convert incoming GeoJSON to path
  const initialPath = useMemo<google.maps.LatLngLiteral[]>(() => {
    if (!boundary) return [];
    return boundary.features[0].geometry.coordinates[0].map(
      ([lng, lat]) => ({ lat, lng })
    );
  }, [boundary]);

  const [path, setPath] = useState<google.maps.LatLngLiteral[]>(initialPath);

  // keep in sync if prop changes
  useEffect(() => {
    setPath(initialPath);
  }, [initialPath]);

  // when the user finishes drawing the polygon
  const handlePolygonComplete = (poly: google.maps.Polygon) => {
    const pts = poly
      .getPath()
      .getArray()
      .map((pt) => ({ lat: pt.lat(), lng: pt.lng() }));

    const fc: GeoJSON.FeatureCollection = {
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
    };

    onChange(fc);
    setPath(pts);
    poly.setMap(null); // remove the drawing overlay
  };

  if (loadError) {
    return <div className="p-6 text-red-600">Error loading Google Maps.</div>;
  }
  if (!isLoaded) {
    return <div className="p-6">Loading map…</div>;
  }

  // center/zoom logic
  const center = path.length ? path[0] : ITALY_CENTER;
  const zoom = path.length ? 13 : 6;

  return (
    <>
      {/* enlarge & restyle the drawing‐tool icon */}
      <style jsx global>{`
        .gm-style .gm-drawing-icon {
          width: 32px !important;
          height: 32px !important;
        }
        .gm-style .gm-drawing-icon img {
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white w-full h-full md:w-3/4 md:h-3/4 rounded-lg overflow-hidden flex flex-col border-2 border-gray-300">
          {/* Header */}
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">
              {t[lang].drawLandBoundaryTitle}: {land.name}
            </h2>
          </div>

          {/* Map & DrawingTools */}
          <div className="flex-1">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={zoom}
              mapTypeId="hybrid"
            >
              {/* existing (or just‐drawn) polygon */}
              {path.length > 0 && (
                <Polygon
                  path={path}
                  options={{
                    fillColor: '#1976D2',
                    fillOpacity: 0.1,
                    strokeColor: '#1976D2',
                    strokeOpacity: 1,
                    strokeWeight: 2,
                    editable: true,
                  }}
                />
              )}

              <DrawingManager
                onPolygonComplete={handlePolygonComplete}
                options={{
                  drawingControl: true,
                  drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_RIGHT,
                    drawingModes: ['polygon'],
                  },
                  polygonOptions: {
                    fillColor: '#1976D2',
                    fillOpacity: 0.1,
                    strokeColor: '#1976D2',
                    strokeOpacity: 1,
                    strokeWeight: 2,
                    editable: true,
                  },
                }}
              />
            </GoogleMap>
          </div>

          {/* Footer: buttons + coords */}
          <div
            className="p-4 bg-gray-50 overflow-auto"
            style={{ maxHeight: '30%' }}
          >
            <div className="flex justify-end space-x-2 mb-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                {t[lang].cancelButtonLabel}
              </button>
              <button
                onClick={onSave}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {t[lang].saveButtonLabel}
              </button>
            </div>

            {/* show vertex list */}
            {path.length > 0 && (
              <div className="space-y-1 overflow-auto">
                {path.map((p, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <span className="w-1/2 text-sm">
                      Lat:{' '}
                      <input
                        readOnly
                        value={p.lat}
                        className="w-full border rounded p-1"
                      />
                    </span>
                    <span className="w-1/2 text-sm">
                      Lng:{' '}
                      <input
                        readOnly
                        value={p.lng}
                        className="w-full border rounded p-1"
                      />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
