// A tiny helper hook for area & centroid of a polygon ring
import { useMemo } from 'react';

type LatLng = { lat: number; lng: number };

export default function useFieldGeometry(ring: number[][] | undefined) {
  return useMemo(() => {
    if (!ring?.length) return { areaHa: 0, centroid: null };

    // simple centroid
    const [sumX, sumY] = ring.reduce(
      (acc, [lng, lat]) => [acc[0] + lng, acc[1] + lat],
      [0, 0],
    );
    const centroid: LatLng = { lat: sumY / ring.length, lng: sumX / ring.length };

    // area (ha) via Google geometry if available, else 0
    let areaHa = 0;
    if (typeof window !== 'undefined' &&
        window.google?.maps?.geometry?.spherical?.computeArea) {
      const path = ring.map(([lng, lat]) => new google.maps.LatLng(lat, lng));
      areaHa = +(google.maps.geometry.spherical.computeArea(path) / 10_000).toFixed(3);
    }
    return { areaHa, centroid };
  }, [ring]);
}
