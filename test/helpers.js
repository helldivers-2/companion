import { readFileSync } from "node:fs";

export const memory = () => {
  const m = {};
  return {
    getItem: (k) => m[k] ?? null,
    setItem: (k, v) => {
      m[k] = v;
    },
  };
};
export const i18nDir = new URL("../src/_data/i18n/", import.meta.url);
export const loadLocale = (l) => JSON.parse(readFileSync(new URL(`${l}.json`, i18nDir)));
