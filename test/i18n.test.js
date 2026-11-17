import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { i18nDir as dir, loadLocale as load } from "./helpers.js";
import site from "../src/_data/site.json" with { type: "json" };
import computed from "../src/_data/eleventyComputed.js";

// Every locale needs the same keys as English, or the page shows "undefined".
const shape = (o) => (o && typeof o === "object" && !Array.isArray(o) ? Object.fromEntries(Object.keys(o).sort().map((k) => [k, shape(o[k])])) : Array.isArray(o) ? o.length : null);

test("every locale file matches English and site.locales", () => {
  assert.deepEqual(readdirSync(dir).map((f) => f.replace(".json", "")).sort(), [...site.locales].sort());
  for (const l of site.locales) assert.deepEqual(shape(load(l)), shape(load("en")), l);
});

// The browser only gets the keys eleventyComputed.js embeds; one the script reads but isn't embedded would show "undefined".
test("every string the page script reads is embedded in the page", () => {
  const js = new URL("../src/js/", import.meta.url);
  const src = readdirSync(js, { recursive: true }).filter((f) => f.endsWith(".js")).map((f) => readFileSync(new URL(f, js), "utf8")).join("\n");
  const i18n = Object.fromEntries(site.locales.map((l) => [l, load(l)]));
  const reads = [...src.matchAll(/\bt\.(\w+)(?:\.(\w+))?/g)];
  assert.ok(reads.length > 50);
  for (const lang of site.locales) {
    const s = computed.strings({ i18n, lang });
    for (const [path, a, b] of reads) assert.notEqual(b ? s[a]?.[b] : s[a], undefined, `${lang}: ${path}`);
  }
});
