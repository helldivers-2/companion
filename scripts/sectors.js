// Copies the sector outlines from the Helldivers Wiki's sector map gadget into src/_data/sectors.json: `npm run sectors`.
// The gadget is by User:TauCetiV under the GNU GPL; sectors.json keeps that notice, and the map page credits it.
import { writeFileSync } from "node:fs";
import { api } from "./wiki.js";

const PAGE = "MediaWiki:Gadget-SectorSelectMap.js";
const page = (await api({ action: "query", prop: "revisions", titles: PAGE, rvprop: "content", rvslots: "main" })).query.pages[0];
const js = page.revisions[0].slots.main.content;

// The gadget draws a 1024 px map whose planets sit at 512.5 + 504 * position (y flipped), fitted so 268 of the 271
// placed planets land in their own sector; the rest are planets the game moved. map.js projects to 500 + 450 * position.
const toMap = (v) => (500 + ((Number(v) - 512.5) * 450) / 504).toFixed(1);
const paths = {};
for (const [, attrs] of js.matchAll(/<path\b([^>]*)>/g)) {
  const id = attrs.match(/\sid="([^"]+)"/)?.[1],
    d = attrs.match(/\sd="([^"]+)"/)?.[1];
  if (!id || !d) continue;
  paths[id.replaceAll("_", " ")] = d.replace(/(-?[\d.]+),(-?[\d.]+)/g, (_, x, y) => `${toMap(x)} ${toMap(y)}`);
}
if (Object.keys(paths).length < 50) throw new Error(`Only ${Object.keys(paths).length} sectors, the gadget has probably changed`); // keep the committed set

const sorted = Object.fromEntries(Object.entries(paths).sort(([a], [b]) => a.localeCompare(b)));
const data = {
  source: `https://helldivers.wiki.gg/wiki/${PAGE}`,
  author: "TauCetiV",
  licence: "GNU General Public License, https://www.gnu.org/licenses/gpl.html",
  paths: sorted,
};
writeFileSync(new URL("../src/_data/sectors.json", import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
console.log(`${Object.keys(paths).length} sector outlines`);
