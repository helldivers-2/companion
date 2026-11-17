import { fill, lang } from "../i18n.js";

// The tables are built at deploy time; this only hides, orders and counts their rows.
const compare = new Intl.Collator(lang, { numeric: true }).compare;
const figure = (s) => Number(s.replace(/,/g, "").match(/\d+(?:\.\d+)?/)?.[0] ?? NaN);
let sort = { key: "name", dir: 1 };
const form = () => document.getElementById("item-filters");

// Filters and sort live in the query string so a view can be shared or reloaded.
function readUrl() {
  const u = new URLSearchParams(location.search);
  const el = form().elements;
  for (const k of ["q", "type", "unlock"]) el[k].value = u.get(k) ?? ""; // unknown values fall back to "All"
  const [key, dir] = (u.get("sort") ?? "").split(":");
  if (document.querySelector(`th[data-sort="${CSS.escape(key)}"]`)) sort = { key, dir: dir === "desc" ? -1 : 1 };
}

function writeUrl(f) {
  const u = new URLSearchParams();
  for (const k of ["q", "type", "unlock"]) if (f.get(k)) u.set(k, f.get(k));
  if (sort.key !== "name" || sort.dir !== 1) u.set("sort", `${sort.key}:${sort.dir > 0 ? "asc" : "desc"}`);
  history.replaceState(null, "", u.size ? `?${u}` : location.pathname);
}

function render() {
  const f = new FormData(form());
  const q = f.get("q").trim().toLowerCase();
  let shown = 0, total = 0;
  for (const section of document.querySelectorAll("section[data-cat]")) {
    const tbody = section.querySelector("tbody");
    const th = section.querySelector(`th[data-sort="${CSS.escape(sort.key)}"]`);
    const rows = [...tbody.rows];
    // sort every table that has the column; the rest keep their by-name order
    if (th) {
      const i = th.cellIndex, numeric = th.classList.contains("num");
      const value = (r) => (numeric ? figure(r.cells[i].textContent) : r.cells[i].textContent.trim());
      rows.sort((a, b) => { // rows without a figure go last in either direction
        const x = value(a), y = value(b);
        if (numeric) return Number.isNaN(x) || Number.isNaN(y) ? Number.isNaN(x) - Number.isNaN(y) : sort.dir * (x - y) || compare(a.cells[0].textContent, b.cells[0].textContent);
        return sort.dir * compare(x, y) || compare(a.cells[0].textContent, b.cells[0].textContent);
      });
      tbody.append(...rows);
    }
    for (const th of section.querySelectorAll("th[data-sort]")) {
      th.setAttribute("aria-sort", th.dataset.sort === sort.key ? (sort.dir > 0 ? "ascending" : "descending") : "none");
    }
    let n = 0;
    for (const r of rows) {
      r.hidden = !((!f.get("unlock") || r.dataset.unlock === f.get("unlock")) && (!q || r.textContent.toLowerCase().includes(q)));
      n += !r.hidden;
    }
    section.hidden = !n || Boolean(f.get("type")) && section.dataset.cat !== f.get("type");
    total += rows.length;
    if (!section.hidden) shown += n;
  }
  writeUrl(f);
  const count = document.getElementById("item-count");
  const text = fill(count.dataset.fmt, { n: shown, total });
  if (count.textContent !== text) count.textContent = text;
  document.getElementById("item-empty").hidden = shown > 0;
}

if (document.body.dataset.page === "items") {
  readUrl();
  let typing;
  form().addEventListener("input", () => { clearTimeout(typing); typing = setTimeout(render, 150); });
  form().addEventListener("submit", (e) => e.preventDefault());
  document.querySelector("main").addEventListener("click", (e) => {
    const th = e.target.closest("th[data-sort]");
    if (!th) return;
    const key = th.dataset.sort;
    sort = { key, dir: sort.key === key ? -sort.dir : th.classList.contains("num") ? -1 : 1 };
    render();
  });
  render();
}
