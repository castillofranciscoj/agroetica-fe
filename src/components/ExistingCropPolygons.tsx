'use client';

import React, { Fragment, useMemo } from 'react';
import { Polygon, OverlayView } from '@react-google-maps/api';

/** loose type because the query is code-gen’d elsewhere */
type Crop = {
  id: string;
  cropType?: { name?: string };
  cropAreaHectares?: number;
  boundary?: {
    features?: { geometry?: { coordinates?: number[][][] } }[];
  };
};

interface ExistingCropPolygonsProps {
  crops: Crop[];
  /** helper that returns the visual centroid of a polygon */
  getCentroid: (pts: { lat: number; lng: number }[]) => { lat: number; lng: number };
  /** i18n dictionary + current language */
  t: Record<string, unknown>;
  lang: string;
}

/**
 * Renders one <Polygon> + <OverlayView> for every crop boundary.
 * Memoised so it only re-renders when the `crops` array (or i18n) changes,
 * not every time the map pans/zooms.
 */
function ExistingCropPolygonsBase({
  crops,
  getCentroid,
  t,
  lang,
}: ExistingCropPolygonsProps) {
  const elements = useMemo(() => {
    return crops.flatMap((crop) => {
      const coords = crop.boundary?.features?.[0]?.geometry?.coordinates?.[0];
      if (!coords) return [];
      const pts = coords.map(([lng, lat]) => ({ lat, lng }));
      const centroid = getCentroid(pts);

      return (
        <Fragment key={crop.id}>
          <Polygon
            path={pts}
            options={{
              fillColor: '#10B981',
              fillOpacity: 0.3,
              strokeColor: '#10B981',
              strokeOpacity: 1,
              strokeWeight: 2,
            }}
          />
          <OverlayView
            position={centroid}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div className="bg-black/50 backdrop-blur rounded shadow text-white text-xs p-2">
              <strong>{crop.cropType?.name ?? t[lang].crop}</strong>
              <br />
              {crop.cropAreaHectares?.toFixed(2)} ha
            </div>
          </OverlayView>
        </Fragment>
      );
    });
  }, [crops, getCentroid, t, lang]);

  return <>{elements}</>;
}

/* memo to avoid needless re-render when parent state changes */
const ExistingCropPolygons = React.memo(
  ExistingCropPolygonsBase,
  (prev, next) => prev.crops === next.crops // shallow ref equality from Apollo cache
);

export default ExistingCropPolygons;
