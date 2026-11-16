import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import site from "../src/_data/site.json" with { type: "json" };

// Every locale needs the same keys as English, or the page shows "undefined"; "links" may stay empty in English.
const shape = (o) => (o && typeof o === "object" && !Array.isArray(o) ? Object.fromEntries(Object.keys(o).sort().map((k) => [k, k === "links" ? null : shape(o[k])])) : Array.isArray(o) ? o.length : null);
const dir = new URL("../src/_data/i18n/", import.meta.url);
const load = (l) => JSON.parse(readFileSync(new URL(`${l}.json`, dir)));

test("every locale file matches English and site.locales", () => {
  assert.deepEqual(readdirSync(dir).map((f) => f.replace(".json", "")).sort(), [...site.locales].sort());
  for (const l of site.locales) assert.deepEqual(shape(load(l)), shape(load("en")), l);
});
