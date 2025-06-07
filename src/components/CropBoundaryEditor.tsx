// src/components/CropBoundaryEditor.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  GoogleMap,
  Polygon,
  DrawingManager,
  useJsApiLoader,
} from '@react-google-maps/api';
import { Layers } from 'lucide-react';

import {
  GMAPS_LOADER_ID as LOADER_ID,
  GMAPS_LIBRARIES  as LIBRARIES,
} from '@/components/LocationPicker';

/* ───────── types & consts ───────── */
type LatLng = { lat: number; lng: number };

interface Props {
  title               : string;
  boundary            : GeoJSON.FeatureCollection | null;
  onChange            : (fc: GeoJSON.FeatureCollection | null) => void;
  fieldBoundary       : GeoJSON.FeatureCollection;
  otherCropBoundaries : GeoJSON.FeatureCollection[];
}

const ITALY_CENTER: LatLng = { lat: 41.8719, lng: 12.5674 };

/* ───────── component ───────── */
export default function CropBoundaryEditor({
  title,
  boundary,
  onChange,
  fieldBoundary,
  otherCropBoundaries,
}: Props) {
  /* shared Maps-JS loader */
  const { isLoaded } = useJsApiLoader({
    id: LOADER_ID,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: LIBRARIES,                               // ['drawing','places','geometry']
  });

  /* ------------ helpers ------------- */
  const pathFromFC = (fc: GeoJSON.FeatureCollection | null): LatLng[] =>
    ((fc?.features?.[0]?.geometry?.coordinates?.[0] as number[][]) || [])
      .map(([lng, lat]) => ({ lat, lng }));

  const initialPath = useMemo(() => pathFromFC(boundary)     , [boundary]);
  const fieldPath   = useMemo(() => pathFromFC(fieldBoundary), [fieldBoundary]);

  const [path,      setPath]      = useState<LatLng[]>(initialPath);
  const [showField, setShowField] = useState(true);
  const [showCrops, setShowCrops] = useState(true);

  useEffect(() => setPath(initialPath), [initialPath]);

  const toFC = (pts: LatLng[]): GeoJSON.FeatureCollection => ({
    type : 'FeatureCollection',
    features: [{
      type      : 'Feature',
      properties: {},
      geometry  : { type:'Polygon', coordinates:[pts.map(p => [p.lng, p.lat])]},
    }],
  });

  /* ----- drawing sync ----- */
  const polyRef = useRef<google.maps.Polygon | null>(null);

  const syncEdited = () => {
    if (!polyRef.current) return;
    const pts = polyRef.current.getPath().getArray()
      .map(p => ({ lat: p.lat(), lng: p.lng() }));
    setPath(pts);
    onChange(toFC(pts));
  };

  const handleComplete = (poly: google.maps.Polygon) => {
    const pts = poly.getPath().getArray()
      .map(p => ({ lat: p.lat(), lng: p.lng() }));
    poly.setMap(null);                // discard temp overlay
    setPath(pts);
    onChange(toFC(pts));
  };

  /* ----- map view helpers ----- */
  const center = path[0] || fieldPath[0] || ITALY_CENTER;
  const zoom   = path.length || fieldPath.length ? 15 : 6;

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-full text-gray-400">Loading…</div>;
  }

  /* ----- render ----- */
  return (
    <div className="relative w-full h-full">
      {/* larger draw-tool icons */}
      <style jsx global>{`
        .gm-style .gm-drawing-icon{width:44px!important;height:44px!important}
        .gm-style .gm-drawing-icon img{width:100%!important;height:100%!important}
      `}</style>

      {/* title badge */}
      <span className="absolute z-20 top-2 left-1/2 -translate-x-1/2 bg-white/90 px-2 py-1 rounded text-xs shadow">
        {title || '—'}
      </span>

      {/* layer-toggle buttons – right-hand vertical centre  */}
      <div className="absolute z-20 right-2 top-1/2 -translate-y-1/2 flex flex-col space-y-2">
        {fieldPath.length > 0 && (
          <button title="Toggle field boundary" onClick={() => setShowField(v => !v)}
                  className="bg-white/90 rounded p-1.5 shadow hover:bg-gray-100">
            <Layers className="w-5 h-5 text-blue-600" />
          </button>
        )}
        {otherCropBoundaries.length > 0 && (
          <button title="Toggle other crops" onClick={() => setShowCrops(v => !v)}
                  className="bg-white/90 rounded p-1.5 shadow hover:bg-gray-100">
            <Layers className="w-5 h-5 text-orange-600 rotate-90" />
          </button>
        )}
      </div>

      <GoogleMap
        mapContainerStyle={{ width:'100%', height:'100%' }}
        center={center}
        zoom={zoom}
        mapTypeId="hybrid"
        options={{
          streetViewControl:false,
          fullscreenControl:false,
          mapTypeControl:true,
          mapTypeControlOptions:{
            position:google.maps.ControlPosition.TOP_LEFT,
            mapTypeIds:['roadmap','hybrid'],
          },
        }}
        onLoad={m => m.setMapTypeId('hybrid')}
      >
        {/* field outline */}
        {showField && fieldPath.length > 0 && (
          <Polygon path={fieldPath}
                   options={{ strokeColor:'#2563eb',
                              strokeWeight:2, fillOpacity:0, zIndex:10 }} />
        )}

        {/* existing crops */}
        {showCrops && otherCropBoundaries.map((fc, i) => {
          const p = pathFromFC(fc);
          return p.length ? (
            <Polygon key={i} path={p}
                     options={{ strokeColor:'#F97316', strokeWeight:2,
                                fillColor:'#F97316', fillOpacity:0.35, zIndex:15 }} />
          ) : null;
        })}

        {/* current crop polygon */}
        {path.length > 0 && (
          <Polygon path={path}
                   onLoad={p => (polyRef.current = p)}
                   onMouseUp={syncEdited}
                   options={{ strokeColor:'#38a169', strokeWeight:2,
                              fillColor:'#38a169', fillOpacity:0.25,
                              editable:true, zIndex:20 }} />
        )}

        {/* drawing tools */}
        <DrawingManager
          onPolygonComplete={handleComplete}
          options={{
            drawingControl:true,
            drawingControlOptions:{
              position:google.maps.ControlPosition.TOP_RIGHT,
              drawingModes:['polygon'],
            },
            polygonOptions:{ strokeColor:'#38a169', strokeWeight:2,
                             fillColor:'#38a169', fillOpacity:0.25, editable:true },
          }}
        />
      </GoogleMap>
    </div>
  );
}
