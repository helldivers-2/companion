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
- All text is in `src/_data/i18n/<locale>.json`, one file per language. `npm test` fails if a locale is missing a key that English has.
- The API URL, client headers and refresh interval are in `src/_data/site.json`. Set `contact` to your own before you deploy a copy.
- `src/_redirects` sends old URLs to their new pages. Cloudflare and Netlify read it; other hosts need the rules in their own format.

## Running your own API

The public API allows 5 requests per 10 seconds. `deploy/compose.yml` runs the upstream image with auth off and a higher limit:

```sh
docker compose -f deploy/compose.yml up -d --build
```

Put an HTTPS reverse proxy in front of port 8080 and set `api` in `site.json` to its URL. To pick up upstream fixes, run `build --pull` with the same `-f` flag, then `up -d`.
