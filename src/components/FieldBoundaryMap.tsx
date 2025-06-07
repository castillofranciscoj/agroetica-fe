'use client';
import React, { useState, useMemo } from 'react';
import BoundaryEditorInline from './BoundaryEditorInLine';
import { Layers as LayersIcon } from 'lucide-react';
import { t } from '@/i18n';
import { useLanguage } from '@/components/LanguageContext';

type LatLng = { lat: number; lng: number };

interface Props {
  title: string;
  boundary: GeoJSON.FeatureCollection | null;
  onBoundaryChange: (fc: GeoJSON.FeatureCollection | null) => void;

  /* farm outline */
  farmGeo?: GeoJSON.FeatureCollection | null;
}

export default function FieldBoundaryMap({
  title,
  boundary,
  onBoundaryChange,
  farmGeo,
}: Props) {
  const { lang } = useLanguage();
  const [showFarm, setShowFarm] = useState(true);

  /* convert farm geo to Poly path once */
  const farmPolygons = useMemo<LatLng[][]>(() => {
    if (!showFarm || !farmGeo?.features?.length) return [];
    const ring = farmGeo.features[0].geometry.coordinates[0] as number[][];
    return [ring.map(([lng, lat]) => ({ lat, lng }))];
  }, [showFarm, farmGeo]);

  return (
    <div className="flex-1 relative">
      {farmGeo && (
        <button
          onClick={() => setShowFarm(p => !p)}
          title={t[lang].toggleFarmBoundary}
          className="absolute top-3 right-3 z-20 bg-white rounded-full shadow
                     p-2 hover:bg-gray-100"
        >
          <LayersIcon className="w-5 h-5" />
        </button>
      )}

      <BoundaryEditorInline
        title={title}
        boundary={boundary}
        onChange={onBoundaryChange}
        farmPolygons={farmPolygons}
      />
    </div>
  );
}
