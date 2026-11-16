import { get } from "../api.js";
import { esc, icon, slug, steamHtml } from "../format.js";
import { lang, t } from "../i18n.js";

const dateFmt = new Intl.DateTimeFormat(lang, { dateStyle: "medium" });
let shown = "";

export default async function news() {
  const list = (await get("/api/v1/steam", 3600))
    .filter((n) => n.title && !Number.isNaN(Date.parse(n.publishedAt)))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  // The feed changes about once a day; re-rendering on every refresh would collapse open posts and lose the reader's place.
  const key = list.map((n) => n.id).join();
  if (key === shown) return;
  shown = key;
  const target = location.hash.slice(1);
  document.getElementById("news").innerHTML = list.map((n, i) => {
    const id = `news-${slug(n.id)}`;
    const open = target ? target === id : i === 0;
    return `<li class="card"><details class="note" id="${id}"${open ? " open" : ""}>
      <summary>${icon("caret-right")} <h2>${esc(n.title)}</h2>
        <p class="muted">${icon("clock")} <time datetime="${esc(n.publishedAt)}">${dateFmt.format(new Date(n.publishedAt))}</time>${n.author ? `, ${esc(n.author)}` : ""}</p></summary>
      <div class="steam">${steamHtml(n.content)}</div>
      ${/^https:\/\//.test(n.url) ? `<p><a href="${esc(n.url)}">${icon("arrow-square-out")} ${t.js.readOnSteam}</a></p>` : ""}
    </details></li>`;
  }).join("") || `<li class="card muted">${icon("clock")} ${t.js.noNews}</li>`;
  if (target) document.getElementById(target)?.scrollIntoView();
}
