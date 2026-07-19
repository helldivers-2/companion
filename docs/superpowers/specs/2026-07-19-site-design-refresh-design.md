# Design: Site Design Refresh (theme toggle, hierarchy, color tokens, mobile table)

**Date:** 2026-07-19
**Status:** Approved

## Goal

Address five design gaps found in a review of the dashboard: no light/dark toggle, no active-nav indication, uniform visual weight across all widgets, hardcoded status colors that bypass the theme, and a campaign table that hides its most useful column (status) on mobile.

These are five independent, small changes bundled into one spec because they all touch the same design surface and are each too small to warrant separate cycles.

## 1. Theme Toggle

`ThemeProvider` (`app/layout.tsx:37-42`) already runs with `defaultTheme="system"` and `enableSystem`, but nothing in the UI lets a user override it.

- New file `components/theme-toggle.tsx`, a client component.
- Uses `useTheme()` from `next-themes` and the existing `DropdownMenu` primitive (`components/ui/dropdown-menu.tsx`).
- Trigger: icon button (Sun/Moon from `lucide-react`, swapping based on resolved theme) styled with the same `glass-ui` treatment as the nav pills.
- Menu: Light / Dark / System items; the active one shows a check (`DropdownMenuCheckboxItem` or a manual check icon).
- Placement: in `Header` (`components/header.tsx:122-140`), as its own small pill in the `inline-flex gap-2` wrapper, alongside the two existing `NavigationMenu` elements. Visible at all breakpoints — it's a compact icon button, no separate mobile treatment needed.

## 2. Active Nav State

`Header` is already `"use client"`. The four page sections already have stable ids (`#status`, `#news`, `#statistics`, `#faq` — see `app/page.tsx`).

- Add a `useEffect` in `Header` that creates one `IntersectionObserver` watching all four section elements.
- Track whichever section is currently most in view (standard "largest intersection ratio" or "first entry crossing the midline" approach — implementer's choice, either is fine here).
- Map the active section id back to the corresponding `NAVIGATION_ITEMS` entry. Note `"Status"`'s `href` is `"/"`, not `"#status"` — it maps to the `#status` section specifically.
- Pass `active={isActiveItem}` to `NavigationMenuLink`. Radix's `NavigationMenuPrimitive.Link` already forwards `active` to a `data-active` attribute, and `navigationMenuTriggerStyle`/`NavigationMenuLink` already style `data-active` (`components/ui/navigation-menu.tsx:131`). No new CSS needed.

This was explicitly deferred in the original single-page merge (`docs/superpowers/specs/2026-05-31-merge-pages-design.md`, "Out of Scope"). This spec picks it up.

## 3. Visual Hierarchy for Featured Widgets

Every widget currently renders through the same `DashboardCard` (`components/dashboard-card.tsx`) with identical weight, so Major Order and the Map don't read as more important than Space Station or Dispatches despite being the primary content.

- `DashboardCard` gets an optional `featured?: boolean` prop (default `false`).
- When `true`: adds `border-l-4 border-l-primary` to the `Card`, and bumps `CardTitle` from `text-lg` to `text-xl`.
- Applied only to the Major Order and Map cards in `app/page.tsx`. No other widget changes.

## 4. Semantic Color Tokens

Status colors are currently hardcoded Tailwind classes scattered across three files, bypassing the theme entirely (broken in dark mode, inconsistent with the rest of the oklch-based palette):

- `lib/transformers/campaigns.ts:82-86` (`getStatus`) — `text-green-500` / `text-red-500` / `text-yellow-500`
- `lib/transformers/assignments.ts:36-42` (`getStatusInfo`) — `bg-red-500` / `bg-green-500` / `bg-orange-500` / `bg-blue-500`
- `components/widgets/root/war-summary.tsx` — `text-green-600` (mission-complete checkmark)
- `components/widgets/root/campaign-table-client.tsx` — `text-green-500` (liberated-row badge)

`globals.css` already has a `--destructive` token defined in `:root`/`.dark` and exposed via `@theme inline` as `--color-destructive` (lines 26, 55-63, 89-97 area). Reuse it for "danger" red. Add two more tokens following the exact same pattern:

- `--success` (green) — for "Gaining Ground" / "COMPLETED" / liberated / mission-complete states
- `--warning` (amber/orange) — for "Stalemate" (yellow) and "URGENT" (orange). These collapse into one semantic bucket rather than two, since both mean "needs attention" and neither is a distinct enough concept to warrant its own token.

`getStatusInfo`'s "ACTIVE" (currently `bg-blue-500`) doesn't fit success/danger/warning — it's neutral. Map it to the existing `--primary` token instead of adding a fourth new color.

Each `:root`/`.dark` value gets a light and dark variant (matching how `--destructive` already has different oklch values per mode), plus a `@theme inline` line exposing it as `--color-success` / `--color-warning`, which makes `text-success`, `bg-success`, `text-warning`, `bg-warning` etc. available automatically — same mechanism already powering `text-destructive` if it's used anywhere.

Transformers change their return shape from raw class strings to a semantic key:

```ts
// before
{ text: "Gaining Ground", color: "text-green-500" }
// after
{ text: "Gaining Ground", color: "success" }
```

Consumers (`campaign-table-client.tsx`, `major-order.tsx`, `war-summary.tsx`) map the key to the actual Tailwind class (e.g. a small `STATUS_TEXT_CLASS = { success: "text-success", warning: "text-warning", destructive: "text-destructive" }` lookup colocated with each consumer, or one shared lookup if duplication becomes annoying — implementer's call).

## 5. Mobile Campaign Table

`campaign-table-client.tsx:98-105` hides the Rate, Status, and ETA columns below `md`/`lg`, and hides the liberation progress bar below `lg`. Status — the single most useful glance value — is invisible on phone.

- Wrap the existing `<Table>` in `hidden md:block`.
- Add a new card-list view, `hidden` above `md` and shown below it, built from the same per-row computed values already produced inside the existing `.map()` (`playerPercent`, `liberation`, `rate`, `status`, `eta` — no new data-fetching or calculation).
- Each card: faction icon + planet name + event badge (top row, matching the existing table cell), liberation `Progress` bar, status `Badge`, player count.
- Same `onClick={() => handleRowClick(campaign)}` behavior, opening the existing `PlanetDetail` dialog.
- Rate and ETA are dropped on mobile, matching what's already hidden today — this doesn't reduce currently-visible mobile info, it just surfaces Status which wasn't visible before.
- The trailing "Liberated Planets" summary row (`campaign-table-client.tsx:171-197`) gets an equivalent summary card in the mobile view.

## Testing

No new test infrastructure. Manual verification checklist:

- [ ] Theme toggle switches between Light/Dark/System and persists via `next-themes` (localStorage)
- [ ] Nav pill for the section currently in view shows the active/highlighted state while scrolling
- [ ] Major Order and Map cards visually stand out (accent border + larger title) from Space Station/Dispatches/Campaigns
- [ ] All status/rate colors (campaigns table, major order badge, war summary checkmark) render correctly in both light and dark mode
- [ ] Campaign table below `md` shows a card list with visible status per planet; table view unchanged at `md`+
- [ ] Tapping a mobile campaign card opens the same planet detail dialog as clicking a table row

## Out of Scope

- Full palette redesign (stronger "propaganda poster" aesthetic) — noted as a possible future direction, not part of this pass
- Redesigning widget internals beyond what's listed (Space Station, Dispatches, News, Statistics, FAQ widgets are untouched)
- Changes to data fetching, caching, or revalidation
- Loading-state/skeleton-shape fixes and shared error/empty-state component (separate finding from the same review, not addressed here)
