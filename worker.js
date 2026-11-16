import site from "./src/_data/site.json" with { type: "json" };

// Serves /api/* from the self-hosted API (deploy/compose.yml). Its hostname sits behind Cloudflare Access,
// and only this Worker's service token gets through, so visitors never reach the homelab directly.
// Exact paths and languages only, so nobody can get past the edge cache by changing the URL.
export const PATHS = new Set([
  "/api/v1/war", "/api/v1/assignments", "/api/v1/campaigns", "/api/v1/planets", "/api/v1/steam",
  "/api/v2/dispatches", "/api/v2/space-stations",
]);
// The languages the API syncs (Helldivers:Synchronization:Languages upstream).
export const LANGS = new Set(["en-US", "de-DE", "es-ES", "ru-RU", "fr-FR", "it-IT", "pl-PL", "zh-Hans", "zh-Hant"]);
const TTL = 20; // the API pulls from the game every 20 s

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const lang = url.searchParams.get("lang");
    if (request.method !== "GET" || !PATHS.has(url.pathname) || !LANGS.has(lang)) return new Response("Not found", { status: 404 });
    const key = new Request(`${url.origin}${url.pathname}?lang=${lang}`); // drops any extra query params
    const cache = globalThis.caches?.default; // absent under Node (dev server, tests)
    const hit = await cache?.match(key);
    if (hit) return hit;
    const res = await fetch(env.API_ORIGIN + url.pathname, {
      headers: {
        "Accept-Language": lang,
        "X-Super-Client": site.client,
        "X-Super-Contact": site.contact,
        "CF-Access-Client-Id": env.ACCESS_CLIENT_ID,
        "CF-Access-Client-Secret": env.ACCESS_CLIENT_SECRET,
      },
      redirect: "manual", // Access answers a bad token with a redirect to its login page; never pass that on as data
    });
    if (!res.ok) return new Response(null, { status: 502 });
    const out = new Response(res.body, {
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": `public, max-age=${TTL}` },
    });
    if (cache) ctx.waitUntil(cache.put(key, out.clone()));
    return out;
  },
};
