// src/components/CatastoOverlay.tsx
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { type GoogleMap as GoogleMapInstance } from '@react-google-maps/api';

/* ---------------- tile ↔︎ lon/lat helpers ---------------- */
const tile2lon = (x: number, z: number) => (x / 2 ** z) * 360 - 180;
const tile2lat = (y: number, z: number) => {
  const n = Math.PI - (2 * Math.PI * y) / 2 ** z;
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
};

/* ---------------- component ------------------------------ */
interface Props {
  map: GoogleMapInstance | null;
  visible: boolean;
  layers: string[];
  onLoadingChange?: (busy: boolean) => void;
}

export default function CatastoOverlay({
  map,
  visible,
  layers,
  onLoadingChange,
}: Props) {
  const overlayRef = useRef<google.maps.ImageMapType | null>(null);
  const busyTiles  = useRef(0);
  const prevBusy   = useRef(false);

  /* stable “busy counter” -------------------------------- */
  const bumpBusy = useCallback(
    (delta: number) => {
      busyTiles.current += delta;
      const flag = busyTiles.current > 0;
      if (flag !== prevBusy.current) {
        prevBusy.current = flag;
        onLoadingChange?.(flag);
      }
    },
    [onLoadingChange],
  );

  /* main side-effect ------------------------------------ */
  useEffect(() => {
    if (!map) return;
    const omt = map.overlayMapTypes;

    /* remember view BEFORE we touch overlays */
    const keepCenter = map.getCenter();
    const keepZoom   = map.getZoom();

    /* remove previous Catasto clones */
    omt.forEach((l, i) => {
      if ((l as google.maps.ImageMapType)?.name === 'Catasto') omt.removeAt(i);
    });
    overlayRef.current = null;

    /* ---------- toggle OFF ---------- */
    if (!visible) {
      bumpBusy(-busyTiles.current);          // reset counter

      /* Google sometimes pans → restore */
      if (keepCenter) {
        requestAnimationFrame(() => {
          map.panTo(keepCenter);
          if (typeof keepZoom === 'number') map.setZoom(keepZoom);
        });
      }
      return;
    }

    /* ---------- toggle ON ---------- */
    const safe = layers.filter(l => l !== 'CP.CadastralZoning');
    if (!safe.length) return;

    const chooseLayers = (z: number) =>
      z >= 15 ? safe : ['CP.CadastralZoning', 'vestizione'];

    const makeUrl = (p: google.maps.Point, z: number, L: string[]) => {
      const south = tile2lat(p.y + 1, z).toFixed(6);
      const west  = tile2lon(p.x    , z).toFixed(6);
      const north = tile2lat(p.y    , z).toFixed(6);
      const east  = tile2lon(p.x + 1, z).toFixed(6);

      return `/api/cartografia/wms?${new URLSearchParams({
        LAYERS: L.join(','),
        BBOX : `${south},${west},${north},${east}`,
        WIDTH: '256',
        HEIGHT:'256',
        TRANSPARENT: 'true',
      })}`;
    };

    const overlay = new google.maps.ImageMapType({
      getTileUrl: (c, z) => makeUrl(c, z, chooseLayers(z)),
      getTile(c, z, doc) {
        const img = doc.createElement('img');
        img.width = img.height = 256;

        const variants: string[][] = [
          chooseLayers(z),
          ['CP.CadastralParcel', 'fabbricati'],
          ['vestizione'],
        ];

        let v = 0, hard = 0;

        const load = () => {
          bumpBusy(+1);
          img.src = makeUrl(c, z, variants[v]);
        };

        img.onload  = () => bumpBusy(-1);
        img.onerror = () => {
          bumpBusy(-1);
          if (++v < variants.length) {
            setTimeout(load, 150 * v);
          } else if (hard < 5) {
            v = 0; hard += 1;
            setTimeout(load, 3000);
          }
        };

        load();
        return img;
      },
      tileSize: new google.maps.Size(256, 256),
      opacity : 0.8,
      name    : 'Catasto',
    });

    omt.insertAt(0, overlay);
    overlayRef.current = overlay;

    /* restore view after overlay insertion */
    if (keepCenter) {
      requestAnimationFrame(() => {
        map.panTo(keepCenter);
        if (typeof keepZoom === 'number') map.setZoom(keepZoom);
      });
    }

    /* clean-up */
    return () => {
      onLoadingChange?.(false);
      busyTiles.current = 0;
      prevBusy.current  = false;
    };
  }, [map, visible, layers, bumpBusy, onLoadingChange]);

  return null;
}
