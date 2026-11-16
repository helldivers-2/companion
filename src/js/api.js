import site from "../_data/site.json" with { type: "json" };
import { fill, t as strings } from "./i18n.js";

// cacheOnly: answer from the cache however old, and throw on a miss instead of fetching.
export const state = { stale: false, cacheOnly: false, onWait: null }; // onWait: called before the 10 s rate-limit back-off

// Caches in localStorage so page switches and reloads don't refetch.
// worker.js serves the API on this origin; ?lang picks the language for orders, dispatches and some planet names.
export async function get(path, ttl = site.refreshSeconds) {
  const key = `hd:${path}`;
  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(key)); } catch {}
  if (cached?.lang !== strings.api) cached = null; // one slot per path, refilled after a language switch
  // main.js refreshes every ttl: stamp the request start and allow 1 s of timer jitter, or ticks get served the cache
  const t = Date.now();
  if (cached && (state.cacheOnly || t - cached.t < ttl * 1000 - 1000)) return cached.data;
  if (state.cacheOnly) throw new Error("not cached");
  try {
    let res = await fetch(`${path}?lang=${strings.api}`);
    if (res.status === 429) {
      state.onWait?.();
      // only the /api rate-limiting rule answers 429, and it blocks for 10 s
      await new Promise((r) => setTimeout(r, 10_000));
      res = await fetch(`${path}?lang=${strings.api}`);
    }
    if (!res.ok) throw new Error(res.status === 429 ? strings.js.rateLimited : fill(strings.js.apiStatus, { status: res.status }));
    const data = await res.json();
    try { localStorage.setItem(key, JSON.stringify({ t, lang: strings.api, data })); } catch {} // storage full: skip caching
    return data;
  } catch (err) {
    if (!cached) throw err;
    state.stale = true;
    return cached.data;
  }
}
