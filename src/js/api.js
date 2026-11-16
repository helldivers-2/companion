import site from "../_data/site.json" with { type: "json" };
import { fill, t as strings } from "./i18n.js";

// The API localizes orders, dispatches and some planet names by Accept-Language; ask for the page's language.
const headers = { "X-Super-Client": site.client, "X-Super-Contact": site.contact, "Accept-Language": strings.api };
export const state = { stale: false };

// Caches in localStorage so page switches and reloads stay under the API's 5 requests / 10 s limit.
export async function get(path, ttl = site.refreshSeconds) {
  const key = `hd:${path}`;
  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(key)); } catch {}
  if (cached?.lang !== strings.api) cached = null; // one slot per path, refilled after a language switch
  // main.js refreshes every ttl: stamp the request start and allow 1 s of timer jitter, or ticks get served the cache
  const t = Date.now();
  if (cached && t - cached.t < ttl * 1000 - 1000) return cached.data;
  try {
    let res = await fetch(site.api + path, { headers });
    if (res.status === 429) {
      // Retry-After is not CORS-exposed, so wait out the whole 10 s window once
      await new Promise((r) => setTimeout(r, 10_000));
      res = await fetch(site.api + path, { headers });
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
