import en from "../_data/i18n/en.json" with { type: "json" };

// One bundle serves every locale and the page's lang picks the strings; Node tests have no document and get English.
export const lang = globalThis.document?.documentElement.lang ?? "en";
export const t = { en }[lang] ?? en;
export const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k]);
