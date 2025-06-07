'use client';

import React, { useEffect, useState } from 'react';

/* same lightweight type as in FieldsList */
export type FarmOption = { id: string; name: string };

interface InlineEditFormProps {
  initialName: string;
  initialArea: string;      // human string so we keep decimals untouched
  initialFarmId: string;
  farms: FarmOption[];

  labels: {
    nameLabel: string;
    areaLabel: string;
    selectFarmLabel: string;
    saveChanges: string;
    cancel: string;
  };

  /** called with the edited values; parent does the mutation */
  onSave: (vals: { name: string; area: string; farmId: string }) => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Inline form used inside each Land card when “Edit details” is clicked.
 * Holds its own input state, then hands the values back to the parent.
 */
export default function InlineEditForm({
  initialName,
  initialArea,
  initialFarmId,
  farms,
  labels,
  onSave,
  onCancel,
  loading = false,
}: InlineEditFormProps) {
  const [name, setName]     = useState(initialName);
  const [area, setArea]     = useState(initialArea);
  const [farmId, setFarmId] = useState(initialFarmId);

  /* re-sync when the parent swaps to another land */
  useEffect(() => {
    setName(initialName);
    setArea(initialArea);
    setFarmId(initialFarmId);
  }, [initialName, initialArea, initialFarmId]);

  return (
    <form
      className="space-y-2"
      onSubmit={e => {
        e.preventDefault();
        onSave({ name, area, farmId });
      }}
    >
      <input
        className="w-full border rounded p-2"
        placeholder={labels.nameLabel}
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <input
        className="w-full border rounded p-2"
        type="number"
        step="0.01"
        placeholder={labels.areaLabel}
        value={area}
        onChange={e => setArea(e.target.value)}
      />

      <label className="block text-sm font-medium text-gray-700">
        {labels.selectFarmLabel}
      </label>
      <select
        className="w-full border rounded p-2"
        value={farmId}
        onChange={e => setFarmId(e.target.value)}
      >
        {farms.map(f => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>

      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {labels.saveChanges}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          {labels.cancel}
        </button>
      </div>
    </form>
  );
}
