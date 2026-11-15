import "@fontsource/barlow/latin-400.css";
import "@fontsource/barlow/latin-600.css";
import "@fontsource/barlow-condensed/latin-600.css";
import "@fontsource/barlow-condensed/latin-700.css";
import site from "../_data/site.json" with { type: "json" };
import { state } from "./api.js";
import { timeLeft } from "./format.js";
import overview from "./pages/overview.js";
import planets from "./pages/planets.js";
import dispatches from "./pages/dispatches.js";

const page = { overview, planets, dispatches }[document.body.dataset.page];
const status = document.getElementById("status");

async function refresh() {
  if (!page || document.hidden) return;
  state.stale = false;
  try {
    await page();
    status.setAttribute("aria-live", state.stale ? "polite" : "off"); // don't announce the clock every minute
    status.textContent = state.stale
      ? "API unreachable, showing cached data"
      : `Updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } catch (err) {
    status.setAttribute("aria-live", "polite");
    status.textContent = `Could not load war data: ${err.message}`;
  }
}

refresh();
setInterval(refresh, site.refreshSeconds * 1000);
document.addEventListener("visibilitychange", refresh);
setInterval(() => {
  for (const el of document.querySelectorAll("[data-until]")) el.textContent = timeLeft(el.dataset.until);
}, 1000);
