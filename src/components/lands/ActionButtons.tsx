'use client';

import React from 'react';

interface ActionButtonsProps {
  onView: () => void;
  onEditDetails: () => void;
  onEditLocation: () => void;
  onDelete: () => void;
  labels: {
    view: string;
    editDetails: string;
    editLocation: string;
    delete: string;
    confirmDelete: string;
  };
}

/**
 * Four text-link buttons used in the Lands list card.
 * All logic (confirm-dialog, routing, setState, etc.) lives in the parent;
 * this component is strictly presentational.
 */
export default function ActionButtons({
  onView,
  onEditDetails,
  onEditLocation,
  onDelete,
  labels,
}: ActionButtonsProps) {
  return (
    <div className="flex space-x-4 text-left">
      <button className="text-green-600 hover:underline" onClick={onView}>
        {labels.view}
      </button>

      <button
        className="text-blue-600 hover:underline"
        onClick={onEditDetails}
      >
        {labels.editDetails}
      </button>

      <button
        className="text-blue-600 hover:underline"
        onClick={onEditLocation}
      >
        {labels.editLocation}
      </button>

      <button
        className="text-red-600 hover:underline"
        onClick={() => {
          if (confirm(labels.confirmDelete)) onDelete();
        }}
      >
        {labels.delete}
      </button>
    </div>
  );
}
