# Data / Services / Types Refactor Design

**Date:** 2026-05-31
**Approach:** B — Simple Functional Modules

---

## Goal

Restructure the codebase into a clean, layered functional architecture (`lib/api/`, `lib/services/`, `lib/transformers/`, `lib/data/`, `types/`) that separates HTTP, domain fetching, pure transformations, and composed queries, making the data layer fully unit-testable.

## Architecture

Widgets (RSC) call composed queries in `lib/data/` which orchestrate `lib/services/` to fetch from `lib/api/`. Pure transformation logic is extracted into `lib/transformers/` and tested independently. All shared types live under `types/`; no inline widget interfaces remain. Vitest is added as the test runner.

## Tech Stack

- Next.js 16 App Router (RSC)
- TypeScript
- Vitest (testing)
- Existing fetch client pattern with `next.revalidate`

---

## File Structure

```text
lib/
  api/
    client.ts          # getAPI() — HTTP client with retries, timeouts, headers
    endpoints.ts       # URL builders & revalidation constants per endpoint
  services/
    campaigns.ts       # fetchCampaigns(), fetchWarStats()
    assignments.ts     # fetchAssignments()
    dispatches.ts      # fetchDispatches()
    space-station.ts   # fetchSpaceStation()
  transformers/
    campaigns.ts       # getLiberation(), getStatus(), getTimeToLiberation(),
                       # getEffectiveHealth(), getPlanetStats(), getCampaignStats()
    dispatches.ts      # parseContent(), getDispatchTypeInfo()
    assignments.ts     # getStatusInfo(), getRewardTypeLabel()
  data/
    dashboard.ts       # Composed queries: getDashboardCampaignStats() for page.tsx
types/
  campaigns.ts         # Species, PlanetPosition, PlanetStatistics, PlanetEvent,
                       # Planet, Campaign, CampaignStats
  assignments.ts       # Reward, Assignment, StatusInfo
  space-station.ts     # SpaceStation, TacticalAction, Cost
  dispatches.ts        # Dispatch interface (moved from widget)
  war.ts               # WarStats interface (moved from war-summary.tsx)
```

## Layer Responsibilities

### `lib/api/client.ts`
- Wraps `fetch` to `https://api.helldivers2.dev/api`
- Injects `X-Super-Client` and `X-Super-Contact` headers from `config/site.ts`
- Handles `AbortController` timeout
- Retries once on HTTP 429 using `Retry-After` header
- Logs errors and returns `fallback` on failure
- **No domain knowledge. Only HTTP mechanics.**

### `lib/api/endpoints.ts`
- Exports URL path constants and their associated `revalidate` values
- Centralizes cache policy decisions so services don't hard-code numbers

### `lib/services/`
- One file per domain concept (campaigns, assignments, dispatches, space-station)
- Each function calls `getAPI` from `lib/api/client.ts` with the correct URL and revalidation time
- Performs minimal validation (e.g., `Array.isArray`) and throws descriptive errors for invalid shapes
- **May call transformers** when the raw API response needs light normalization before returning

### `lib/transformers/`
- Pure functions: input in, output out. No side effects, no fetch calls.
- `campaigns.ts`: `getEffectiveHealth()`, `getLiberation()`, `getLiberationRate()`, `getStatus()`, `getTimeToLiberation()`, `getPlanetStats()`, `getCampaignStats()`
- `dispatches.ts`: `parseContent()`, `getDispatchTypeInfo()`
- `assignments.ts`: `getStatusInfo()`, `getRewardTypeLabel()`
- Trivial to unit test.

### `lib/data/`
- Composed queries for specific UI needs.
- `dashboard.ts`: `getDashboardCampaignStats()` calls `fetchCampaigns()` and `fetchWarStats()` via `Promise.all`, then feeds results into `getCampaignStats()` and `getPlanetStats()` as needed.
- This is what pages/widgets import directly.

### `types/`
- All shared interfaces. Complete and self-contained.
- No more inline interfaces inside widgets.

## Data Flow

```
Widget (RSC)
  → lib/data/dashboard.ts       (composed query)
    → lib/services/campaigns.ts   (domain fetch)
      → lib/api/client.ts         (HTTP)
    → lib/transformers/campaigns.ts (pure transforms)
  → Render
```

## Error Handling Strategy

1. **Client layer (`lib/api/client.ts`)**: Catches all `fetch` exceptions and HTTP errors. Returns `fallback`. Logs to console.
2. **Service layer (`lib/services/`)**: If the response shape is unexpected (e.g., campaigns endpoint returns an object instead of array), throws a typed error. This prevents downstream transformers from operating on garbage data.
3. **Data layer (`lib/data/`)**: Catches service errors. Can return safe fallback structures for widgets.
4. **Widget layer**: Wraps composed query calls in try/catch. Renders user-friendly error UI on failure.

## Testing Strategy

- **Test runner:** Vitest
- **Transformers:** Direct unit tests. Supply mock data, assert exact outputs.
- **Services:** Mock `lib/api/client.ts` using `vi.mock()`. Assert correct URLs, headers, and fallback propagation.
- **Client:** Mock `global.fetch`. Assert timeout behavior, 429 retry logic, header injection, and fallback returns.
- **Widgets:** Not unit-tested. They are thin async shells. Verified via `pnpm build` and manual dev testing.

## Migration Plan (High-Level)

1. Set up Vitest configuration.
2. Move `lib/get.ts` → `lib/api/client.ts` + `lib/api/endpoints.ts`.
3. Extract all inline widget interfaces into `types/` files.
4. Create `lib/services/` files, moving fetch calls out of widgets.
5. Create `lib/transformers/` files, extracting pure logic from `lib/get-campaigns.tsx` and widgets.
6. Create `lib/data/dashboard.ts` composed query.
7. Update all widgets to import from new layers.
8. Delete `lib/get.ts` and `lib/get-campaigns.tsx`.
9. Write unit tests for transformers, services, and client.
10. Run `pnpm build` to verify no TypeScript errors.

## Self-Review Checklist

- [x] No placeholders ("TBD", "TODO", etc.)
- [x] All types defined in `types/` files
- [x] No inline widget interfaces remain
- [x] Layer boundaries are clear: api → services → transformers → data
- [x] Error handling defined at every layer
- [x] Testing strategy covers all non-UI code
- [x] Migration path is sequential and reversible per step
