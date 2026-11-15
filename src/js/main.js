import site from "../_data/site.json" with { type: "json" };
import { state } from "./api.js";
import { timeLeft } from "./format.js";
import overview from "./pages/overview.js";
import planets from "./pages/planets.js";
import dispatches from "./pages/dispatches.js";

const page = { overview, planets, dispatches }[document.body.dataset.page];
const status = document.getElementById("status");

function say(text, announce) {
  status.setAttribute("aria-live", announce ? "polite" : "off"); // don't announce the clock every minute
  // Rewriting identical text re-announces it, so an outage would be read out on every refresh.
  if (status.textContent !== text) status.textContent = text;
}

async function refresh() {
  if (!page || document.hidden) return;
  state.stale = false;
  try {
    await page();
    if (state.stale) say("API unreachable, showing cached data", true);
    else say(`Updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`, false);
  } catch (err) {
    say(`Could not load war data: ${err.message}`, true);
    // Without a cache a first-load failure would otherwise leave "Loading…" up forever.
    for (const el of document.querySelectorAll("[data-loading]")) el.textContent = `No war data yet, retrying every ${site.refreshSeconds} s.`;
  }
}

refresh();
setInterval(refresh, site.refreshSeconds * 1000);
document.addEventListener("visibilitychange", refresh);
setInterval(() => {
  for (const el of document.querySelectorAll("[data-until]")) el.textContent = timeLeft(el.dataset.until);
}, 1000);
