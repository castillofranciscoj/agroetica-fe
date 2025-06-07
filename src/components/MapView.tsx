/* ────────────────────────────────────────────────────────────────── */
/*  Map page – read-only visualisation                               */
/*      • scrollable field check-list                                */
/*      • scrollable crop-type check-list                            */
/*      • polygons from GET_CROPS($fieldIds) per selected field      */
/* ────────────────────────────────────────────────────────────────── */
'use client';

import {
  GoogleMap,
  Polygon,
  OverlayView,
  useJsApiLoader,
} from '@react-google-maps/api';
import React, {
  Fragment,
  useRef,
  useState,
  useMemo,
  useEffect,
} from 'react';
import { useLanguage }    from '@/components/LanguageContext';
import { useSession }     from 'next-auth/react';
import { useQuery }       from '@apollo/client';
import {
  GET_USER_FIELDS,
  GET_CROPS,
  GET_CROP_TYPES,
}                         from '@/graphql/operations';
import CatastoOverlay     from '@/components/CatastoOverlay';
import type { Field }     from '@/components/FieldView';
import { t }              from '@/i18n';
import CurrentWeatherCard from '@/components/CurrentWeatherCard';

/* ── constants / utils ──────────────────────────────────────────── */
const LOADER_ID     = 'gmaps-shared';
const LIBS: ('drawing' | 'places' | 'geometry')[] = ['drawing','places','geometry'];
const ITALY_CENTER  = { lat: 41.8719, lng: 12.5674 };
const ALL_CAT_LAYERS= ['CP.CadastralParcel','fabbricati','vestizioni'];
const FARM_EVT      = 'portal:selectedFarmIdChange';

/* ── tiny helpers / UI pieces ───────────────────────────────────── */
function IconToggle({
  enabled, onClick, title, children,
}: {
  enabled: boolean; onClick: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <button
      className={`p-1 rounded hover:bg-white/20 ${enabled ? 'bg-green-500' : ''}`}
      onClick={onClick}
      title={title}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" strokeWidth={2}
           className="w-6 h-6 text-white">
        {children}
      </svg>
    </button>
  );
}

function Panel({ title, children }:{ title: string; children: React.ReactNode }) {
  return (
    <div className="bg-black/50 backdrop-blur p-3 rounded text-white space-y-2">
      <h2 className="font-bold">{title}</h2>
      {children}
    </div>
  );
}

/* Analog clock – same as FieldView -------------------------------- */
function AnalogClock({ lat, lng }: { lat: number; lng: number }) {
  const [time, setTime] = useState(new Date());
  const [tz, setTz]     = useState<string>();

  useEffect(() => {
    const ts = Math.floor(Date.now() / 1000);
    fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${ts}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
    )
      .then(r => r.json())
      .then(d => d.status === 'OK' && setTz(d.timeZoneId));
  }, [lat, lng]);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const local  = tz ? new Date(new Date().toLocaleString('en-US', { timeZone: tz })) : time;
  const secDeg = local.getSeconds() * 6;
  const minDeg = (local.getMinutes() + local.getSeconds() / 60) * 6;
  const hrDeg  = ((local.getHours() % 12) + local.getMinutes() / 60) * 30;

  return (
    <div className="w-20 h-20 relative">
      <div className="w-full h-full border-2 border-white rounded-full" />
      <div className="absolute bg-white" style={{ width:2,height:'25%',top:'25%',left:'50%',transform:`rotate(${hrDeg}deg) translateX(-50%)`,transformOrigin:'50% 100%' }} />
      <div className="absolute bg-white" style={{ width:2,height:'35%',top:'15%',left:'50%',transform:`rotate(${minDeg}deg) translateX(-50%)`,transformOrigin:'50% 100%' }} />
      <div className="absolute bg-red-500" style={{ width:1,height:'40%',top:'10%',left:'50%',transform:`rotate(${secDeg}deg) translateX(-50%)`,transformOrigin:'50% 100%' }} />
      <div className="absolute bg-white rounded-full" style={{ width:4,height:4,top:'48%',left:'48%' }} />
    </div>
  );
}

/* ── main component ─────────────────────────────────────────────── */
export default function MapPage() {
  const { lang }       = useLanguage();
  const { data: sess } = useSession();

  /* maps refs / state -------------------------------------------- */
  const mapRef          = useRef<google.maps.Map | null>(null);
  const [gmap, setGmap] = useState<google.maps.Map | null>(null);

  /* UI toggles */
  const [showCatasto, setShowCatasto] = useState(false);
  const [showWeather, setShowWeather] = useState(false);

  /* ── farm & field filters ────────────────────────────────────── */
  const [farmId, setFarmId] = useState<string | undefined>(() =>
    typeof window === 'undefined'
      ? undefined
      : localStorage.getItem('selectedFarmId') || undefined,
  );

  /* keep in sync with sidebar selection */
  useEffect(() => {
    const sync = () => setFarmId(localStorage.getItem('selectedFarmId') || undefined);
    window.addEventListener('storage', e => { if (e.key === 'selectedFarmId') sync(); });
    window.addEventListener(FARM_EVT, sync);
    return () => {
      window.removeEventListener('storage', sync as unknown);
      window.removeEventListener(FARM_EVT, sync);
    };
  }, []);

  const [fieldIds, setFieldIds] = useState<string[]>([]);   // multi-select

  /* year selector (for crops) */
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(thisYear);

  /* GraphQL ------------------------------------------------------- */
  const { data: fieldsData } = useQuery(GET_USER_FIELDS, {
    variables: sess?.user?.id ? { userId: sess.user.id } : undefined,
    skip: !sess?.user?.id,
  });

  const { data: cropTypeData } = useQuery(GET_CROP_TYPES, {
    skip: !sess?.user?.id,
    fetchPolicy: 'cache-and-network',
  });

  /* maps loader --------------------------------------------------- */
  const { isLoaded, loadError } = useJsApiLoader({
    id: LOADER_ID,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: LIBS,
  });

  /* derived data ------------------------------------------------- */
  const selectedFields: Field[] = useMemo(
    () => fieldsData?.fields.filter((f: Field) => fieldIds.includes(f.id)) ?? [],
    [fieldIds, fieldsData],
  );

  const center = selectedFields[0]
    ? { lat: selectedFields[0].location.latitude, lng: selectedFields[0].location.longitude }
    : ITALY_CENTER;

  const allCropNames: string[] = useMemo(
    () => cropTypeData?.cropTypes?.map((ct: unknown) => ct.name).sort() ?? [],
    [cropTypeData],
  );

  const [visibleCrops, setVisibleCrops] = useState<string[]>([]);

  /* auto-fill visible crop list once fields selected -------------- */
  const autoFilled = useRef(false);
  useEffect(() => {
    if (fieldIds.length === 0) {
      autoFilled.current = false;
      return;
    }
    if (!autoFilled.current && allCropNames.length) {
      setVisibleCrops(allCropNames);
      autoFilled.current = true;
    }
  }, [fieldIds, allCropNames]);

  const toggleCropName = (name: string) =>
    setVisibleCrops(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name],
    );

  /* when `farmId` changes, select all its fields by default ------- */
  useEffect(() => {
    if (!farmId || !fieldsData?.fields) {
      setFieldIds([]);                 // clear when no farm
      return;
    }
    const belonging = fieldsData.fields
      .filter((f: Field) => f.farm.id === farmId)
      .map((f: Field) => f.id);
    setFieldIds(belonging);
  }, [farmId, fieldsData]);

  /* guards */
  if (loadError) return <p className="p-6 text-red-500">{t[lang].loadingError}</p>;
  if (!isLoaded)  return <p className="p-6">{t[lang].loading}…</p>;

  /* ── JSX ─────────────────────────────────────────────────────── */
  return (
    <div className="relative h-screen w-full overflow-hidden !mt-0 -mt-px">
      {/* ─── top-right toolbar ───────────────────────────────────── */}
      <div
        className="absolute right-16 z-20 flex space-x-2 bg-black/50 p-2 rounded backdrop-blur"
        style={{ top: 'var(--header-gap-lg)', height: 'var(--toolbar-height)' }}
      >
        <IconToggle
          enabled={showCatasto}
          onClick={() => {
            setShowCatasto(p => {
              const n = !p;
              if (n && gmap && gmap.getZoom() < 15) gmap.setZoom(15);
              return n;
            });
          }}
          title="Catasto"
        >
          <path d="M4 6l8-4 8 4-8 4-8-4zM4 14l8-4 8 4-8 4-8-4z" />
        </IconToggle>

        <IconToggle
          enabled={showWeather}
          onClick={() => setShowWeather(!showWeather)}
          title="Weather"
        >
          <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36-6.36l-1.42 1.42M6.05 17.95l-1.42-1.42M17.95 17.95l1.42-1.42M6.05 6.05L4.64 7.46M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </IconToggle>
      </div>

      {/* ─── left-hand panels (farm selector removed) ────────────── */}
      <div
        className="absolute left-4 z-20 space-y-4"
        style={{ top: 'var(--header-gap-lg)' }}
      >
        {/* fields */}
        <Panel title="Fields">
          <div className="max-h-60 overflow-y-auto pr-1 space-y-1">
            {fieldsData?.fields
              .filter((f: Field) => !farmId || f.farm.id === farmId)
              .map((f: Field) => (
                <label key={f.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-green-500"
                    checked={fieldIds.includes(f.id)}
                    onChange={() =>
                      setFieldIds(prev =>
                        prev.includes(f.id) ? prev.filter(x => x !== f.id) : [...prev, f.id],
                      )
                    }
                  />
                  <span className="text-sm">{f.name}</span>
                </label>
              ))}
          </div>
        </Panel>

        {/* crops */}
        <Panel title="Crops">
          <div className="max-h-60 overflow-y-auto pr-1 space-y-1">
            {allCropNames.map(name => (
              <label key={name} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-green-500"
                  checked={visibleCrops.includes(name)}
                  onChange={() => toggleCropName(name)}
                />
                <span className="text-sm">{name}</span>
              </label>
            ))}
          </div>
        </Panel>

        {/* year selector */}
        <Panel title={t[lang].EN /* “Select year” */}>
          <select
            className="w-full bg-black/50 text-white border rounded p-1"
            value={year}
            onChange={e => setYear(+e.target.value)}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <option key={i} value={thisYear - i}>{thisYear - i}</option>
            ))}
          </select>
        </Panel>

        {/* weather panel */}
        {showWeather && fieldIds.length === 1 && (
          <Panel title={t[lang].currentWeatherLabel}>
            <div className="flex items-center space-x-4">
              <AnalogClock
                lat={selectedFields[0].location.latitude}
                lng={selectedFields[0].location.longitude}
              />
              <CurrentWeatherCard
                lat={selectedFields[0].location.latitude}
                lon={selectedFields[0].location.longitude}
              />
            </div>
          </Panel>
        )}
      </div>

      {/* ─── Google Map ────────────────────────────────────────── */}
      <GoogleMap
        onLoad={m => {
          mapRef.current = m;
          setGmap(m);
          m.setTilt(0); m.setHeading(0);
          m.addListener('tilt_changed', () => { if (m.getTilt() !== 0) m.setTilt(0); });
        }}
        mapContainerStyle={{ width:'100%', height:'100%' }}
        center={center}
        zoom={selectedFields.length ? 15 : 6}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: { position: window.google.maps.ControlPosition.RIGHT_BOTTOM },
          mapTypeId:'hybrid', tilt:0, rotateControl:false,
        }}
      >
        <CatastoOverlay map={gmap} visible={showCatasto} layers={ALL_CAT_LAYERS} />

        {selectedFields.map(f => {
          const pts = f.boundary?.features?.[0]?.geometry?.coordinates?.[0]
            ?.map(([lng, lat]) => ({ lat, lng })) ?? [];
          return pts.length ? (
            <Polygon key={f.id} path={pts}
                     options={{ fillOpacity:0.1, strokeColor:'#1976D2', strokeWeight:2 }} />
          ) : null;
        })}

        {fieldIds.map(fid => (
          <FieldCrops key={fid} fieldId={fid} visibleNames={visibleCrops} />
        ))}
      </GoogleMap>
    </div>
  );
}

/* ── sub-component: crops for one field ─────────────────────────── */
function FieldCrops({ fieldId, visibleNames }:{
  fieldId: string; visibleNames: string[];
}) {
  const { data } = useQuery(GET_CROPS, {
    variables:{ fieldId }, skip:!fieldId, fetchPolicy:'cache-and-network',
  });
  if (!data?.crops) return null;

  return (
    <>
      {data.crops
        .filter((c:unknown) => visibleNames.includes(c.cropType?.name ?? ''))
        .map((c:unknown) => {
          const coords = c.boundary?.features?.[0]?.geometry?.coordinates?.[0];
          if (!coords) return null;
          const pts = coords.map(([lng, lat]:[number,number]) => ({ lat,lng }));
          const centroid = pts.reduce(
            (a,p) => ({ lat:a.lat+p.lat, lng:a.lng+p.lng }),
            { lat:0,lng:0 },
          );
          centroid.lat/=pts.length; centroid.lng/=pts.length;

          return (
            <Fragment key={c.id}>
              <Polygon path={pts}
                       options={{ fillOpacity:0.3, fillColor:'#10B981',
                                  strokeColor:'#10B981', strokeWeight:2, zIndex:20 }} />
              <OverlayView position={centroid}
                           mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
                <div className="bg-black/50 text-white text-xs px-2 rounded">
                  {c.cropType?.name} – {c.cropAreaHectares?.toFixed(2)} ha
                </div>
              </OverlayView>
            </Fragment>
          );
        })}
    </>
  );
}
