'use client';

import React from 'react';
import { GoogleMap, Polygon } from '@react-google-maps/api';

type LatLng = { lat: number; lng: number };

interface MapPreviewProps {
  /** `true` after `useJsApiLoader` finishes */
  mapsLoaded: boolean;
  /** Polygon path - may be empty for “no boundary yet” */
  path: LatLng[];
  /** Fallback centre when `path` is empty */
  center: LatLng;
}

/**
 * Tiny read-only map used in the Lands list cards.
 * – No hooks inside, so memoisation is optional but cheap.  
 * – Renders “Loading map…” while Google SDK is still loading.
 */
function MapPreviewBase({ mapsLoaded, path, center }: MapPreviewProps) {
  if (!mapsLoaded) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        Loading map…
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={center}
      zoom={path.length ? 13 : 6}
      options={{ mapTypeId: 'hybrid', disableDefaultUI: true }}
    >
      {path.length > 0 && (
        <Polygon
          path={path}
          options={{
            fillColor: '#1976D2',
            fillOpacity: 0.2,
            strokeColor: '#1976D2',
            strokeOpacity: 1,
            strokeWeight: 2,
          }}
        />
      )}
    </GoogleMap>
  );
}

export default React.memo(
  MapPreviewBase,
  (prev, next) =>
    prev.mapsLoaded === next.mapsLoaded &&
    prev.path === next.path && // shallow ref equality – Apollo cache keeps it stable
    prev.center.lat === next.center.lat &&
    prev.center.lng === next.center.lng,
);
