import { fill, lang } from "../i18n.js";

const compare = new Intl.Collator(lang).compare;
const keys = ["name", "category", "cooldown", "uses", "unlock"];
const text = (key) => key === "name" || key === "category";
let sort = { key: "name", dir: 1 };
let bound = false;
const form = () => document.getElementById("stratagem-filters");

// Filters and sort live in the query string so a view can be shared or reloaded.
function readUrl() {
  const u = new URLSearchParams(location.search);
  const el = form().elements;
  el.q.value = u.get("q") ?? "";
  el.category.value = u.get("category") ?? ""; // unknown categories fall back to "All"
  const [key, dir] = (u.get("sort") ?? "").split(":");
  if (keys.includes(key)) sort = { key, dir: dir === "desc" ? -1 : 1 };
}

function writeUrl(f) {
  const u = new URLSearchParams();
  if (f.get("q")) u.set("q", f.get("q"));
  if (f.get("category")) u.set("category", f.get("category"));
  if (sort.key !== "name" || sort.dir !== 1) u.set("sort", `${sort.key}:${sort.dir > 0 ? "asc" : "desc"}`);
  history.replaceState(null, "", u.size ? `?${u}` : location.pathname);
}

// The table is rendered at build time; this only hides and reorders its rows.
function render() {
  const f = new FormData(form());
  const q = f.get("q").trim().toLowerCase();
  const category = f.get("category");
  const body = document.getElementById("stratagem-rows");
  const rows = [...body.querySelectorAll("tr[data-name]")];
  // Rows without a value (a cooldown or unlock the wiki lacks) go last in either direction.
  const val = (r) => { const v = r.dataset[sort.key]; return v === "" ? null : text(sort.key) ? v : Number(v); };
  rows.sort((a, b) => {
    const [x, y] = [val(a), val(b)];
    if (x === null || y === null) return (x === null) - (y === null) || compare(a.dataset.name, b.dataset.name);
    return sort.dir * (text(sort.key) ? compare(x, y) : x - y) || compare(a.dataset.name, b.dataset.name);
  });
  let shown = 0;
  for (const r of rows) {
    r.hidden = !!(category && r.dataset.category !== category) || !!(q && !r.dataset.q.includes(q));
    shown += !r.hidden;
  }
  body.append(...rows);
  writeUrl(f);
  for (const th of document.querySelectorAll("th[data-sort]")) {
    th.setAttribute("aria-sort", th.dataset.sort === sort.key ? (sort.dir > 0 ? "ascending" : "descending") : "none");
  }
  document.getElementById("stratagem-none").hidden = shown > 0;
  const count = document.getElementById("stratagem-count");
  const line = fill(count.dataset.template, { n: shown, total: rows.length });
  if (count.textContent !== line) count.textContent = line; // live region: only announce a change
}

export default function stratagemsPage() {
  if (bound) return; // static page: the periodic refresh has nothing to reload
  bound = true;
  readUrl();
  let typing;
  form().addEventListener("input", () => { clearTimeout(typing); typing = setTimeout(render, 150); });
  form().addEventListener("submit", (e) => e.preventDefault());
  document.querySelector("table.stratagems thead").addEventListener("click", (e) => {
    const th = e.target.closest("th[data-sort]");
    if (!th) return;
    const key = th.dataset.sort;
    sort = { key, dir: sort.key === key ? -sort.dir : 1 };
    render();
  });
  render();
}
