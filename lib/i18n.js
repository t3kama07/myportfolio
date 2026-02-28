import en from "@/messages/en.json";
import fi from "@/messages/fi.json";

export const locales = ["en", "fi"];
export const defaultLocale = "en";

const dictionaries = {
  en,
  fi,
};

export function isValidLocale(locale) {
  return locales.includes(locale);
}

export function getDictionary(locale) {
  return dictionaries[locale] || dictionaries[defaultLocale];
}
