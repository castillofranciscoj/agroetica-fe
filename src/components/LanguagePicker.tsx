'use client';
import { useState }            from 'react';
import { useLanguage }         from './LanguageContext';
import { languages }           from '@/i18n';
import type { Lang }           from './LanguageContext';
import { useLocaleSwitcher }   from '@/lib/useLocaleSwitcher';

/* flags */
const FLAGS: Record<Lang, string> = {
  en: '🇬🇧',
  it: '🇮🇹',
  es: '🇪🇸',
  fr: '🇫🇷',
  pt: '🇵🇹',
  de: '🇩🇪',
  da: '🇩🇰',
  nl: '🇳🇱',
  pl: '🇵🇱',
  gr: '🇬🇷',
};

/* label names */
const LANG_NAMES: Record<Lang, string> = {
  it: 'Italiano',
  es: 'Español',
  en: 'English',
  fr: 'Français',
  pt: 'Português',
  de: 'Deutsch',
  da: 'Dansk',
  nl: 'Dutch',
  pl: 'Polski',
  gr: 'Ελληνικά',
};

interface Props {
  mobile?: boolean;     // single-column in mobile dropdown
  onAfterSelect?: () => void; // optional callback (e.g. close parent menu)
}

export default function LanguagePicker({ mobile = false, onAfterSelect }: Props) {
  const { lang, setLang } = useLanguage();
  const switchLocale       = useLocaleSwitcher();
  const [open, setOpen]    = useState(false);

  const pick = (l: Lang) => {
    switchLocale(l);
    setLang(l);
    setOpen(false);
    onAfterSelect?.();
  };

  return (
    <div className="relative">
      {/* trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center space-x-1 p-1 rounded hover:bg-gray-100 text-xl"
      >
        <span>{FLAGS[lang]}</span>
        {!mobile && (
          <svg className="w-3 h-3 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
          </svg>
        )}
      </button>

      {/* dropdown */}
      {open && (
        <div
          className={`absolute ${mobile ? 'left-0' : 'right-0'} mt-2 bg-white rounded shadow-lg z-60 min-w-[220px]`}
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 p-2">
            {languages.map(l => (
              <button
                key={l}
                onClick={() => pick(l)}
                className={`flex items-center gap-2 py-2 text-sm whitespace-nowrap hover:bg-gray-100 rounded ${
                  l === lang ? 'font-semibold text-gray-900' : 'text-gray-700'
                }`}
              >
                <span className="text-base">{FLAGS[l]}</span>
                <span className="text-xs">{LANG_NAMES[l]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
