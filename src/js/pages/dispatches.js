import { get } from "../api.js";
import { dispatchHtml, esc, icon } from "../format.js";

const SHOWN = 50;
const outcome = (msg) => (/MAJOR ORDER WON|DIRECTIVE COMPLETED/i.test(msg) ? " won" : /MAJOR ORDER FAILED/i.test(msg) ? " failed" : "");
const dateFmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

export default async function dispatches() {
  const list = await get("/api/v2/dispatches", 300);
  document.getElementById("dispatches").innerHTML = list
    .filter((d) => d.message && !Number.isNaN(Date.parse(d.published))) // one bad date would throw in dateFmt and blank the feed
    .sort((a, b) => Date.parse(b.published) - Date.parse(a.published))
    .slice(0, SHOWN)
    .map((d) => `<li class="dispatch${outcome(d.message)}">${icon("clock")} <time datetime="${esc(d.published)}">${dateFmt.format(new Date(d.published))}</time><p>${dispatchHtml(d.message)}</p></li>`)
    .join("") || `<li class="muted">${icon("clock")} No dispatches from Super Earth yet.</li>`;
}
