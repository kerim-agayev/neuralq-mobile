import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './locales/en.json';
import tr from './locales/tr.json';
import az from './locales/az.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';
import es from './locales/es.json';
import hi from './locales/hi.json';
import ar from './locales/ar.json';
import pt from './locales/pt.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import it from './locales/it.json';
import pl from './locales/pl.json';
import id from './locales/id.json';

const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    tr: { translation: tr },
    az: { translation: az },
    ru: { translation: ru },
    zh: { translation: zh },
    es: { translation: es },
    hi: { translation: hi },
    ar: { translation: ar },
    pt: { translation: pt },
    fr: { translation: fr },
    de: { translation: de },
    ja: { translation: ja },
    ko: { translation: ko },
    it: { translation: it },
    pl: { translation: pl },
    id: { translation: id },
  },
  lng: deviceLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
