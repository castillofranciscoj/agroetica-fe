import React from 'react';
import * as Icons from 'lucide-react';

export type StepStatus = 'completed' | 'current' | 'locked';

export interface StepProps {
  label: string;
  status: StepStatus;
  tooltip?: string;
  iconName?: string;
  phaseKey?: string;
}

/* ── Steps container ────────────────────────────────────────────── */
/* vertical on small screens, horizontal wrap on larger screens     */
export const Steps: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="flex flex-col sm:flex-row sm:flex-wrap items-start space-y-4 sm:space-y-0 sm:space-x-6 overflow-x-auto">
    {children}
  </div>
);

/* ── Icon mapping helper ───────────────────────────────────────── */
const BACKEND_ICON_MAP: Record<string, React.ComponentType<unknown>> = {
  Seedling:    Icons.Leaf,
  FileText:    Icons.FileText,
  MapPin:      Icons.MapPin,
  CheckCircle: Icons.CheckCircle,
  // …add more mappings as needed
};

/* ── Individual step ───────────────────────────────────────────── */
export const Step: React.FC<StepProps> = ({ label, status, tooltip, iconName }) => {
  /* pick icon ──────────────────────────────────────────────────── */
  let IconComponent: React.ComponentType<unknown> | null = null;

  if (iconName && BACKEND_ICON_MAP[iconName]) {
    IconComponent = BACKEND_ICON_MAP[iconName];
  } else if (iconName) {
    // fallback: convert e.g. "map-pin" → "MapPin"
    const normalized = iconName
      .toString()
      .replace(/[-_ ]+([a-zA-Z0-9])/g, (_, c) => c.toUpperCase())
      .replace(/^([a-z])/, (_, c) => c.toUpperCase());
    IconComponent = (Icons as unknown as Record<string, unknown>)[normalized] || null;
  }

  if (!IconComponent) {
    IconComponent =
      status === 'completed'
        ? Icons.CheckCircle
        : status === 'current'
        ? Icons.Circle
        : Icons.Lock;
  }

  /* colour by status ───────────────────────────────────────────── */
  const colorClass =
    status === 'completed'
      ? 'text-green-500'
      : status === 'current'
      ? 'text-blue-500'
      : 'text-gray-400';

  /* render ─────────────────────────────────────────────────────── */
  return (
    <div className="flex-shrink-0 flex flex-col items-center text-center w-full sm:w-auto">
      <div className="relative group">
        <IconComponent className={`w-8 h-8 ${colorClass}`} />
        {status === 'locked' && tooltip && (
          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {tooltip}
          </div>
        )}
      </div>
      <span
        className={`mt-2 text-sm ${
          status === 'completed'
            ? 'text-green-600'
            : status === 'current'
            ? 'text-blue-600 font-semibold'
            : 'text-gray-400'
        }`}
      >
        {label}
      </span>
    </div>
  );
};
