# Design: Merge /news /statistics /faq into /

**Date:** 2026-05-31
**Status:** Approved

## Goal

Combine the four separate pages (`/`, `/news`, `/statistics`, `/faq`) into a single home page (`/`). The old routes redirect to anchor links on the home page. Comments are removed entirely.

## Page Structure

The home page (`/`) becomes one long vertical page with four distinct `<section>` elements, each with an `id`:

1. **`#status`** — existing dashboard grid (War Summary, Major Order, Space Station, Campaigns, Map, Dispatches) rendered inside the existing top-level `Container` (without `discussion` prop, keeping the current untitled card look)
2. **`#news`** — Steam Newsfeed + Wikipedia "About Helldivers 2" stacked vertically inside a two-column `Container` with title "News"
3. **`#statistics`** — Galaxy War Stats widget inside a `Container` with title "Statistics"
4. **`#faq`** — Liberation Mechanics + FAQ Section inside a `Container` with title "Frequently Asked Questions", followed by System Requirements inside a `Container` with title "PC System Requirements"

Each section keeps its current internal layout and styling. No redesign of individual widgets.

The Status section stays inside the existing page-level `Container` (the current home page wrapper). The News, Statistics, and FAQ sections each render their own `Container` component sequentially below it. This means the page consists of one large untitled card (Status) followed by titled cards (News, Statistics, FAQ) — matching the current per-page visual language.

## Navigation

The header nav items change from page links to anchor links:

| Before | After |
|--------|-------|
| Status → `/` | Status → `/` (top of page) |
| News → `/news` | News → `#news` |
| Statistics → `/statistics` | Statistics → `#statistics` |
| FAQ → `/faq` | FAQ → `#faq` |

- Each nav item uses a standard `<a href="#id">`.
- The logo still links to `/`.
- Active state logic is omitted for minimalism. Can be added later via IntersectionObserver if desired.
- The `Header` component remains a client component; no architecture change.

## Visual Separation

Each merged section is already wrapped in its own `Container` component (which renders a `<Card>` with an optional title). This provides natural visual separation. No additional separators (borders, spacers) are needed beyond the existing `Container` card boundaries.

## URL Handling & Redirects

Old route files are kept as minimal redirect pages using Next.js `permanentRedirect`:

- `app/news/page.tsx` → `permanentRedirect('/#news')`
- `app/statistics/page.tsx` → `permanentRedirect('/#statistics')`
- `app/faq/page.tsx` → `permanentRedirect('/#faq')`

This preserves external links and bookmarks, is SEO-friendly, and requires minimal code (≈5 lines per file).

## Comments

All Giscus comment sections (`<Comments />`) are removed. The `discussion` prop on `Container` becomes unused on the home page but is retained in the component signature for potential future use.

## Component Refactoring

The page content from the three removed pages is extracted into reusable components to keep `app/page.tsx` readable:

- `components/widgets/merged/news-section.tsx` — wraps `PatchNotes` + `WikipediaText` in the existing `Container` with `lgSplit`
- `components/widgets/merged/statistics-section.tsx` — wraps `Statistics` in a `Container`
- `components/widgets/merged/faq-section.tsx` — moves the content from `app/faq/page.tsx` (LiberationMechanics, FAQSection, SystemRequirementsCard, FAQPage logic)

## Data Flow

No changes. All widgets are async Server Components that fetch their own data via the existing data layer. No new APIs, no new data dependencies.

## Error Handling

No changes. Existing widget-level error handling (returning `null` on API failures) continues to work.

## Testing

No test suite is configured in this project. Manual verification checklist:
- [ ] Home page loads with all four sections visible
- [ ] Navigation anchor links scroll to correct sections
- [ ] `/news`, `/statistics`, `/faq` redirect to `/#news`, `/#statistics`, `/#faq`
- [ ] No Giscus comments are rendered anywhere
- [ ] Widgets still fetch and display data correctly

## Out of Scope

- Active nav state via scroll tracking (IntersectionObserver)
- Collapsible sections
- Dashboard-card wrapping for News/FAQ
- Redesign of individual widget internals
- Changes to data fetching, caching, or revalidation
