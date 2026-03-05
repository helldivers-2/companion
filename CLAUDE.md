# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install        # Install dependencies
pnpm dev            # Start dev server with Turbopack at localhost:3000
pnpm build          # Production build
pnpm lint           # ESLint via Next.js
```

No test suite is configured.

## Architecture

**Next.js 16 App Router** project using React Server Components throughout. Pages and widgets fetch data server-side via `lib/get.ts`.

### Data Flow

All API calls go through `getAPI()` in `lib/get.ts`, which fetches from `https://api.helldivers2.dev/api`. It requires `X-Super-Client` and `X-Super-Contact` headers (configured in `config/site.ts`). Each widget controls its own revalidation interval using `REVALIDATION_TIMES` constants (5–60 min depending on data volatility).

### Page Structure

- `/` — War status dashboard (major order, space station, campaigns, dispatches, map)
- `/news` — Newsfeed
- `/statistics` — War statistics
- `/faq` — FAQ with Giscus comments

### Widget Pattern

Widgets in `components/widgets/` are async Server Components that fetch their own data. They're wrapped in `<DashboardCard>` on pages. The map widget (`campaign-map.tsx`) has a separate client component (`campaign-map-client.tsx`) for Leaflet (which requires `"use client"`).

### Key Utilities (`lib/get-campaigns.tsx`)

Campaign data helpers used across widgets:
- `getCampaignStats()` — fetches and categorizes campaigns into active/liberated/total
- `getLiberation()` / `getLiberationRate()` / `getTimeToLiberation()` — planet liberation math
- `getEffectiveHealth()` — resolves planet health vs. event health
- `getFactionIcon()` — maps faction name to icon path

### Types

`types/campaigns.ts` defines `Planet`, `Campaign`, `CampaignStats`. `types/assignments.ts` covers major orders. `types/space-station.ts` covers space station data.

### Styling

Tailwind CSS v4 with `tailwind-merge` + `clsx` via `cn()` in `lib/utils.ts`. UI primitives are in `components/ui/` (Radix UI-based). Font: Space Grotesk. Theme switching via `next-themes`.
