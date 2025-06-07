/* src/i18n/index.ts */
import en from './en';
import it from './it';
import es from './es';
import fr from './fr';
import pt from './pt';
import de from './de';
import da from './da';
import nl from './nl';
import pl from './pl';
import gr from './gr';

export const t = { en, it, es, fr, pt, de, da, nl, pl, gr} as const;

export const languages = ['en', 'it', 'es', 'fr', 'pt', 'de', 'da', 'nl', 'pl', 'gr'] as const;
export type Lang       = typeof languages[number];
