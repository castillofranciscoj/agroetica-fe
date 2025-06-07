// src/components/FieldCard.tsx
'use client';

import Image from 'next/image';
import { Plus, Pencil, Trash } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';

/* ------------------------------------------------------------------ */
/* tiny helper – Google Static Maps URL from a polygon ring            */
/* ------------------------------------------------------------------ */
function buildStaticUrl(ring: number[][]): string {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return '';
  const [lng0, lat0] = ring[0];
  const path = ring.map(([lng, lat]) => `${lat},${lng}`).join('|');
  const qs = new URLSearchParams({
    key,
    size: '400x400',
    maptype: 'satellite',
    zoom: '15',
    center: `${lat0},${lng0}`,
    path: `color:0x1976D2FF|weight:2|fillcolor:0x00000000|${path}`,
  });
  return `https://maps.googleapis.com/maps/api/staticmap?${qs.toString()}`;
}

/* ------------------------------------------------------------------ */
/* component                                                           */
/* ------------------------------------------------------------------ */
export default function FieldCard({
  field,
  onAddCrop,
  onEdit,
  onDelete,
}: {
  field: any;
  onAddCrop: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const { lang } = useLanguage();

  const ring =
    field.boundary?.features?.[0]?.geometry?.coordinates?.[0] as
      | number[][]
      | undefined;

  return (
    <div className="border rounded shadow-sm flex flex-col">
      {/* thumbnail */}
      <div className="aspect-square bg-gray-100 overflow-hidden">
        {ring ? (
          <Image
            src={buildStaticUrl(ring)}
            alt={field.name}
            width={400}
            height={400}
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-gray-500">
            {t[lang].mapPlaceholder}
          </div>
        )}
      </div>

      {/* caption & actions */}
      <div className="p-3 flex flex-col flex-1">
        <span className="font-semibold truncate">{field.name}</span>
        <span className="text-xs text-gray-500 mb-2">
          {field.areaHectares ? field.areaHectares.toFixed(2) : '—'} ha
        </span>

        {/* actions */}
        <div className="mt-auto flex gap-3 text-xs">
          <button
            onClick={() => onAddCrop(field.id)}
            className="inline-flex items-center gap-1 text-green-600 hover:underline"
          >
            <Plus className="w-3 h-3" />
            {t[lang].addCropBtn}
          </button>

          <button
            onClick={() => onEdit?.(field.id)}
            className="inline-flex items-center gap-1 text-gray-600 hover:text-green-700"
          >
            <Pencil className="w-3 h-3" />
            {t[lang].editFieldBtn ?? 'Edit'}
          </button>

          <button
            onClick={() => onDelete?.(field.id)}
            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
          >
            <Trash className="w-3 h-3" />
            {t[lang].deleteFieldBtn ?? 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
