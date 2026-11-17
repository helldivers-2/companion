import { fill, lang } from "../i18n.js";
import { bindTable, markSort, numFirst, readUrl, setCount, writeUrl } from "../table.js";

// The tables are built at deploy time; this only hides, orders and counts their rows.
const compare = new Intl.Collator(lang, { numeric: true }).compare;
const figure = (s) => Number(s.replace(/,/g, "").match(/\d+(?:\.\d+)?/)?.[0] ?? NaN);
const FIELDS = ["q", "type", "unlock"];
const INITIAL = { key: "name", dir: 1 };
const sort = { ...INITIAL };
let sortedBy = null; // filtering alone keeps the order, so only a new sort reorders the rows
const form = () => document.getElementById("item-filters");

function render() {
  const f = new FormData(form());
  const q = f.get("q").trim().toLowerCase();
  const resort = sortedBy !== `${sort.key}:${sort.dir}`;
  sortedBy = `${sort.key}:${sort.dir}`;
  let shown = 0, total = 0;
  for (const section of document.querySelectorAll("section[data-cat]")) {
    const tbody = section.querySelector("tbody");
    const th = section.querySelector(`th[data-sort="${CSS.escape(sort.key)}"]`);
    const rows = [...tbody.rows];
    // sort every table that has the column; the rest keep their by-name order
    if (th && resort) {
      const i = th.cellIndex, numeric = th.classList.contains("num");
      const value = (r) => (numeric ? figure(r.cells[i].textContent) : r.cells[i].textContent.trim());
      rows.sort((a, b) => { // rows without a figure go last in either direction
        const x = value(a), y = value(b);
        if (numeric) return Number.isNaN(x) || Number.isNaN(y) ? Number.isNaN(x) - Number.isNaN(y) : sort.dir * (x - y) || compare(a.cells[0].textContent, b.cells[0].textContent);
        return sort.dir * compare(x, y) || compare(a.cells[0].textContent, b.cells[0].textContent);
      });
      tbody.append(...rows);
    }
    markSort(section, sort);
    let n = 0;
    for (const r of rows) {
      r.hidden = !((!f.get("unlock") || r.dataset.unlock === f.get("unlock")) && (!q || r.textContent.toLowerCase().includes(q)));
      n += !r.hidden;
    }
    section.hidden = !n || Boolean(f.get("type")) && section.dataset.cat !== f.get("type");
    total += rows.length;
    if (!section.hidden) shown += n;
  }
  writeUrl(f, FIELDS, sort, INITIAL);
  const count = document.getElementById("item-count");
  setCount(count, fill(count.dataset.fmt, { n: shown, total }));
  document.getElementById("item-empty").hidden = shown > 0;
}

if (document.body.dataset.page === "items") {
  readUrl(form(), FIELDS, sort, (key) => document.querySelector(`th[data-sort="${CSS.escape(key)}"]`));
  bindTable(form(), document.querySelector("main"), sort, render, numFirst);
  render();
}
