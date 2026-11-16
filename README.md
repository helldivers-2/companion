# Helldivers Companion

Unofficial live dashboard for the Galactic War: Major Orders with task progress and countdowns, the Democracy Space Station, active fronts grouped by enemy, war statistics, a searchable planet table with per-planet details, the Super Earth dispatch feed, Steam news and patch notes, and a short guide to how the war works.

Eleventy renders the pages from `src/*.njk`, esbuild bundles `src/js` and Sass compiles `src/scss` into `_site/assets`, and the browser pulls live data from the [community Helldivers 2 API](https://helldivers-2.github.io/api/).

```sh
npm install
npm run dev     # http://localhost:8080
npm run build   # static site in _site/
npm test
```

The site is built once per language in `site.locales` (`/en/`, `/es/`, `/de/`, `/zh-TW/`), and `/` sends visitors to their browser's language. All text, for the templates and the browser script alike, lives in `src/_data/i18n/<locale>.json`. `npm test` fails if a locale is missing a key that English has. The API is asked for the same language, so Major Orders, dispatches and some planet names come back translated.

API settings (base URL, `X-Super-Client` / `X-Super-Contact` headers, refresh interval) live in `src/_data/site.json`. Set `contact` to a real contact before deploying publicly. The API allows 5 requests per 10 seconds, so responses are cached in `localStorage` and polling pauses while the tab is hidden.

`src/_redirects` sends the old unprefixed pages and the routes of the earlier Next.js companion (`/planet/:index`, `/statistics` and so on) to their English homes. Cloudflare and Netlify read that file; other hosts need the same rules in their own format.

To run your own API instance instead, `deploy/compose.yml` builds the upstream image unchanged with auth off and a higher rate limit. Run `docker compose -f deploy/compose.yml up -d --build` on a host with Docker, put a reverse proxy with HTTPS in front of port 8080, and set `api` in `site.json` to that URL. To pick up upstream fixes, run `docker compose -f deploy/compose.yml build --pull` and then `up -d`.

The API has no history endpoint, so progress rates and win estimates come from snapshots this browser has collected (kept for an hour). They appear about five minutes after the Overview is first opened.
