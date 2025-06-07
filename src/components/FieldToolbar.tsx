'use client';

import React from 'react';

interface FieldToolbarProps {
  /* current open/closed state of each panel */
  showFieldPanel: boolean;
  showCadastre: boolean;
  showWeatherPanel: boolean;
  showCropsPanel: boolean;

  /* togglers (usually setState callbacks) */
  onToggleFieldPanel: () => void;
  onToggleCadastre: () => void;
  onToggleWeatherPanel: () => void;
  onToggleCropsPanel: () => void;

  /* button tool-tips / aria-labels */
  labels: {
    field: string;
    weather: string;
    crops: string;
  };
}

/** Four round buttons that live top-right on FieldView */
export default function FieldToolbar({
  showFieldPanel,
  showCadastre,
  showWeatherPanel,
  showCropsPanel,
  onToggleFieldPanel,
  onToggleCadastre,
  onToggleWeatherPanel,
  onToggleCropsPanel,
  labels,
}: FieldToolbarProps) {
  return (
    <div className="flex space-x-2 bg-black/50 p-2 rounded">
      {/* edit land */}
      <button
        onClick={onToggleFieldPanel}
        className={`p-1 rounded hover:bg-white/20 ${
          showFieldPanel ? 'bg-green-500' : ''
        }`}
        title={labels.field}
        aria-label={labels.field}
      >
        {/* pencil icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 17.25V21h3.75L17.81 9.94a3 3 0 00-4.243-4.243L3 17.25z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.75 17.25l4.243-4.243L20.25 14 16.007 18.254 14.75 17.25z"
          />
        </svg>
      </button>

      {/* cadastre toggle */}
      <button
        onClick={onToggleCadastre}
        className={`p-1 rounded hover:bg-white/20 ${
          showCadastre ? 'bg-green-500' : ''
        }`}
        title="Catasto"
        aria-label="Catasto layers"
      >
        {/* layers icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6l8-4 8 4-8 4-8-4zM4 14l8-4 8 4-8 4-8-4z"
          />
        </svg>
      </button>

      {/* weather */}
      <button
        onClick={onToggleWeatherPanel}
        className={`p-1 rounded hover:bg-white/20 ${
          showWeatherPanel ? 'bg-green-500' : ''
        }`}
        title={labels.weather}
        aria-label={labels.weather}
      >
        {/* sun icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414-1.414M17.95 17.95l1.414-1.414M6.05 6.05L4.636 7.464M12 8a4 4 0 100 8 4 4 0 000-8z"
          />
        </svg>
      </button>

      {/* crops */}
      <button
        onClick={onToggleCropsPanel}
        className={`p-1 rounded hover:bg-white/20 ${
          showCropsPanel ? 'bg-green-500' : ''
        }`}
        title={labels.crops}
        aria-label={labels.crops}
      >
        {/* leaf icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 2a7 7 0 017 7c0 5-7 11-7 11s-7-6-7-11a7 7 0 017-7z"
          />
        </svg>
      </button>
    </div>
  );
}
