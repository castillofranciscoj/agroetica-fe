// src/components/YourFarms.tsx
'use client';

import React, { useState }      from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import Image                    from 'next/image';
import {
  Grid, List as ListIcon, Table as TableIcon,
  Plus, Pencil, Trash,
}                               from 'lucide-react';
import { useLanguage }          from '@/components/LanguageContext';
import { t }                    from '@/i18n';
import { useLocaleRouter }      from '@/lib/useLocaleRouter';

/* ───────────── GraphQL ───────────── */
const GET_USER_FARMS = gql`
  query GetUserFarms($userId: ID!) {
    farms(where: { createdBy: { id: { equals: $userId } } }
          orderBy: { name: asc }) {
      id
      name
      location        # { lat, lng }
      fields { id }   # just for the counter
    }
  }
`;

export const DELETE_FARM = gql`
  mutation DeleteFarm($id: ID!) {
    deleteFarm(where: { id: $id }) { id }
  }
`;

/* helper – static-map from one point */
function buildStaticUrlPoint(lat: number, lng: number) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return '';
  const qs = new URLSearchParams({
    key, size:'400x400', maptype:'satellite', zoom:'15',
    center:`${lat},${lng}`,
    markers:`color:0x2E7D32|${lat},${lng}`,
  });
  return `https://maps.googleapis.com/maps/api/staticmap?${qs}`;
}

/* component ---------------------------------------------------- */
type Mode = 'grid' | 'list' | 'table';
interface Props { userId: string }

export default function YourFarms({ userId }: Props) {

  const { lang } = useLanguage();
  const router   = useLocaleRouter();
  const [mode, setMode] = useState<Mode>('grid');

  /* fetch farms */
  const { data, loading, error, refetch } = useQuery(GET_USER_FARMS, {
    skip: !userId,
    variables:{ userId },
    fetchPolicy:'cache-and-network',
  });
  const farms = data?.farms ?? [];

  /* delete mutation */
  const [deleteFarm] = useMutation(DELETE_FARM, {
    onCompleted: () => refetch(),
    onError    : err => alert(err.message),
  });
  const askDelete = (id: string) => {
    if (window.confirm(t[lang].confirmDeleteFarm)) {
      deleteFarm({ variables:{ id } });
    }
  };

  /* helpers */
  const Tab = ({ id, icon, label }:{ id:Mode; icon:React.ReactNode; label:string }) => (
    <button
      onClick={() => setMode(id)}
      className={`px-4 py-2 rounded-t-md border-b-2 flex items-center gap-1
        ${mode===id ? 'border-green-600 text-green-700 font-semibold'
                     : 'border-transparent hover:bg-gray-50'}`}
    >
      {icon} {label}
    </button>
  );
  const goToAdd = () => router.push('/portal/farm/new');
  const goEdit  = (id:string)=> router.push(`/portal/farm/${id}/edit`);

  /* render ------------------------------------------------------ */
  return (
    <section className="mb-12">
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">{t[lang].yourFarmsHeading}</h2>
        <button onClick={goToAdd}
                className="inline-flex items-center gap-1 text-sm text-green-600 hover:underline">
          <Plus className="w-4 h-4"/>{t[lang].addFarmBtn}
        </button>
      </div>

      {/* tabs */}
      <div className="flex border-b mb-4 gap-1">
        <Tab id="grid"  icon={<Grid     className="w-4 h-4"/>} label={t[lang].gridLabel}/>
        <Tab id="list"  icon={<ListIcon className="w-4 h-4"/>} label={t[lang].listLabel}/>
        <Tab id="table" icon={<TableIcon className="w-4 h-4"/>} label={t[lang].tableLabel}/>
      </div>

      {/* states */}
      {loading && <p className="text-gray-500">{t[lang].loadingLabel}…</p>}
      {error   && <p className="text-red-600">{t[lang].errorLoadingData}</p>}
      {!loading && !error && farms.length===0 && (
        <p className="text-gray-500">{t[lang].noData}</p>
      )}

      {/* ============ GRID ============ */}
      {mode==='grid' && (
        <div className="grid gap-6"
             style={{gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))'}}>
          {/* add */}
          <button onClick={goToAdd}
                  className="border-2 border-dashed border-gray-300 rounded
                             flex flex-col items-center justify-center
                             text-gray-500 hover:bg-gray-50">
            <Plus className="w-8 h-8 mb-2"/>{t[lang].addFarmBtn}
          </button>

          {/* farms */}
          {farms.map(f=>{
            const { lat,lng } = f.location||{};
            const hasLoc = typeof lat==='number' && typeof lng==='number';
            return (
              <div key={f.id} className="border rounded shadow-sm flex flex-col">
                {/* map */}
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {hasLoc
                    ? <Image src={buildStaticUrlPoint(lat,lng)} alt={f.name}
                             width={400} height={400} className="object-cover"/>
                    : <div className="flex items-center justify-center h-full
                                      text-xs text-gray-500">
                        {t[lang].mapPlaceholder}
                      </div>}
                </div>
                {/* caption + actions */}
                <div className="p-3 flex flex-col flex-1">
                  <span className="font-semibold truncate">{f.name}</span>
                  <span className="text-xs text-gray-500 mb-2">
                    {f.fields.length} {t[lang].fieldsLabel}
                  </span>
                  <div className="mt-auto flex gap-3 text-xs">
                    <button onClick={()=>goEdit(f.id)}
                            className="inline-flex items-center gap-1 text-gray-600 hover:text-green-700">
                      <Pencil className="w-3 h-3"/>{t[lang].editFarmBtn}
                    </button>
                    <button onClick={()=>askDelete(f.id)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700">
                      <Trash className="w-3 h-3"/>{t[lang].deleteFarmBtn}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============ LIST ============ */}
      {mode==='list' && (
        <ul className="space-y-3">
          {/* add row */}
          <li onClick={goToAdd}
              className="border-2 border-dashed border-gray-300 rounded p-4
                         flex items-center gap-2 cursor-pointer hover:bg-gray-50">
            <Plus className="w-4 h-4"/>{t[lang].addFarmBtn}
          </li>

          {farms.map(f=>(
            <li key={f.id}
                className="border rounded p-4 grid grid-cols-[1fr_auto_auto_auto]
                           items-center gap-4 even:bg-gray-50">
              <span className="truncate font-medium">{f.name}</span>
              <span className="text-xs text-gray-500">
                {f.fields.length} {t[lang].fieldsLabel}
              </span>
              <button onClick={()=>goEdit(f.id)}
                      className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-green-700">
                <Pencil className="w-3 h-3"/>{t[lang].editFarmBtn}
              </button>
              <button onClick={()=>askDelete(f.id)}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700">
                <Trash className="w-3 h-3"/>{t[lang].deleteFarmBtn}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ============ TABLE ============ */}
      {mode==='table' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">{t[lang].farmName}</th>
                <th className="px-3 py-2 text-left">{t[lang].fieldCount}</th>
                <th className="px-3 py-2 text-left">{t[lang].actionsLabel}</th>
              </tr>
            </thead>
            <tbody>
              {/* add row */}
              <tr onClick={goToAdd}
                  className="cursor-pointer border-2 border-dashed border-gray-300 hover:bg-gray-50">
                <td className="px-3 py-2">
                  <Plus className="w-4 h-4 inline mr-1"/>{t[lang].addFarmBtn}
                </td><td/><td/>
              </tr>

              {farms.map(f=>(
                <tr key={f.id} className="even:bg-gray-50">
                  <td className="px-3 py-2">{f.name}</td>
                  <td className="px-3 py-2">{f.fields.length}</td>
                  <td className="px-3 py-2 flex gap-3">
                    <button onClick={()=>goEdit(f.id)}
                            className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-green-700">
                      <Pencil className="w-3 h-3"/>{t[lang].editFarmBtn}
                    </button>
                    <button onClick={()=>askDelete(f.id)}
                            className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700">
                      <Trash className="w-3 h-3"/>{t[lang].deleteFarmBtn}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </section>
  );
}
