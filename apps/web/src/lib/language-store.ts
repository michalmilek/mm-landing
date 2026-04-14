import { create } from "zustand";
import { translations, type Locale, type Translations } from "./translations";

interface LanguageStore {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  locale: "pl",
  t: translations.pl,
  setLocale: (locale) => set({ locale, t: translations[locale] }),
}));
