import site from "../_data/site.json" with { type: "json" };

const headers = { "X-Super-Client": site.client, "X-Super-Contact": site.contact };
export const state = { stale: false };

// Caches in localStorage so page switches and reloads stay under the API's 5 requests / 10 s limit.
export async function get(path, ttl = site.refreshSeconds) {
  const key = `hd:${path}`;
  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(key)); } catch {}
  if (cached && Date.now() - cached.t < ttl * 1000) return cached.data;
  try {
    let res = await fetch(site.api + path, { headers });
    if (res.status === 429) {
      // Retry-After is not CORS-exposed, so wait out the whole 10 s window once
      await new Promise((r) => setTimeout(r, 10_000));
      res = await fetch(site.api + path, { headers });
    }
    if (!res.ok) throw new Error(res.status === 429 ? "rate limited by the API" : `API answered ${res.status}`);
    const data = await res.json();
    try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), data })); } catch {} // storage full: skip caching
    return data;
  } catch (err) {
    if (!cached) throw err;
    state.stale = true;
    return cached.data;
  }
}
