// Pages paginate over site.locales into `lang`; templates read their strings from `t`.
// The page script reads only these keys; base.njk embeds them so the bundle carries no locale files.
const SCRIPT_KEYS = ["api", "js", "factions", "units", "record", "taskTypes", "rewardTypes", "tacticalStatus", "regionSizes", "map"];

export default {
  t: (data) => data.i18n[data.lang ?? "en"],
  strings: (data) => {
    const t = data.i18n[data.lang ?? "en"], en = data.i18n.en.js;
    // Dispatch headlines come in the page language with older English ones mixed in, so the outcome patterns match both.
    const js = { ...t.js, won: `${t.js.won}|${en.won}`, lost: `${t.js.lost}|${en.lost}` };
    return { ...Object.fromEntries(SCRIPT_KEYS.map((k) => [k, t[k]])), js, overview: { order: t.overview.order } };
  },
};
