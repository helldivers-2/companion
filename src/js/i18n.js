import en from "../_data/i18n/en.json" with { type: "json" };
import es from "../_data/i18n/es.json" with { type: "json" };
import de from "../_data/i18n/de.json" with { type: "json" };
import zhTW from "../_data/i18n/zh-TW.json" with { type: "json" };

// One bundle serves every locale and the page's lang picks the strings; Node tests have no document and get English.
export const lang = globalThis.document?.documentElement.lang ?? "en";
export const t = { en, es, de, "zh-TW": zhTW }[lang] ?? en;
export const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k]);
