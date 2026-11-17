# Helldivers Companion

An unofficial live dashboard for the Helldivers 2 Galactic War, running at [helldivers.michi.onl](https://helldivers.michi.onl). It shows the current Major Order, the active fronts, every planet, Super Earth's dispatches and Steam news, with data from the [community Helldivers 2 API](https://helldivers-2.github.io/api/).

## Develop

```sh
npm install
npm run dev   # http://localhost:8080
npm test
```

Every push to `main` deploys to Cloudflare through GitHub Actions. `npm run deploy` does the same from your machine.

## Where things live

- Pages are Eleventy templates in `src/*.njk`, with scripts in `src/js` and styles in `src/scss`.
- All text is in `src/_data/i18n/<locale>.json`, one file per language; each page embeds only the keys its script needs (`src/_data/eleventyComputed.js`). `npm test` fails if a locale is missing a key that English has.
- The client headers and refresh interval are in `src/_data/site.json`. Set `contact` to your own before you deploy a copy.
- The browser fetches `/api/*` from its own origin. In production `worker.js` answers those calls from the self-hosted API; under `npm run dev` the same code calls the public API.
- `src/_redirects` sends old URLs to their new pages. Cloudflare and Netlify read it; other hosts need the rules in their own format.

## The self-hosted API

`worker.js` serves `/api/*` from a 20-second edge cache. On a miss it fetches from `API_ORIGIN` in `wrangler.jsonc`, which is a Cloudflare Tunnel hostname behind Cloudflare Access. Only the Worker's service token gets through Access, so visitors never reach the server directly, and however much traffic the site gets, the server sees at most one request per path and language every 20 seconds from each Cloudflare location.

`deploy/compose.yml` runs the upstream API on port 8080. To set it up:

1. Route the `API_ORIGIN` hostname through a Cloudflare Tunnel to port 8080 on the server, and firewall that port so only the tunnel connector can reach it.
2. Create a service token, and an Access application for that hostname whose only policy is *Service Auth* with that token.
3. Store the token in the Worker: `wrangler secret put ACCESS_CLIENT_ID` and `wrangler secret put ACCESS_CLIENT_SECRET`.
4. Run `docker compose -f deploy/compose.yml up -d --build`.

To pick up upstream fixes, run `build --pull`, then `up -d`, both with the same `-f` flag.
