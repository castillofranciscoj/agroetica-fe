'use client';
import React from 'react';
import { Save, XCircle } from 'lucide-react';
import { t } from '@/i18n';
import { useLanguage } from '@/components/LanguageContext';

interface Props {
  farms: { id: string; name: string }[];
  values: {
    farmId: string;
    name: string;
    areaHa: number | '';
  };
  onChange: (field: keyof Props['values'], v: any) => void;
  boundaryDrawn: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  submitting: boolean;
  mode: 'new' | 'edit';
}

export default function FieldForm({
  farms,
  values,
  onChange,
  boundaryDrawn,
  onSubmit,
  onCancel,
  submitting,
  mode,
}: Props) {
  const { lang } = useLanguage();

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      {/* farm select */}
      <div>
        <label className="block font-medium mb-1">{t[lang].farmLabel}</label>
        <select
          value={values.farmId}
          onChange={e => onChange('farmId', e.target.value)}
          className="border rounded w-full p-2"
        >
          <option value="">{t[lang].selectLabel}</option>
          {farms.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      {/* name + area */}
      <div>
        <label className="block font-medium mb-1">{t[lang].fieldNameLabel} *</label>
        <input
          value={values.name}
          onChange={e => onChange('name', e.target.value)}
          className="border rounded w-full p-2"
          placeholder={t[lang].fieldNamePlaceholder}
        />
      </div>

      <div>
        <label className="block font-medium mb-1">{t[lang].areaLabel} (ha)</label>
        <input
          readOnly
          value={values.areaHa === '' ? '' : values.areaHa}
          className="border rounded w-full p-2 bg-gray-50 cursor-not-allowed"
        />
      </div>

      <p className="text-sm">
        {boundaryDrawn
          ? <span className="text-green-700">{t[lang].boundaryDrawn}</span>
          : <span className="text-gray-500">{t[lang].boundaryNotDrawn}</span>}
      </p>

      <div className="flex gap-3 pt-2">
        <button
          type="submit" disabled={submitting}
          className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded
                     hover:bg-green-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {mode === 'new' ? t[lang].addFieldBtn : t[lang].saveChanges}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 border px-4 py-2 rounded hover:bg-gray-100"
        >
          <XCircle className="w-4 h-4" />{t[lang].cancelLabel}
        </button>
      </div>
    </form>
  );
}
