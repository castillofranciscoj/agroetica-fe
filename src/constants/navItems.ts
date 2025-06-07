/* ──────────────────────────────────────────────────────────────
   src/constants/navItems.ts
   ─────────────────────────────────────────────────────────── */
import * as Icons from 'lucide-react';

export interface NavItem   {
  key      : string;
  href     : string;
  labelKey : string;            // key in i18n dictionaries
  icon     : keyof typeof Icons;
}
export interface NavSection {
  titleKey : string;
  items    : NavItem[];
}

/*  Nav definition
    ------------------------------------------------------------------ */
export const NAV_SECTIONS: NavSection[] = [
  /* ── ADMIN ─────────────────────────────────────────────────────── */
  {
    titleKey: 'adminSectionTitle',
    items   : [
      { key: 'adminHome', href: '/portal/admin', labelKey: 'adminHomeLabel', icon: 'Shield' },
    ],
  },

  /* ── REFERRAL PARTNER ─────────────────────────────────────────── */
  {
    titleKey: 'referralSectionTitle',
    items   : [
      { key: 'referralDashboard', href: '/portal/referral', labelKey: 'referralDashboardLabel', icon: 'Gift' },
    ],
  },

  /* ── MAIN AREA ────────────────────────────────────────────────── */
  {
    titleKey: 'mainSectionTitle',
    items   : [
      { key: 'dashboard', href: '/portal',               labelKey: 'dashboardLabel', icon: 'Home'  },
      { key: 'map',       href: '/portal/map',           labelKey: 'mapLabel',       icon: 'Map'   },

      /* NEW: Farms & Fields are now two distinct entries */
      { key: 'farms',     href: '/portal/farm',          labelKey: 'yourFarmsLabel',  icon: 'Tractor' },
      { key: 'fields',    href: '/portal/farm/fields',   labelKey: 'yourFieldsLabel', icon: 'Haze'    },
    ],
  },

  /* ── QDCA LOGBOOK ─────────────────────────────────────────────── */
  {
    titleKey: 'logbookSectionTitle',
    items   : [
      { key: 'logOverview',       href: '/portal/logbook/overview',       labelKey: 'logOverviewLabel',       icon: 'FileText'    },
      { key: 'logTreatments',     href: '/portal/logbook/treatments',     labelKey: 'logTreatmentsLabel',     icon: 'CheckCircle' },
      { key: 'logFertilisations', href: '/portal/logbook/fertilisations', labelKey: 'logFertilisationsLabel', icon: 'Handshake'   },
      { key: 'logOperations',     href: '/portal/logbook/operations',     labelKey: 'logOperationsLabel',     icon: 'Clipboard'   },
      { key: 'logIrrigations',    href: '/portal/logbook/irrigations',    labelKey: 'logIrrigationsLabel',    icon: 'Droplet'     },
    ],
  },

  /* ── FARM DATA ───────────────────────────────────────────────── */
  {
    titleKey: 'farmDataSectionTitle',
    items   : [
      { key: 'barnsLivestock', href: '/portal/farm/barns',     labelKey: 'barnsLivestockLabel', icon: 'Handshake' },
      { key: 'sensorsIoT',     href: '/portal/farm/sensors',   labelKey: 'sensorsIoTLabel',     icon: 'Cpu'       },
      { key: 'satelliteLayers',href: '/portal/farm/satellite', labelKey: 'satelliteLayersLabel',icon: 'Satellite' },
    ],
  },

  /* ── SUSTAINABILITY ─────────────────────────────────────────── */
  {
    titleKey: 'sustainabilitySectionTitle',
    items   : [
      { key: 'practicesPlans',   href: '/portal/sustainability/practices',      labelKey: 'practicesPlansLabel',   icon: 'Leaf'      },
      { key: 'footprintReports', href: '/portal/sustainability/reports',        labelKey: 'footprintReportsLabel', icon: 'BarChart2' },
      { key: 'offsetFactors',    href: '/portal/sustainability/offset-factors', labelKey: 'offsetFactorsLabel',    icon: 'BarChart2' },
    ],
  },

  /* ── SINGLE ITEMS (bottom) ───────────────────────────────────── */
  {
    titleKey: '',
    items   : [
      { key: 'productsInputs', href: '/portal/products', labelKey: 'productsInputsLabel', icon: 'Package'  },
      { key: 'settings',       href: '/portal/settings', labelKey: 'settingsLabel',       icon: 'Settings' },
    ],
  },
];
