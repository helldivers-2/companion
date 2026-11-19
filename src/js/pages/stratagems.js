import { fill, lang } from "../i18n.js";
import { bindTable, markSort, readUrl, setCount, writeUrl } from "../table.js";

const compare = new Intl.Collator(lang).compare;
const keys = ["name", "category", "cooldown", "uses", "unlock"];
const text = (key) => key === "name" || key === "category";
const FIELDS = ["q", "category"];
const INITIAL = { key: "name", dir: 1 };
const sort = { ...INITIAL };
let sortedBy = null; // filtering alone keeps the order, so only a new sort reorders the rows
const form = () => document.getElementById("stratagem-filters");

// The table is rendered at build time; this only hides and reorders its rows.
function render() {
  const f = new FormData(form());
  const q = f.get("q").trim().toLowerCase();
  const category = f.get("category");
  const body = document.getElementById("stratagem-rows");
  const rows = [...body.querySelectorAll("tr[data-name]")];
  if (sortedBy !== `${sort.key}:${sort.dir}`) {
    sortedBy = `${sort.key}:${sort.dir}`;
    // Rows without a value (a cooldown or unlock the wiki lacks) go last in either direction.
    const val = (r) => {
      const v = r.dataset[sort.key];
      return v === "" ? null : text(sort.key) ? v : Number(v);
    };
    rows.sort((a, b) => {
      const [x, y] = [val(a), val(b)];
      if (x === null || y === null) return (x === null) - (y === null) || compare(a.dataset.name, b.dataset.name);
      return sort.dir * (text(sort.key) ? compare(x, y) : x - y) || compare(a.dataset.name, b.dataset.name);
    });
    body.append(...rows);
  }
  let shown = 0;
  for (const r of rows) {
    r.hidden = !!(category && r.dataset.category !== category) || !!(q && !r.dataset.q.includes(q));
    shown += !r.hidden;
  }
  writeUrl(f, FIELDS, sort, INITIAL);
  markSort(document, sort);
  document.getElementById("stratagem-none").hidden = shown > 0;
  const count = document.getElementById("stratagem-count");
  setCount(count, fill(count.dataset.fmt, { n: shown, total: rows.length }));
}

// Static page: it binds itself, so the "Updated" status of the live pages stays off it.
if (document.body.dataset.page === "stratagems") {
  readUrl(form(), FIELDS, sort, (key) => keys.includes(key));
  bindTable(form(), document.querySelector("table.stratagems thead"), sort, render, () => 1);
  render();
}
