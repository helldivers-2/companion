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
- Vitest (testing, `environment: 'node'`)
- Existing fetch client pattern with `next.revalidate`

---

## File Structure

```text
lib/
  api/
    client.ts          # getAPI() — HTTP client with retries, timeouts, headers
    endpoints.ts       # URL builders & revalidation constants per endpoint
  services/
    campaigns.ts       # fetchCampaigns(), fetchWarStats() — return raw DTOs only
    assignments.ts     # fetchAssignments() — return raw DTOs only
    dispatches.ts      # fetchDispatches() — return raw DTOs only
    space-station.ts   # fetchSpaceStation() — return raw DTOs only
  transformers/
    campaigns.ts       # DTO→App mapping + pure math: getLiberation(), getStatus(),
                       # getTimeToLiberation(), getEffectiveHealth(), getPlanetStats(),
                       # getCampaignStats(), mapCampaignDto(), mapPlanetDto()
    dispatches.ts      # parseContent(), getDispatchTypeInfo()
    assignments.ts     # getStatusInfo(), getRewardTypeLabel(), mapAssignmentDto()
  data/
    dashboard.ts       # Composed, cached queries for widgets
    campaigns.ts       # getActiveCampaigns(), getLiberatedCampaigns()
types/
  campaigns.ts         # DTOs (raw API shapes) + Application types (Planet, Campaign, etc.)
  assignments.ts       # DTOs + Application types (Assignment, StatusInfo, etc.)
  space-station.ts     # DTOs + Application types
  dispatches.ts        # DTOs + Application types (moved from widget)
  war.ts               # DTOs + Application types (moved from war-summary.tsx)
```

## Layer Responsibilities

### `lib/api/client.ts`

- Wraps `fetch` to `https://api.helldivers2.dev/api`
- Injects `X-Super-Client` and `X-Super-Contact` headers from `config/site.ts`
- Handles `AbortController` timeout
- Retries once on HTTP 429 using `Retry-After` header
- Returns a **Result type**: `{ success: true, data: T } | { success: false, error: Error }`
- **No domain knowledge. Only HTTP mechanics. No `fallback` swallowing.**

### `lib/api/endpoints.ts`

- Exports URL path constants and their associated `revalidate` values
- Centralizes cache policy decisions so services don't hard-code numbers

### `lib/services/`

- One file per domain concept (campaigns, assignments, dispatches, space-station)
- Each function calls `getAPI` from `lib/api/client.ts` with the correct URL and revalidation time
- Receives Result from client. On `success: false`, throws descriptive error.
- On `success: true`, performs minimal schema validation (e.g., `Array.isArray`) and throws if shape is invalid.
- **Returns raw DTOs only.** Never calls transformers.

### `lib/transformers/`

- Pure functions: input in, output out. No side effects, no fetch calls.
- Contains **DTO-to-Application mapping functions** (e.g., `mapCampaignDto()`) and pure computation functions.
- `campaigns.ts`: `mapCampaignDto()`, `mapPlanetDto()`, `getEffectiveHealth()`, `getLiberation()`, `getLiberationRate()`, `getStatus()`, `getTimeToLiberation()`, `getPlanetStats()`, `getCampaignStats()`
- `dispatches.ts`: `parseContent()`, `getDispatchTypeInfo()`
- `assignments.ts`: `mapAssignmentDto()`, `getStatusInfo()`, `getRewardTypeLabel()`
- Trivial to unit test.

### `lib/data/`

- Composed queries for specific UI needs.
- Every exported function is wrapped in React's `cache()` to deduplicate requests across the same RSC render pass.
- Imports services (for fetching) and transformers (for mapping and computation).
- Example `dashboard.ts`: `getDashboardCampaignStats()` calls cached service fetches via `Promise.all`, maps DTOs to app types, then feeds into `getCampaignStats()`.
- This is what pages/widgets import directly.

### `types/`

- Each domain file contains **both** DTOs (raw API shapes, prefixed with `Dto` or kept in a nested namespace) and clean application types.
- No more inline interfaces inside widgets.
- DTOs are what the upstream API returns. Application types are what transformers produce and components consume.
- If the API changes, only the DTOs and the corresponding transformer mapping function need updating.

## Data Flow

```
Widget (RSC)
  → lib/data/dashboard.ts         (composed query, cached via React cache())
    → lib/services/campaigns.ts   (domain fetch, returns raw DTOs)
      → lib/api/client.ts         (HTTP, returns Result type)
    → lib/transformers/campaigns.ts (DTO→App mapping + pure transforms)
  → Render
```

## Error Handling Strategy

1. **Client layer (`lib/api/client.ts`)**: Catches all `fetch` exceptions and HTTP errors. Returns `{ success: false, error }`. Never swallows errors into a generic `fallback`.
2. **Service layer (`lib/services/`)**: Unwraps the Result. On failure, throws a domain-specific error. On success, validates shape (e.g., `Array.isArray`) and throws if invalid. Returns validated raw DTOs.
3. **Data layer (`lib/data/`)**: Catches service errors. Returns safe fallback structures for widgets (e.g., empty arrays) so the UI never crashes.
4. **Widget layer**: Calls composed queries. Receives guaranteed-safe data. No try/catch needed in JSX if data layer handles fallbacks.

## Testing Strategy

- **Test runner:** Vitest with `environment: 'node'` in `vitest.config.ts`
- **Transformers:** Direct unit tests. Supply mock DTOs, assert exact application type outputs.
- **Services:** Mock `lib/api/client.ts` using `vi.mock()`. Assert correct URLs, error propagation (Result→throw), and validation behavior.
- **Client:** Mock `global.fetch`. Assert timeout behavior, 429 retry logic, header injection, and Result type returns on failure.
- **Next.js imports:** Any test that transitively imports `next/headers`, `next/navigation`, etc., must have those modules mocked in `vitest.setup.ts`.
- **Widgets:** Not unit-tested. They are thin async shells. Verified via `pnpm build` and manual dev testing.

## Migration Plan (High-Level)

Migrate **one domain at a time** so the app never breaks. Deploy after each domain.

### Phase 1: Dispatches (simplest domain)

1. Set up Vitest configuration (`vitest.config.ts`, test script in `package.json`).
2. Create `types/dispatches.ts` with DTO + app types. Move inline `Dispatch` from widget.
3. Create `lib/api/client.ts` with Result type and `lib/api/endpoints.ts`.
4. Create `lib/services/dispatches.ts`.
5. Create `lib/transformers/dispatches.ts`.
6. Create `lib/data/dispatches.ts` with `cache()`.
7. Update `components/widgets/root/dispatches.tsx` to use new layers.
8. Write tests for dispatches transformers and services.
9. Run `pnpm build`, verify, commit, deploy.

### Phase 2: Assignments

10. Create `types/assignments.ts` with DTOs + app types.
11. Create `lib/services/assignments.ts`.
12. Create `lib/transformers/assignments.ts`.
13. Create `lib/data/assignments.ts` with `cache()`.
14. Update `components/widgets/root/major-order.tsx`.
15. Write tests for assignments transformers and services.
16. Run `pnpm build`, verify, commit, deploy.

### Phase 3: Campaigns / War Stats (most complex)

17. Create `types/campaigns.ts` and `types/war.ts` with DTOs + app types.
18. Create `lib/services/campaigns.ts`.
19. Create `lib/transformers/campaigns.ts` (extract from `lib/get-campaigns.tsx`).
20. Create `lib/data/campaigns.ts` and `lib/data/dashboard.ts` with `cache()`.
21. Update `components/widgets/root/campaign-table.tsx`, `campaign-map-server.tsx`, `war-summary.tsx`, `space-station.tsx`.
22. Write tests for campaign transformers and services.
23. Run `pnpm build`, verify, commit, deploy.

### Phase 4: Cleanup

24. Delete `lib/get.ts` and `lib/get-campaigns.tsx`.
25. Verify `pnpm build` passes with zero references to old files.

## Self-Review Checklist

- [x] No placeholders ("TBD", "TODO", etc.)
- [x] All types defined in `types/` files, no inline widget interfaces
- [x] DTOs are explicitly separate from application types
- [x] Layer boundaries are clear: api (Result) → services (DTOs) → transformers (DTO→App) → data (cached orchestration)
- [x] Services do NOT call transformers
- [x] Client uses Result type, does not swallow errors with `fallback`
- [x] Data layer uses React `cache()` for request deduplication
- [x] Error handling defined at every layer, non-contradictory
- [x] Testing strategy covers all non-UI code and mentions `node` environment
- [x] Migration plan is per-domain, incremental, and deployable at each phase
