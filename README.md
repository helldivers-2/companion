# Helldivers Companion

Unofficial live dashboard for the Galactic War: Major Orders with task progress and countdowns, the Democracy Space Station, active fronts grouped by enemy, a searchable planet table and the Super Earth dispatch feed.

Eleventy renders the pages from `src/*.njk`, esbuild bundles `src/js` and Sass compiles `src/scss` into `_site/assets`, and the browser pulls live data from the [community Helldivers 2 API](https://helldivers-2.github.io/api/).

```sh
npm install
npm run dev     # http://localhost:8080
npm run build   # static site in _site/
npm test
```

API settings (base URL, `X-Super-Client` / `X-Super-Contact` headers, refresh interval) live in `src/_data/site.json`. Set `contact` to a real contact before deploying publicly. The API allows 5 requests per 10 seconds, so responses are cached in `localStorage` and polling pauses while the tab is hidden.

The API has no history endpoint, so progress rates and win estimates come from snapshots this browser has collected (kept for an hour). They appear about five minutes after the Overview is first opened.
