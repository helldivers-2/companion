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

**Linting:** `pnpm lint` runs `eslint .` directly. The previous Next.js 16.1.6 / eslint 10 incompatibility has been resolved by upgrading to Next.js 16.2.9 and eslint 9.x.

## Architecture

**Next.js 16 App Router** project using React Server Components throughout. The app is a single-page dashboard (`/`) with anchor sections (`#news`, `#statistics`, `#faq`); the `/news`, `/statistics`, and `/faq` routes are `permanentRedirect`s to those anchors.

### Data Flow

Data is fetched through a layered architecture:

- `lib/api/client.ts` — `getAPI()` wraps `fetch` against `https://api.helldivers2.dev/api`. It requires `X-Super-Client` and `X-Super-Contact` headers (configured in `config/site.ts`), supports per-request `revalidate`, and retries once on HTTP 429.
- `lib/api/endpoints.ts` — central registry of API URLs and revalidation times (10–60 min depending on data volatility).
- `lib/services/*.ts` — one service per domain; calls `getAPI()` and validates the raw DTO shape.
- `lib/data/*.ts` — React `cache()`-wrapped data loaders used by Server Components. Each exposes `get*` functions that map DTOs to domain models and return `null` on failure.
- `lib/transformers/*.ts` — pure mapping/calculation helpers (liberation math, status labels, DTO-to-domain mapping).

### Widget Pattern

Widgets in `components/widgets/` are async Server Components that call the `lib/data/*` loaders:

- `components/widgets/root/` — dashboard cards for `/` (major order, campaigns, map, dispatches, space station, war summary).
- `components/widgets/merged/` — section wrappers that compose root/news/statistics widgets onto the single page.
- `components/widgets/news/` and `components/widgets/statistics/` — widgets reused in merged sections.

Interactive client pieces are kept separate:

- `campaign-map-dynamic.tsx` dynamically imports `campaign-map.tsx` with `ssr: false` because Leaflet needs the DOM.
- `campaign-table-client.tsx` handles filtering and the planet detail dialog.

### Key Utilities (`lib/transformers/campaigns.ts`)

- `getCampaignStats()` — categorizes campaigns into active/liberated/total
- `getPlanetStats()` — combines `getEffectiveHealth`, `getLiberation`, `getLiberationRate`, `getStatus`, and `getTimeToLiberation`
- `getEffectiveHealth()` — resolves planet health vs. event health
- `getFactionIcon()` / `species` — maps faction name to icon path

### Types

`types/campaigns.ts` defines `Planet`, `Campaign`, `CampaignStats`. `types/assignments.ts` covers major orders. `types/space-station.ts` covers space station data.

### Styling

Tailwind CSS v4 with `tailwind-merge` + `clsx` via `cn()` in `lib/utils.ts`. Theme variables live in `app/globals.css`. UI primitives are in `components/ui/` (Radix UI-based). Font: Space Grotesk via `next/font/google`. Theme switching via `next-themes`.

## Testing

Tests use **Vitest** with the `node` environment and `vite-tsconfig-paths` for alias resolution. The `tests/` tree mirrors `lib/`:

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
