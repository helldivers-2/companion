import { get } from "../api.js";
import { date, esc, icon, newestFirst, slug, steamHtml } from "../format.js";
import { lang, t } from "../i18n.js";

const dateFmt = new Intl.DateTimeFormat(lang, { dateStyle: "medium" });
let shown = "";

export default async function news() {
  const list = newestFirst((await get("/api/v1/steam", 3600)).filter((n) => n.title), "publishedAt");
  // The feed changes about once a day; re-rendering on every refresh would collapse open posts and lose the reader's place.
  const key = list.map((n) => n.id).join();
  if (key === shown) return;
  shown = key;
  const target = location.hash.slice(1);
  document.getElementById("news").innerHTML = list.map((n, i) => {
    const id = `news-${slug(n.id)}`;
    const open = target ? target === id : i === 0;
    return `<li><details class="note" id="${id}"${open ? " open" : ""}>
      <summary><h2>${esc(n.title)}</h2>
        <p class="muted">${icon("clock")} ${date(n.publishedAt, dateFmt)}${n.author ? `, ${esc(n.author)}` : ""}</p></summary>
      <div class="steam">${steamHtml(n.content)}</div>
      ${/^https:\/\//.test(n.url) ? `<p><a href="${esc(n.url)}">${icon("arrow-square-out")} ${t.js.readOnSteam}</a></p>` : ""}
    </details></li>`;
  }).join("") || `<li class="card muted">${icon("clock")} ${t.js.noNews}</li>`;
  if (target) document.getElementById(target)?.scrollIntoView();
}
