// Mirrors the planet pictures from the Helldivers Wiki's Planets table: `npm run planets`.
// The live data comes from the API, so src/_data/planetImages.json maps a planet's name key (see `key`) to its file.
import { writeFileSync } from "node:fs";
import { cargo, key, syncImages } from "./wiki.js";

const rows = (await cargo("Planets", "_pageName=name,planet_image=image")).filter((r) => r.image);
if (rows.length < 200) throw new Error(`Only ${rows.length} planets, the wiki's table has probably changed`); // keep the committed set
const images = await syncImages(rows.map((r) => r.image), "planets", 128);
const files = Object.fromEntries(rows.map((r) => [key(r.name), images.get(r.image)?.file]).filter(([, f]) => f).sort());
writeFileSync(new URL("../src/_data/planetImages.json", import.meta.url), `${JSON.stringify({ artists: images.artists, files }, null, 1)}\n`);
console.log(`${Object.keys(files).length} planet images mapped`);
