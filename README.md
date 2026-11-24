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

- Pages are Eleventy templates in `src/pages/*.njk`, with scripts in `src/js` and styles in `src/scss`.
- The stratagem and item tables read `src/_data/stratagems.json` and `items.json`. Run `npm run stratagems` and `npm run items` to refresh them from the [Helldivers Wiki](https://helldivers.wiki.gg/) (CC BY-NC-SA 4.0), then commit the result. `npm run planets` refreshes `planetImages.json` the same way. `npm run sectors` pulls the galaxy map's sector outlines (`sectors.json`) from TauCetiV's wiki gadget (GNU GPL, not the wiki's CC licence; credited on the map page).
- Those scripts also mirror wiki images into `src/img/{stratagems,items,planets}/` and record each file's uploader and licence in `sources.json`. They skip files without a reusable licence and unchanged files. If `cwebp` (`brew install webp`) is installed, they convert PNG thumbnails to WebP; otherwise they leave them as PNG. All wiki traffic goes through `scripts/wiki.js`, one request at a time with a pause between requests; keep it that way.
- All text is in `src/_data/i18n/<locale>.json`, one file per language; each page embeds only the keys its script needs (`src/_data/eleventyComputed.js`). `npm test` fails if a locale is missing a key that English has.
- Game terms follow the glossary below. Change a term in every string of a locale at once, and update the table.
- The client headers and refresh interval are in `src/_data/site.json`. Set `contact` to your own before you deploy a copy.
- The browser fetches `/api/*` from its own origin. In production `worker.js` answers those calls from the self-hosted API; under `npm run dev` the same code calls the public API.
- `src/redirects.njk` builds `_redirects`, which sends old URLs to their new pages. Cloudflare and Netlify read it; other hosts need the rules in their own format.

## Glossary

| English           | Deutsch             | Español                 | 繁體中文 |
| ----------------- | ------------------- | ----------------------- | -------- |
| Major Order       | Generalbefehl       | Orden suprema           | 主要指令 |
| Super Earth       | Über-Erde           | Supertierra             | 超級地球 |
| Stratagem         | Stratagem           | Estratagema             | 戰略配備 |
| Eagle             | Eagle               | Eagle                   | 飛鷹     |
| Sentry            | Sentry              | Sentry                  | 砲塔     |
| Super Credits     | Über-Credits        | Créditos de Supertierra | 超級點數 |
| Medals            | Medaillen           | Medallas                | 勳章     |
| Requisition Slips | Anforderungsscheine | Solicitudes             | 申購點   |
| Warbond           | Kriegsanleihe       | Bono de guerra          | 戰爭債券 |
| Superstore        | Über-Store          | Supertienda             | 超級商店 |
| Terminids         | Terminiden          | Termínidos              | 蟲族     |
| Automatons        | Automaten           | Autómatas               | 機器人   |
| Illuminate        | Illuminate          | Iluminados              | 光能者   |

The game's own text for a language is in its news feed: `curl -H 'Accept-Language: de-DE' 'https://api.live.prod.thehelldiversgame.com/api/NewsFeed/801?maxEntries=1024'` (use `zh-Hant` for Chinese). In November 2026 the German feed said Generalbefehl, Taktikausrüstung, Adler and Roboter, and the Spanish one said orden suprema and Águila. The table lists what the site uses now. The `js.won` and `js.lost` patterns are different: they must match the feed's wording, not the glossary.

German status messages use the passive (“Karte wird geladen …”), and options use “können” (“Mit den Pfeiltasten kannst du …”), not the indicative (“… springst du …”).

## The self-hosted API

`worker.js` serves `/api/*` from a 20-second edge cache. On a miss it fetches from `API_ORIGIN` in `wrangler.jsonc`, which is a Cloudflare Tunnel hostname behind Cloudflare Access. Only the Worker's service token gets through Access, so visitors never reach the server directly. Regardless of traffic, the server sees at most one request per path and language every 20 seconds from each Cloudflare location.

`deploy/compose.yml` runs the upstream API on port 8080. To set it up:

1. Route the `API_ORIGIN` hostname through a Cloudflare Tunnel to port 8080 on the server, and firewall that port so only the tunnel connector can reach it.
2. Create a service token, and an Access application for that hostname whose only policy is _Service Auth_ with that token.
3. Store the token in the Worker: `wrangler secret put ACCESS_CLIENT_ID` and `wrangler secret put ACCESS_CLIENT_SECRET`.
4. Run `docker compose -f deploy/compose.yml up -d --build`.

To pick up upstream fixes, run `build --pull`, then `up -d`, both with the same `-f` flag.
