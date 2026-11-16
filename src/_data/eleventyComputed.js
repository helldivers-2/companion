// Pages paginate over site.locales into `lang`; templates read their strings from `t`.
export default { t: (data) => data.i18n[data.lang ?? "en"] };
