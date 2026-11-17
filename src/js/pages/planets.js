import { get } from "../api.js";
import { esc, faction, held, icon, liberation, num, pct, record, regainsLine, regionSize, slug, titleCase } from "../format.js";
import { fill, t } from "../i18n.js";

let planets = [];
const libRank = (p) => (held(p) ? -1 : liberation(p)); // held planets sink below active fights
let sort = { key: "players", dir: -1 };
const open = new Set(); // planet indexes with their detail row shown
let scrollTo = null;
const sorters = {
  name: (a, b) => a.name.localeCompare(b.name),
  sector: (a, b) => a.sector.localeCompare(b.sector),
  owner: (a, b) => a.currentOwner.localeCompare(b.currentOwner),
  biome: (a, b) => (a.biome?.name ?? "").localeCompare(b.biome?.name ?? ""),
  players: (a, b) => a.statistics.playerCount - b.statistics.playerCount,
  liberation: (a, b) => libRank(a) - libRank(b),
};
const form = () => document.getElementById("planet-filters");

// Filters and sort live in the query string so a view can be shared or reloaded.
function readUrl() {
  const u = new URLSearchParams(location.search);
  const el = form().elements;
  el.q.value = u.get("q") ?? "";
  el.owner.value = u.get("owner") ?? ""; // unknown owners fall back to "All"
  el.active.checked = u.has("active");
  const [key, dir] = (u.get("sort") ?? "").split(":");
  if (Object.hasOwn(sorters, key)) sort = { key, dir: dir === "asc" ? 1 : -1 };
  for (const i of (u.get("open") ?? "").split(",").filter(Boolean)) open.add(Number(i));
  scrollTo = open.size === 1 ? [...open][0] : null; // a shared planet link should land on that planet
}

function writeUrl(f) {
  const u = new URLSearchParams();
  if (f.get("q")) u.set("q", f.get("q"));
  if (f.get("owner")) u.set("owner", f.get("owner"));
  if (f.get("active")) u.set("active", "");
  if (open.size) u.set("open", [...open].join(","));
  if (sort.key !== "players" || sort.dir !== -1) u.set("sort", `${sort.key}:${sort.dir > 0 ? "asc" : "desc"}`);
  history.replaceState(null, "", u.size ? `?${u}` : location.pathname);
}

function render() {
  const f = new FormData(form());
  const q = f.get("q").trim().toLowerCase();
  const owner = f.get("owner");
  const rows = planets
    .filter((p) => !owner || p.currentOwner === owner)
    .filter((p) => !f.get("active") || p.statistics.playerCount > 0)
    .filter((p) => !q || [p.name, p.sector, p.biome?.name, ...p.hazards.map((h) => h.name)].join(" ").toLowerCase().includes(q))
    .sort((a, b) => sort.dir * sorters[sort.key](a, b) || a.name.localeCompare(b.name));
  writeUrl(f);
  for (const th of document.querySelectorAll("th[data-sort]")) {
    th.setAttribute("aria-sort", th.dataset.sort === sort.key ? (sort.dir > 0 ? "ascending" : "descending") : "none");
  }

  const count = document.getElementById("planet-count");
  const text = fill(t.js.count, { n: rows.length, total: planets.length });
  if (count.textContent !== text) count.textContent = text; // live region: the 60 s refresh must not re-announce it

  const focused = document.activeElement?.dataset.planet; // the 60 s refresh rebuilds the rows
  document.getElementById("planet-rows").innerHTML = rows.map((p) => {
    const owner = `<span class="tag ${slug(p.currentOwner)}">${esc(faction(p.currentOwner))}</span>`;
    const hazards = p.hazards.filter((h) => h.name !== "None");
    return `<tr>
      <th scope="row">
        <button type="button" class="expand" data-planet="${p.index}" aria-expanded="${open.has(p.index)}">${icon("caret-right")} <span translate="no">${esc(p.name)}</span></button>${p.event ? ` <span class="tag defense">${t.js.underAttack}</span>` : ""}
        <span class="narrow sub">${owner} ${esc([p.sector, p.biome?.name, ...hazards.map((h) => h.name)].filter(Boolean).join(", "))}</span>
      </th>
      <td class="wide">${esc(p.sector)}</td>
      <td class="wide">${owner}</td>
      <td class="wide" lang="en" title="${esc(p.biome?.description)}">${esc(p.biome?.name ?? "")}</td>
      <td class="wide">${hazards.map((h) => `<span lang="en" title="${esc(h.description)}">${esc(h.name)}</span>`).join(", ") || `<span class="muted">${t.js.none}</span>`}</td>
      <td class="num">${num(p.statistics.playerCount)}</td>
      <td class="num">${held(p) ? t.js.held : pct(liberation(p))}</td>
    </tr>${open.has(p.index) ? details(p, hazards) : ""}`;
  }).join("") || `<tr><td colspan="7" class="muted">${t.js.noMatch}</td></tr>`;
  if (focused) document.querySelector(`[data-planet="${focused}"]`)?.focus({ preventScroll: true });
  if (scrollTo !== null) document.querySelector(`[data-planet="${scrollTo}"]`)?.scrollIntoView({ block: "center" });
  scrollTo = null;
}

function details(p, hazards) {
  const regions = (p.regions ?? []).map((r) => `<li>${esc(titleCase(r.name))}${r.size ? ` <span class="muted">${esc(regionSize(r.size))}</span>` : ""}
    ${held(p) ? "" : `${r.isAvailable === false ? `<span class="tag">${t.js.locked}</span>` : ""} ${r.health == null ? "" : `<span class="pct">${pct(1 - r.health / r.maxHealth)}</span>`}`}${r.players ? ` <span class="muted">${fill(t.js.helldivers, { n: num(r.players) })}</span>` : ""}</li>`);
  return `<tr class="detail"><td colspan="7"><div class="detail-grid">
    <section>
      ${p.biome ? `<h3 lang="en">${esc(p.biome.name)}</h3><p lang="en">${esc(p.biome.description)}</p>` : ""}
      ${hazards.length ? `<h3>${t.js.hazards}</h3><ul>${hazards.map((h) => `<li lang="en"><strong>${esc(h.name)}</strong> ${esc(h.description)}</li>`).join("")}</ul>` : ""}
      ${regainsLine(p)}
      ${regions.length ? `<h3>${t.js.regions}</h3><ul class="regions">${regions.join("")}</ul>` : ""}
    </section>
    <section><h3>${t.js.battleRecord}</h3>${record(p.statistics)}</section>
  </div></td></tr>`;
}

export default async function planetsPage() {
  if (!form().dataset.bound) {
    form().dataset.bound = "1";
    readUrl();
    let typing;
    form().addEventListener("input", () => { clearTimeout(typing); typing = setTimeout(render, 150); });
    form().addEventListener("submit", (e) => e.preventDefault());
    document.getElementById("planet-rows").addEventListener("click", (e) => {
      const i = Number(e.target.closest("[data-planet]")?.dataset.planet);
      if (Number.isNaN(i)) return;
      if (!open.delete(i)) open.add(i);
      render();
    });
    document.querySelector("table.planets thead").addEventListener("click", (e) => {
      const th = e.target.closest("th[data-sort]");
      if (!th) return;
      const key = th.dataset.sort;
      sort = { key, dir: sort.key === key ? -sort.dir : th.classList.contains("num") ? -1 : 1 };
      render();
    });
  }
  const list = await get("/api/v1/planets");
  planets = list.filter((p) => !p.disabled);
  render();
}
