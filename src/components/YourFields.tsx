// src/components/YourFields.tsx
'use client';

import React, { useState } from 'react';
import { useMutation }     from '@apollo/client';
import { Loader, Plus }    from 'lucide-react';

import { useLocaleRouter } from '@/lib/useLocaleRouter';
import { useLanguage }     from '@/components/LanguageContext';
import { t }               from '@/i18n';

import useFarmFilter       from './useFarmFilter';
import useFields           from './useFields';

import TabBar, { Mode }    from './TabBar';
import AddCard             from './AddCard';
import FieldCard           from './FieldCard';
import FieldListItem       from './FieldListItem';
import FieldTableRows      from './FieldTableRows';
import { DELETE_FIELD }    from '@/graphql/operations';   // <-- already exists

export default function YourFields(
  { userId, ignoreFarmFilter = false }:
  { userId: string; ignoreFarmFilter?: boolean },
) {
  const { lang }        = useLanguage();
  const router          = useLocaleRouter();
  const [mode, setMode] = useState<Mode>('grid');

  /* current farm filter (unless we’re ignoring it) */
  const farmId   = ignoreFarmFilter ? null : useFarmFilter(false);
  const { fields, loading, error, refetch } = useFields(userId, farmId);

  /* navigation helpers */
  const goAddField = () => router.push('/portal/farm/fields/new');
  const goEdit     = (id: string) =>
    router.push(`/portal/farm/fields/${id}/edit`);
  const goAddCrop  = (id: string) =>
    router.push(`/portal/farm/fields/${id}/add-crop`);

  /* delete-field mutation + confirmation */
  const [deleteField] = useMutation(DELETE_FIELD, { onCompleted: refetch });
  const askDelete = (id: string) => {
    if (window.confirm(t[lang].confirmDeleteField ?? 'Delete this field?')) {
      deleteField({ variables: { id } }).catch(err => alert(err.message));
    }
  };

  /* ---------------------------------------------------------------- */
  /* UI                                                               */
  /* ---------------------------------------------------------------- */
  return (
    <section>
      {/* heading + “Add field” button */}
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">{t[lang].yourFieldsHeading}</h2>

        <button
          onClick={goAddField}
          className="inline-flex items-center gap-1 text-sm text-green-600 hover:underline"
        >
          <Plus className="w-4 h-4" />
          {t[lang].addFieldBtn}
        </button>
      </header>

      {/* view-mode tabs */}
      <TabBar value={mode} onChange={setMode} />

      {/* loading / error / empty states */}
      {loading && (
        <Loader className="animate-spin mx-auto my-10 text-gray-500" />
      )}
      {error && (
        <p className="text-red-600">{t[lang].errorLoadingData}</p>
      )}
      {!loading && !error && fields.length === 0 && (
        <p className="text-gray-500">{t[lang].noData}</p>
      )}

      {/* ============ GRID ============ */}
      {mode === 'grid' && (
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}
        >
          {/* dotted “add” card */}
          <AddCard label={t[lang].addFieldBtn} onClick={goAddField} />

          {fields.map(f => (
            <FieldCard
              key={f.id}
              field={f}
              onAddCrop={goAddCrop}
              onEdit={goEdit}
              onDelete={askDelete}
            />
          ))}
        </div>
      )}

      {/* ============ LIST ============ */}
      {mode === 'list' && (
        <FieldListItem
          fields={fields}
          onAdd={goAddField}
          onAddCrop={goAddCrop}
          onEdit={goEdit}
          onDelete={askDelete}
        />
      )}

      {/* ============ TABLE ============ */}
      {mode === 'table' && (
        <FieldTableRows
          fields={fields}
          onAdd={goAddField}
          onAddCrop={goAddCrop}
          onEdit={goEdit}
          onDelete={askDelete}
        />
      )}
    </section>
  );
}
