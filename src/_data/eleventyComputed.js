// Pages paginate over site.locales into `lang`; templates read their strings from `t`.
// The page script reads only these keys; base.njk embeds them so the bundle carries no locale files.
const SCRIPT_KEYS = ["api", "js", "factions", "units", "record", "taskTypes", "rewardTypes", "tacticalStatus", "regionSizes"];

export default {
  t: (data) => data.i18n[data.lang ?? "en"],
  strings: (data) => {
    const t = data.i18n[data.lang ?? "en"];
    return { ...Object.fromEntries(SCRIPT_KEYS.map((k) => [k, t[k]])), overview: { order: t.overview.order } };
  },
};
