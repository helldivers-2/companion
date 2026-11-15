import { get } from "../api.js";
import { dispatchHtml, esc } from "../format.js";

const SHOWN = 50;
const dateFmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

export default async function dispatches() {
  const list = await get("/api/v2/dispatches", 300);
  document.getElementById("dispatches").innerHTML = list
    .filter((d) => d.message)
    .sort((a, b) => Date.parse(b.published) - Date.parse(a.published))
    .slice(0, SHOWN)
    .map((d) => `<li class="dispatch"><time datetime="${esc(d.published)}">${dateFmt.format(new Date(d.published))}</time><p>${dispatchHtml(d.message)}</p></li>`)
    .join("");
}
