// Refreshes src/_data/items.json from the Helldivers Wiki's Cargo tables (https://helldivers.wiki.gg, CC BY-NC-SA 4.0).
// The community JSON repo (helldivers-2/json) is MIT but its item files stopped in mid-2025 and carry no Superstore prices.
// Run with `npm run items`; the page templates only read the committed JSON.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import site from "../src/_data/site.json" with { type: "json" };

const API = "https://helldivers.wiki.gg/api.php";

const ENTITIES = { "&nbsp;": " ", "&bull;": "•", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"' };
// Cargo hands back wikitext with HTML mixed in; keep only the words. `br` is where one cell holds several lines.
export const plain = (s, br = " / ") =>
  String(s ?? "")
    .replace(/<(?:br|hr)\s*\/?>/gi, br)
    .replace(/<[^>]+>/g, "")
    .replace(/\[\[File:[^\]]*\]\]/g, "")
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1")
    .replace(/'{2,}/g, "")
    .replace(/&\w+;/g, (e) => ENTITIES[e] ?? e)
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\s/]+|[\s/]+$/g, "");

export function source(raw) {
  const name = plain(raw).replace(/\s*P\d+$/, ""); // the page tag is a <small> glued to the name
  if (!name) return null;
  if (/\[\[Superstore\]\]/.test(raw)) return { kind: "superstore" };
  if (/Warbond/.test(raw)) return { kind: "warbond", name, page: Number(raw.match(/title="Page (\d+)"/)?.[1]) || null };
  return { kind: "other", name };
}

export function cost(raw) {
  const currency = /Medal\.svg/.test(raw) ? "medals" : /Super Credit\.svg/.test(raw) ? "credits" : /Requisition Slip/.test(raw) ? "slips" : null;
  const amount = Number(plain(raw).match(/\d[\d,]*/)?.[0].replace(/,/g, ""));
  return currency && amount ? { currency, amount } : null; // dollar prices and "exclusive" marks are not in-game costs
}

const CATEGORIES = { "Primary Weapons": "primary", "Secondary Weapons": "secondary", "Support Weapons": "support", Throwables: "throwable" };
const metres = (s) => (/^[\d.]+$/.test(s) ? `${s}m` : s);
const by = (a, b) => a.name.localeCompare(b.name, "en");

// Each argument is the array of Cargo rows from the table of that name.
export function normalise({ weapons, armor, boosters, passives }) {
  const items = { primary: [], secondary: [], support: [], throwable: [], armor: [], booster: [] };
  for (const w of weapons) {
    const cat = CATEGORIES[w["weapon category"]];
    if (!cat) continue;
    items[cat].push({
      name: w.title,
      type: w["weapon type"] || null,
      damage: plain(w.damage),
      rate: plain(w["fire rate"]),
      magazine: plain(w.capacity).replace(/^N\/A$/, ""),
      pen: plain(w["penetration direct"]),
      radius: metres(plain(w.radius)),
      fuse: plain(w.fuse),
      source: source(w.source),
      cost: cost(w.cost),
    });
  }
  const passive = Object.fromEntries(passives.map((p) => [p.title, plain(p.description, " ")]));
  // A set is a helmet row plus a body row; only the body row carries the stats and the passive.
  for (const a of armor.filter((x) => x.type !== "Helmet")) {
    const name = plain(a.passive);
    items.armor.push({
      name: a.title,
      class: a.type.toLowerCase(),
      rating: Number(a.armor) || null,
      speed: Number(a.speed) || null,
      stamina: Number(a["stam regen"]) || null,
      passive: name,
      passiveText: passive[name] ?? "",
      source: source(a.source),
      cost: cost(a.cost),
    });
  }
  for (const b of boosters) items.booster.push({ name: b.title, text: plain(b.description, " "), source: source(b.source), cost: cost(b.cost) });
  for (const list of Object.values(items)) list.sort(by);
  return items;
}

async function table(tables, fields) {
  const url = new URL(API);
  for (const [k, v] of Object.entries({ action: "cargoquery", format: "json", limit: "500", tables, fields })) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { "User-Agent": `${site.client} (${site.contact})` } });
  if (!res.ok) throw new Error(`${tables}: HTTP ${res.status}`);
  const rows = (await res.json()).cargoquery;
  if (!rows?.length) throw new Error(`${tables}: no rows`);
  if (rows.length >= 500) throw new Error(`${tables}: hit the 500-row limit, paginate`);
  return rows.map((r) => r.title);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [weapons, armor, boosters, passives] = await Promise.all([
    table("Weapons", "title,weapon_category,weapon_type,damage,capacity,fire_rate,penetration_direct,radius,fuse,source,cost"),
    table("Armor", "title,type,armor,speed,stam_regen,passive,source,cost"),
    table("Boosters", "title,description,source,cost"),
    table("Armor_Passive", "title,description"),
  ]);
  const items = normalise({ weapons, armor, boosters, passives });
  const data = {
    source: { name: "Helldivers Wiki", url: "https://helldivers.wiki.gg/", licence: "CC BY-NC-SA 4.0", licenceUrl: "https://creativecommons.org/licenses/by-nc-sa/4.0/" },
    fetched: new Date().toISOString().slice(0, 10),
    items,
  };
  writeFileSync(new URL("../src/_data/items.json", import.meta.url), JSON.stringify(data, null, 1) + "\n");
  console.log(Object.entries(items).map(([k, v]) => `${k} ${v.length}`).join(", "));
}
