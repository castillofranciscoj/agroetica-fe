//src/components/LandPolygonEditor.tsx

'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';                 
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

type Props = {
  initial: GeoJSON.FeatureCollection | null;
  onChange: (newGeojson: GeoJSON.FeatureCollection | null) => void;
};

export default function LandPolygonEditor({ initial, onChange }: Props) {
  const map = useMap();
  const controlsInitialized = useRef(false);
  const initialLayerRef = useRef<L.GeoJSON | null>(null);

  // 1) Poll until map.pm is present, then install Geoman controls once.
  useEffect(() => {
    if (controlsInitialized.current) return;
    const tryInit = () => {
      // only proceed if the plugin is attached
      if ((map as unknown).pm) {
        const pm = (map as unknown).pm;
        pm.setGlobalOptions({ snappable: true, snapDistance: 20 });
        pm.addControls({
          position: 'topleft',
          drawMarker: false,
          drawPolygon: true,
          drawPolyline: false,
          drawCircle: false,
          drawRectangle: false,
          drawCircleMarker: false,
          dragMode: false,
          editMode: false,
          cutPolygon: false,
          removalMode: true,
          drawText: false,
          editLayers: false,
          rotateMode: false,
        });
        controlsInitialized.current = true;
      } else {
        // retry after a brief pause
        setTimeout(tryInit, 100);
      }
    };
    tryInit();
  }, [map]);

  // 2) Whenever `initial` changes, clear old and draw new polygon
  useEffect(() => {
    if (initialLayerRef.current) {
      map.removeLayer(initialLayerRef.current);
      initialLayerRef.current = null;
    }
    if (initial) {
      const layer = L.geoJSON(initial, {
        style: { color: '#3388ff', weight: 3, fillOpacity: 0.1 },
      }).addTo(map);
      initialLayerRef.current = layer;
      map.fitBounds(layer.getBounds(), { padding: [20, 20] });
    }
  }, [map, initial]);

  // 3) Wire up create/edit/remove events
  useEffect(() => {
    const onCreate = (e: unknown) => {
      // clear existing
      map.eachLayer((layer) => {
        if ((layer as unknown).feature?.geometry?.type === 'Polygon') {
          map.removeLayer(layer);
        }
      });
      const geo = (e.layer as unknown).toGeoJSON() as GeoJSON.Feature;
      onChange({ type: 'FeatureCollection', features: [geo] });
    };
    const onEdit = (e: unknown) => {
      const feats: GeoJSON.Feature[] = [];
      (e.layers as unknown).eachLayer((layer: unknown) =>
        feats.push(layer.toGeoJSON())
      );
      onChange({ type: 'FeatureCollection', features: feats });
    };
    const onRemove = () => onChange(null);

    map.on('pm:create', onCreate);
    map.on('pm:edit', onEdit);
    map.on('pm:remove', onRemove);
    return () => {
      map.off('pm:create', onCreate);
      map.off('pm:edit', onEdit);
      map.off('pm:remove', onRemove);
    };
  }, [map, onChange]);

  return null;
}
