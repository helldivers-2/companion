import en from "../_data/i18n/en.json" with { type: "json" };

// base.njk embeds this locale's script strings (eleventyComputed.js picks them); Node tests have no page and get English.
export const lang = globalThis.document?.documentElement.lang ?? "en";
export const t = globalThis.document ? JSON.parse(document.getElementById("strings").textContent) : en;
export const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k]);
