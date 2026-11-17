// Stands in for the page i18n.js reads its strings from, with the English subset base.njk would embed.
import en from "../src/_data/i18n/en.json" with { type: "json" };
import computed from "../src/_data/eleventyComputed.js";

const strings = JSON.stringify(computed.strings({ i18n: { en }, lang: "en" }));
globalThis.document = { documentElement: { lang: "en" }, getElementById: () => ({ textContent: strings }) };
