import { type Locale, type Translations, translations } from "./translations";
import { create } from "zustand";

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
