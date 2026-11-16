import { get } from "../api.js";
import { dispatchHtml, esc, icon } from "../format.js";
import { lang, t } from "../i18n.js";

const SHOWN = 50;
// Headlines come in the page language, with older English ones mixed in, so each locale lists both.
const won = new RegExp(t.js.won, "i"), lost = new RegExp(t.js.lost, "i");
const outcome = (msg) => (lost.test(msg) ? " failed" : won.test(msg) ? " won" : "");
const dateFmt = new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short" });

export default async function dispatches() {
  const list = await get("/api/v2/dispatches", 300);
  document.getElementById("dispatches").innerHTML = list
    .filter((d) => d.message && !Number.isNaN(Date.parse(d.published))) // one bad date would throw in dateFmt and blank the feed
    .sort((a, b) => Date.parse(b.published) - Date.parse(a.published))
    .slice(0, SHOWN)
    .map((d) => `<li class="card dispatch${outcome(d.message)}">${icon("clock")} <time datetime="${esc(d.published)}">${dateFmt.format(new Date(d.published))}</time><p>${dispatchHtml(d.message)}</p></li>`)
    .join("") || `<li class="card muted">${icon("clock")} ${t.js.noDispatches}</li>`;
}
