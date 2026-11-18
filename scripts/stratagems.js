// Refreshes src/_data/stratagems.json from the Helldivers Wiki (CC BY-NC-SA 4.0): `npm run stratagems`.
// The wiki's Cargo table has names, codes, cooldowns and unlock details; the number of uses only exists in
// the game-data module its editors extract from each patch, so it is joined by name.
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const API = "https://helldivers.wiki.gg/api.php";
const FIELDS = "title,permit_type,unlock_level,unlock_cost,source,stratagem_code,stratagem_type,base_cooldown";
const USES_PAGE = "Module:Decodedata-Attacks/stratagems data.json";
const UNLIMITED = 4294967295; // the game's "no limit" value

const strip = (s) => s.replace(/<[^>]*>/g, "").replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1").trim();
const key = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const camel = (s) => s.toLowerCase().replace(/ (\w)/g, (_, c) => c.toUpperCase());
const SOURCE_TYPOS = { Hanger: "Hangar" }; // as spelled on the wiki

function cost(html) {
  const amount = Number(/\d+/.exec(html.replace(/,/g, ""))?.[0] ?? (/free/i.test(html) ? 0 : NaN));
  const currency = /medal/i.test(html) ? "medals" : /requisition/i.test(html) ? "slips" : /super credit/i.test(html) ? "credits" : amount === 0 ? "free" : null;
  return currency ? { currency, amount } : null;
}

function source(html) {
  const name = strip(html.replace(/<small>.*?<\/small>/g, "")).replace(/^N\/A$/, "");
  return name ? { name: SOURCE_TYPOS[name] ?? name, page: Number(/title="Page (\d+)"/.exec(html)?.[1]) || null } : null;
}

// rows: Cargo rows of the Stratagems table; uses: the "stratagems" object of the game-data module.
export function normalise(rows, uses = {}) {
  const useKeys = Object.keys(uses).map((k) => [key(k), uses[k]]).sort((a, b) => b[0].length - a[0].length);
  const out = new Map();
  for (const r of rows) {
    const code = [...r["stratagem code"].matchAll(/Stratagem Arrow (\w+)\.svg/g)].map((m) => m[1].toLowerCase());
    if (!r.title || !code.length) continue;
    const cooldown = parseFloat(r["base cooldown"]);
    // Wiki names carry the designation ("EAT-17 Expendable Anti-Tank"), the game data does not, so match on the ending.
    const n = key(r.title), game = useKeys.find(([k]) => n.endsWith(k))?.[1];
    // Where the module and the wiki disagree on the cooldown, the module is from an older balance pass, so its use count is not trusted either.
    const count = game?.cooldown === cooldown ? game.uses : undefined;
    const item = {
      name: r.title,
      category: { offense: "offensive", "": "mission" }[r["permit type"].toLowerCase()] ?? r["permit type"].toLowerCase(), // objectives carry no permit
      kind: r["stratagem type"] ? camel(r["stratagem type"]) : null,
      code,
      cooldown: Number.isNaN(cooldown) ? null : cooldown,
      uses: count === undefined ? null : count === UNLIMITED ? "unlimited" : count,
      level: Number(r["unlock level"]) || null,
      cost: cost(r["unlock cost"]),
      source: source(r.source),
    };
    // A name can appear several times on the wiki; keep one per name and code, preferring the row with a type.
    const id = `${item.name}|${code}`;
    if (!out.has(id) || (!out.get(id).kind && item.kind)) out.set(id, item);
  }
  return [...out.values()].sort((a, b) => a.name.localeCompare(b.name, "en"));
}

async function get(params) {
  const res = await fetch(`${API}?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`, { headers: { "User-Agent": "helldivers-companion data refresh" } });
  if (!res.ok) throw new Error(`${res.status} from the wiki`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.info);
  return json;
}

async function main() {
  const [cargo, uses] = await Promise.all([
    get({ action: "cargoquery", tables: "Stratagems", fields: FIELDS, limit: "500" }),
    get({ action: "query", prop: "revisions", rvprop: "content|timestamp", rvslots: "main", titles: USES_PAGE }),
  ]);
  const page = uses.query.pages[0].revisions[0];
  const items = normalise(cargo.cargoquery.map((r) => r.title), JSON.parse(page.slots.main.content).stratagems);
  if (items.length < 80) throw new Error(`Only ${items.length} stratagems, the wiki's table has probably changed`); // better to keep the committed file
  writeFileSync(new URL("../src/_data/stratagems.json", import.meta.url), `${JSON.stringify({
    source: { name: "Helldivers Wiki", url: "https://helldivers.wiki.gg/wiki/Stratagems", license: "CC BY-NC-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-nc-sa/4.0/", fetched: new Date().toISOString().slice(0, 10), usesRevision: page.timestamp.slice(0, 10) },
    items,
  }, null, 2)}\n`);
  console.log(`${items.length} stratagems written`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
