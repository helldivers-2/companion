import { get } from "../api.js";
import { date, dispatchHtml, icon, newestFirst } from "../format.js";
import en from "../../_data/i18n/en.json" with { type: "json" };
import { lang, t } from "../i18n.js";

const SHOWN = 50;
// Headlines come in the page language, with older English ones mixed in, so match both.
const won = new RegExp(`${t.js.won}|${en.js.won}`, "i"), lost = new RegExp(`${t.js.lost}|${en.js.lost}`, "i");
const outcome = (msg) => (lost.test(msg) ? " failed" : won.test(msg) ? " won" : "");
const dateFmt = new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short" });

export default async function dispatches() {
  const list = await get("/api/v2/dispatches", 300);
  document.getElementById("dispatches").innerHTML = newestFirst(list.filter((d) => d.message), "published")
    .slice(0, SHOWN)
    .map((d) => `<li class="card dispatch${outcome(d.message)}">${icon("clock")} ${date(d.published, dateFmt)}<p>${dispatchHtml(d.message)}</p></li>`)
    .join("") || `<li class="card muted">${icon("clock")} ${t.js.noDispatches}</li>`;
}
