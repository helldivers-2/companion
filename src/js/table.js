// Shared by the sortable, filterable tables (planets, items, stratagems). `sort` is each page's { key, dir }, changed in place.

// Filters and sort live in the query string so a view can be shared or reloaded. Returns the params for page-specific ones.
export function readUrl(form, fields, sort, valid) {
  const u = new URLSearchParams(location.search);
  for (const k of fields) form.elements[k].value = u.get(k) ?? ""; // unknown values fall back to "All"
  const [key, dir] = (u.get("sort") ?? "").split(":");
  if (valid(key)) Object.assign(sort, { key, dir: dir === "asc" ? 1 : dir === "desc" ? -1 : sort.dir });
  return u;
}

// `extra` adds page-specific params before the sort; the default sort is left out of the URL.
export function writeUrl(f, fields, sort, initial, extra) {
  const u = new URLSearchParams();
  for (const k of fields) if (f.get(k)) u.set(k, f.get(k));
  extra?.(u);
  if (sort.key !== initial.key || sort.dir !== initial.dir) u.set("sort", `${sort.key}:${sort.dir > 0 ? "asc" : "desc"}`);
  history.replaceState(null, "", u.size ? `?${u}` : location.pathname);
}

export function markSort(root, sort) {
  for (const th of root.querySelectorAll("th[data-sort]")) {
    th.setAttribute("aria-sort", th.dataset.sort === sort.key ? (sort.dir > 0 ? "ascending" : "descending") : "none");
  }
}

// Live region: rewriting the same text would announce it again.
export function setCount(el, text) {
  if (el.textContent !== text) el.textContent = text;
}

// Filters re-render after typing pauses; a header click sorts by its column, a second click flips it.
// A new column starts at `firstDir(th)`.
export function bindTable(form, head, sort, render, firstDir) {
  let typing;
  form.addEventListener("input", () => { clearTimeout(typing); typing = setTimeout(render, 150); });
  form.addEventListener("submit", (e) => e.preventDefault());
  head.addEventListener("click", (e) => {
    const th = e.target.closest("th[data-sort]");
    if (!th) return;
    const key = th.dataset.sort;
    Object.assign(sort, { key, dir: sort.key === key ? -sort.dir : firstDir(th) });
    render();
  });
}

// Numeric columns start with the biggest value.
export const numFirst = (th) => (th.classList.contains("num") ? -1 : 1);
