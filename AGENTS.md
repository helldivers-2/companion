# AGENTS.md

This file provides guidance to OpenCode / Claude Code when working in this repository.

## Commands

```bash
pnpm install        # Install dependencies
pnpm dev            # Start dev server with Turbopack at localhost:3000
pnpm build          # Production build
pnpm lint           # Run ESLint
pnpm test           # Run tests in watch mode (vitest)
pnpm test:run       # Run tests once (CI)
```

**Linting:** `pnpm lint` runs `eslint .` directly. The previous Next.js 16.1.6 / eslint 10 incompatibility has been resolved by upgrading to Next.js 16.3.0 and eslint 9.x. eslint is deliberately held at 9.x — the 10.x major has not been verified against `eslint-config-next`.

## Architecture

**Next.js 16 App Router** project using React Server Components throughout. The app is a single-page dashboard (`/`) with anchor sections (`#news`, `#statistics`, `#faq`); the `/news`, `/statistics`, and `/faq` routes are `permanentRedirect`s to those anchors.

### Data Flow

Data is fetched through a layered architecture:

- `lib/api/client.ts` — `getAPI()` wraps `fetch` against `https://api.helldivers2.dev`. The `url` is an absolute origin path including its `/api` or `/raw` prefix (see `API_ORIGIN`); raw ArrowHead passthrough requests are **not** nested under `/api`. It requires `X-Super-Client` and `X-Super-Contact` headers (configured in `config/site.ts`), supports per-request `revalidate`, and retries once on HTTP 429.
- `lib/api/endpoints.ts` — central registry of API URLs and revalidation times (10 min–24 h depending on volatility). Fixed endpoints are `{ url, revalidate }` objects; parameterised ones (by index, gid or war season) are `(arg) => Endpoint` factories.
- `lib/services/*.ts` — one service per domain; calls `getAPI()` and validates the raw DTO shape. Each list endpoint has a matching `fetch*ByIndex` where the API offers one.
- `lib/data/*.ts` — React `cache()`-wrapped data loaders used by Server Components. Each exposes `get*` functions that map DTOs to domain models and return `null` on failure. Loaders that need the current war season id resolve it once via `getWarId()` and cache it.
- `lib/transformers/*.ts` — pure mapping/calculation helpers (liberation math, status labels, DTO-to-domain mapping).

### API Surface

All public endpoints are wired up:

- `lib/services/campaigns.ts` — `/v1/campaigns`, `/v1/war`, `/v1/campaigns/{index}`
- `lib/services/planets.ts` — `/v1/planets`, `/v1/planet-events`, `/v1/planets/{index}`
- `lib/services/war-metadata.ts` — raw `/raw/api/WarSeason/current/WarID`, `/WarSeason/{id}/WarInfo`, `/WarSeason/{id}/Status`, `/raw/api/Stats/war/{id}/summary`, `/raw/api/NewsFeed/{id}`
- `lib/services/assignments.ts` — `/v1/assignments`, `/v1/assignments/{index}`
- `lib/services/dispatches.ts` — `/v2/dispatches`, `/v2/dispatches/{index}`
- `lib/services/space-station.ts` — `/v2/space-stations`, `/v2/space-stations/{index}`
- `lib/services/news.ts` — `/v1/steam`, `/v1/steam/{gid}`

The raw war payloads are numeric: races are `1 Humans / 2 Terminids / 3 Automaton / 4 Illuminate` (`getFactionFromRace`), and `NewsFeed.Published` is seconds since the war start, not a unix timestamp (`mapNewsFeedItems` anchors it).


### Widget Pattern

Widgets in `components/widgets/` are async Server Components that call the `lib/data/*` loaders:

- `components/widgets/root/` — dashboard cards for `/` (major order, campaigns, map, dispatches, space station, war summary, planet events).
- `components/widgets/merged/` — section wrappers that compose root/news/statistics widgets onto the single page (`news-section`, `galaxy-section`, `statistics-section`, `faq-section`).
- `components/widgets/news/` — `newsfeed`, `super-earth-news` and `wiki`.
- `components/widgets/galaxy/` — the all-planets browser, `planet-overview`, `planet-battle-stats`.
- `components/widgets/statistics/` — reused in the merged statistics section.
- `components/widgets/space-station/` — `space-station-detail` for the station route.

Interactive client pieces are kept separate:

- `campaign-map-dynamic.tsx` dynamically imports `campaign-map.tsx` with `ssr: false` because Leaflet needs the DOM.
- `campaign-table-client.tsx` handles filtering and the planet detail dialog.
- `galaxy/planet-filters.tsx` handles faction/sector/search filters over the planet list.

### Routes

`/` is the single-page dashboard; the section anchors (`#news`, `#galaxy`, `#statistics`, `#faq`) also have `permanentRedirect` routes (`/news`, `/galaxy`, `/statistics`, `/faq`). Detail routes backed by the by-index endpoints are `/planet/[index]`, `/campaign/[index]`, `/dispatch/[id]`, `/news/[gid]` and `/station/[index]`; each validates a numeric id (or any gid), 404s on a failed lookup, and sets `generateMetadata`.


### Key Utilities (`lib/transformers/campaigns.ts`)

- `getCampaignStats()` — categorizes campaigns into active/liberated/total, and splits `activePlanets` into `movingPlanets` / `parkedPlanets`. Sorts by attention (defenses by soonest `endTime`, then progress, then player count), not by remaining health.
- `getPlanetStats()` — combines `getEffectiveHealth`, `getLiberation`, `getRegenRate`, and `getStatus`
- `getEffectiveHealth()` — resolves planet health vs. event health
- `getCampaignProgress()` — the one percentage worth showing per row: event defense health, else planet health, else the leading region's progress (labelled with the region name). Planet health alone reads 0.00% on most fronts under the region system.
- `getLeadingRegion()` — the unlocked region players are actually pushing; ignores locked regions, which stay pinned at full health
- `isMoving()` — whether a front has an event or any planet/region progress; drives the moving/parked split
- `getFactionIcon()` / `species` — maps faction name to icon path

### Types

`types/campaigns.ts` defines `Planet`, `Campaign`, `PlanetRegion`, `CampaignStats`. `types/planets.ts` covers the galaxy-wide listings, `types/assignments.ts` major orders, `types/war-metadata.ts` the raw ArrowHead payloads, and `types/space-station.ts` space station data.

### Styling

Tailwind CSS v4 with `tailwind-merge` + `clsx` via `cn()` in `lib/utils.ts`. Theme variables live in `app/globals.css`. UI primitives are in `components/ui/` (Radix UI-based). Font: Space Grotesk via `next/font/google`. Theme switching via `next-themes`.

## Testing

Tests use **Vitest** with the `node` environment and Vite's native `resolve.tsconfigPaths` for alias resolution (see `vitest.config.mts`). The `tests/` tree mirrors `lib/`:

- `tests/lib/api/client.test.ts` — mocks `global.fetch` with `vi`.
- `tests/lib/services/*.test.ts` — mocks services and validates error handling.
- `tests/lib/data/*.test.ts` — mocks services to test the cached data layer.
- `tests/lib/transformers/*.test.ts` — pure unit tests for mapper/calculation helpers.

Run a single file: `pnpm vitest run tests/lib/transformers/campaigns.test.ts`.

## Toolchain Notes

- **Package manager:** pnpm. `pnpm-workspace.yaml` only configures built dependencies (`sharp`, `@tailwindcss/oxide`, etc.).
- **Path alias:** `@/*` maps to `./*` (see `tsconfig.json`).
- **PWA manifest:** `app/manifest.json`; icons are in `public/`.
- **Route types:** `next-env.d.ts` imports generated types from `.next/types/routes.d.ts`, so run `pnpm build` or `pnpm dev` at least once for route type generation.
