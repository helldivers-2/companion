import { get } from "../api.js";
import { esc, held, icon, liberation, liberationText, num, ownerBadge, pct, record, regainsLine, regionSize, titleCase } from "../format.js";
import { fill, lang, t } from "../i18n.js";
import { bindTable, markSort, numFirst, readUrl, setCount, writeUrl } from "../table.js";

let planets = [];
const libRank = (p) => (held(p) ? -1 : liberation(p)); // held planets sink below active fights
const FIELDS = ["q", "owner"];
const INITIAL = { key: "players", dir: -1 };
const sort = { ...INITIAL };
const open = new Set(); // planet indexes with their detail row shown
let scrollTo = null;
let bound = false;
const compare = new Intl.Collator(lang).compare;
const sorters = {
  name: (a, b) => compare(a.name, b.name),
  sector: (a, b) => compare(a.sector, b.sector),
  owner: (a, b) => compare(a.currentOwner, b.currentOwner),
  biome: (a, b) => compare(a.biome?.name ?? "", b.biome?.name ?? ""),
  players: (a, b) => a.statistics.playerCount - b.statistics.playerCount,
  liberation: (a, b) => libRank(a) - libRank(b),
};
const form = () => document.getElementById("planet-filters");
// Same as `key` in scripts/wiki.js, which names the keys of the page's planet-images map.
export const planetKey = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function render() {
  const f = new FormData(form());
  const q = f.get("q").trim().toLowerCase();
  const owner = f.get("owner");
  const rows = planets
    .filter((p) => !owner || p.currentOwner === owner)
    .filter((p) => !f.get("active") || p.statistics.playerCount > 0)
    .filter((p) => !q || [p.name, p.sector, p.biome?.name, ...p.hazards.map((h) => h.name)].join(" ").toLowerCase().includes(q))
    .sort((a, b) => sort.dir * sorters[sort.key](a, b) || compare(a.name, b.name));
  writeUrl(f, FIELDS, sort, INITIAL, (u) => {
    if (f.get("active")) u.set("active", "");
    if (open.size) u.set("open", [...open].join(","));
  });
  markSort(document, sort);
  setCount(document.getElementById("planet-count"), fill(t.js.count, { n: rows.length, total: planets.length }));

  const focused = document.activeElement?.dataset.planet; // the 60 s refresh rebuilds the rows
  document.getElementById("planet-rows").innerHTML =
    rows
      .map((p) => {
        const owner = ownerBadge(p);
        const hazards = p.hazards.filter((h) => h.name !== "None");
        return `<tr>
      <th scope="row">
        <button type="button" class="expand" data-planet="${p.index}" aria-expanded="${open.has(p.index)}">${icon("caret-right")} <span translate="no">${esc(p.name)}</span></button>${p.event ? ` <span class="badge defense">${t.js.underAttack}</span>` : ""}
        <span class="narrow sub">${owner} ${esc([p.sector, p.biome?.name, ...hazards.map((h) => h.name)].filter(Boolean).join(", "))}</span>
      </th>
      <td class="wide">${esc(p.sector)}</td>
      <td class="wide">${owner}</td>
      <td class="wide" lang="en" title="${esc(p.biome?.description)}">${esc(p.biome?.name ?? "")}</td>
      <td class="wide">${hazards.map((h) => `<span lang="en" title="${esc(h.description)}">${esc(h.name)}</span>`).join(", ") || `<span class="muted">${t.js.none}</span>`}</td>
      <td class="num">${num(p.statistics.playerCount)}</td>
      <td class="num">${liberationText(p)}</td>
    </tr>${open.has(p.index) ? details(p, hazards) : ""}`;
      })
      .join("") || `<tr><td colspan="7" class="muted">${t.js.noMatch}</td></tr>`;
  if (focused) document.querySelector(`[data-planet="${focused}"]`)?.focus({ preventScroll: true });
  if (scrollTo !== null) document.querySelector(`[data-planet="${scrollTo}"]`)?.scrollIntoView({ block: "center" });
  scrollTo = null;
}

let images;

function details(p, hazards) {
  const img = (images ??= JSON.parse(document.getElementById("planet-images")?.textContent || "{}"))[planetKey(p.name)];
  const regions = (p.regions ?? []).map(
    (r) => `<li>${esc(titleCase(r.name))}${r.size ? ` <span class="muted">${esc(regionSize(r.size))}</span>` : ""}
    ${held(p) ? "" : `${r.isAvailable === false ? `<span class="badge">${t.js.locked}</span>` : ""} ${r.health == null ? "" : `<span class="pct">${pct(1 - r.health / r.maxHealth)}</span>`}`}${r.players ? ` <span class="muted">${fill(t.js.helldivers, { n: num(r.players) })}</span>` : ""}</li>`,
  );
  return `<tr class="detail"><td colspan="7"><div class="detail-grid">
    <section>
      ${img ? `<img class="planet-pic" src="/img/planets/${esc(img)}" alt="" width="64" height="64">` : ""}
      ${p.biome ? `<h3 lang="en">${esc(p.biome.name)}</h3><p lang="en">${esc(p.biome.description)}</p>` : ""}
      ${hazards.length ? `<h3>${t.js.hazards}</h3><ul>${hazards.map((h) => `<li lang="en"><strong>${esc(h.name)}</strong> ${esc(h.description)}</li>`).join("")}</ul>` : ""}
      ${regainsLine(p)}
      ${regions.length ? `<h3>${t.js.regions}</h3><ul class="regions">${regions.join("")}</ul>` : ""}
    </section>
    <section><h3>${t.js.battleRecord}</h3>${record(p.statistics)}</section>
  </div></td></tr>`;
}

export default async function planetsPage() {
  if (!bound) {
    bound = true;
    const u = readUrl(form(), FIELDS, sort, (key) => Object.hasOwn(sorters, key));
    form().elements.active.checked = u.has("active");
    for (const i of (u.get("open") ?? "").split(",").filter(Boolean)) open.add(Number(i));
    scrollTo = open.size === 1 ? [...open][0] : null; // a shared planet link should land on that planet
    document.getElementById("planet-rows").addEventListener("click", (e) => {
      const i = Number(e.target.closest("[data-planet]")?.dataset.planet);
      if (Number.isNaN(i)) return;
      if (!open.delete(i)) open.add(i);
      render();
    });
    bindTable(form(), document.querySelector("table.planets thead"), sort, render, numFirst);
  }
  const list = await get("/api/v1/planets");
  planets = list.filter((p) => !p.disabled);
  render();
}
