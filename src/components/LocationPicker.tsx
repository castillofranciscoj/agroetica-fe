//src/components/LocationPicker.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  GoogleMap,
  Marker,
  Autocomplete,
  useJsApiLoader,
} from '@react-google-maps/api';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';

/* ------------------------------------------------------------------ */
type LatLng = { lat: number; lng: number };
type Props  = {
  position?: LatLng;          // optional initial position
  onChange: (loc: LatLng) => void;
};

/* shared loader id & libs (must match every map caller!) */
export const GMAPS_LOADER_ID  = 'gmaps-shared';
export const GMAPS_LIBRARIES: ('drawing' | 'places' | 'geometry')[] = [
  'drawing',
  'places',
  'geometry',
];

/* fallback centre: Italy */
const DEFAULT_CENTER: LatLng = { lat: 41.8719, lng: 12.5674 };

/* ------------------------------------------------------------------ */
export default function LocationPicker({ position, onChange }: Props) {
  const { lang } = useLanguage();

  /* ---------------- state ---------------- */
  const [markerPos, setMarkerPos] = useState<LatLng | null>(position ?? null);

  /* sync external position */
  useEffect(() => { setMarkerPos(position ?? null); }, [position]);

  /* ---------------- maps loader ---------------- */
  const { isLoaded, loadError } = useJsApiLoader({
    id: GMAPS_LOADER_ID,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: GMAPS_LIBRARIES,
  });

  /* ---------------- autocomplete ---------------- */
  const autoRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onLoadAuto = (a: google.maps.places.Autocomplete) => (autoRef.current = a);
  const onPlaceChanged = () => {
    const loc = autoRef.current?.getPlace().geometry?.location;
    if (loc) {
      const p = { lat: loc.lat(), lng: loc.lng() };
      setMarkerPos(p);
      onChange(p);
    }
  };

  /* ---------------- render ---------------- */
  if (loadError)  return <p className="p-4 text-red-600">{t[lang].loadingError}</p>;
  if (!isLoaded)  return <p className="p-4">{t[lang].loadingMap}</p>;

  const mapOptions: google.maps.MapOptions = {
    mapTypeId: 'hybrid',
    zoomControl: true,
    zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
  };

  return (
    <div className="relative w-full h-full">
      {/* search box */}
      <Autocomplete onLoad={onLoadAuto} onPlaceChanged={onPlaceChanged}>
        <input
          type="text"
          placeholder={t[lang].searchPlaceholder}
          className="absolute top-2 left-2 z-10 w-80 px-2 py-1 border rounded shadow bg-white"
        />
      </Autocomplete>

      {/* map */}
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={markerPos ?? DEFAULT_CENTER}
        zoom={markerPos ? 13 : 6}
        options={mapOptions}
        onClick={e => {
          const latLng = e.latLng;
          if (!latLng) return;
          const p = { lat: latLng.lat(), lng: latLng.lng() };
          setMarkerPos(p);
          onChange(p);
        }}
      >
        {markerPos && (
          <Marker
            position={markerPos}
            draggable
            onDragEnd={evt => {
              const latLng = evt.latLng;
              if (!latLng) return;
              const p = { lat: latLng.lat(), lng: latLng.lng() };
              setMarkerPos(p);
              onChange(p);
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
