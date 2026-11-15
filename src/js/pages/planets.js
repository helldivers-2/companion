import { get } from "../api.js";
import { esc, liberation, num, pct, slug } from "../format.js";

let planets = [];
const held = (p) => p.currentOwner === "Humans" && !p.event;
const libRank = (p) => (held(p) ? -1 : liberation(p)); // held planets sink below active fights
let sort = { key: "players", dir: -1 };
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
}

function writeUrl(f) {
  const u = new URLSearchParams();
  if (f.get("q")) u.set("q", f.get("q"));
  if (f.get("owner")) u.set("owner", f.get("owner"));
  if (f.get("active")) u.set("active", "");
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
  const text = `${rows.length} of ${planets.length} planets`;
  if (count.textContent !== text) count.textContent = text; // live region: the 60 s refresh must not re-announce it

  document.getElementById("planet-rows").innerHTML = rows.map((p) => {
    const owner = `<span class="tag ${slug(p.currentOwner)}">${esc(p.currentOwner)}</span>`;
    const hazards = p.hazards.filter((h) => h.name !== "None");
    return `<tr>
      <th scope="row">
        <span translate="no">${esc(p.name)}</span>${p.event ? ` <span class="tag defense">Under attack</span>` : ""}
        <span class="narrow sub">${owner} ${esc([p.sector, p.biome?.name, ...hazards.map((h) => h.name)].filter(Boolean).join(", "))}</span>
      </th>
      <td class="wide">${esc(p.sector)}</td>
      <td class="wide">${owner}</td>
      <td class="wide" title="${esc(p.biome?.description)}">${esc(p.biome?.name ?? "")}</td>
      <td class="wide">${hazards.map((h) => `<span title="${esc(h.description)}">${esc(h.name)}</span>`).join(", ") || `<span class="muted">None</span>`}</td>
      <td class="num">${num(p.statistics.playerCount)}</td>
      <td class="num">${held(p) ? "Held" : pct(liberation(p))}</td>
    </tr>`;
  }).join("") || `<tr><td colspan="7" class="muted">No planets match these filters.</td></tr>`;
}

export default async function planetsPage() {
  if (!form().dataset.bound) {
    form().dataset.bound = "1";
    readUrl();
    form().addEventListener("input", render);
    form().addEventListener("submit", (e) => e.preventDefault());
    document.querySelector("table.planets thead").addEventListener("click", (e) => {
      const key = e.target.closest("th[data-sort]")?.dataset.sort;
      if (!key) return;
      const numeric = key === "players" || key === "liberation";
      sort = { key, dir: sort.key === key ? -sort.dir : numeric ? -1 : 1 };
      render();
    });
  }
  const list = await get("/api/v1/planets");
  planets = list.filter((p) => !p.disabled);
  render();
}
