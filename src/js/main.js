import "./theme.js";
import site from "../_data/site.json" with { type: "json" };
import { state } from "./api.js";
import { icon, timeLeft } from "./format.js";
import { fill, lang, t } from "./i18n.js";
import overview from "./pages/overview.js";
import planets from "./pages/planets.js";
import map from "./pages/map.js";
import dispatches from "./pages/dispatches.js";
import news from "./pages/news.js";
// static data: these bind themselves, so the "Updated" status of the live pages stays off them
import "./pages/items.js";
import "./pages/stratagems.js";

const page = { overview, map, planets, dispatches, news }[document.body.dataset.page];
const status = document.getElementById("status");

function say(text, announce) {
  status.setAttribute("aria-live", announce ? "polite" : "off"); // don't announce the clock every minute
  // Rewriting identical text re-announces it, so an outage would be read out on every refresh.
  if (status.textContent !== text) status.textContent = text;
}

state.onWait = () => say(t.js.waiting, true);

async function run() {
  if (!page || document.hidden) return;
  state.stale = false;
  try {
    await page();
    if (state.stale) say(t.js.stale, true);
    else say(fill(t.js.updated, { time: new Date().toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" }) }), false);
  } catch (err) {
    say(fill(t.js.failed, { error: err.message }), true);
    // Without a cache a first-load failure would otherwise leave "Loading…" up forever.
    for (const el of document.querySelectorAll("[data-loading]")) el.innerHTML = `${icon("shield-warning")} ${fill(t.js.retrying, { s: site.refreshSeconds })}`;
  }
}

// One refresh at a time: a tick during the 10 s rate-limit back-off would otherwise fetch everything again.
let running = null;
const refresh = () => (running ??= run().finally(() => { running = null; }));

// Paint the cached data first, however old, so a return visit shows the page at once instead of shifting when the API answers.
// A cache hit resolves in microtasks, so no other refresh can run while cacheOnly is set.
state.cacheOnly = true;
Promise.resolve(page?.()).catch(() => {}).finally(() => {
  state.cacheOnly = false;
  refresh();
});
setInterval(refresh, site.refreshSeconds * 1000);
document.addEventListener("visibilitychange", refresh);
setInterval(() => {
  for (const el of document.querySelectorAll("[data-until]")) {
    const s = timeLeft(el.dataset.until);
    if (el.textContent !== s) el.textContent = s;
  }
}, 1000);
