# Fix Broken Radix/Vaul UI Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore open/close animations in shadcn/ui dialog, sheet, dropdown-menu, navigation-menu, and drawer components by aligning Tailwind selectors with the `data-state` attribute actually emitted by the installed Radix UI / Vaul versions.

**Architecture:** The project uses shadcn/ui components generated for a newer Radix API (`data-open`/`data-closed` boolean attributes), but the installed packages (`radix-ui` 1.4.3 and `vaul` 1.1.2) still emit `data-state="open|closed"`. We will rewrite animation class selectors to use `data-[state=open]` / `data-[state=closed]`, remove unsupported `data-starting-style` / `data-ending-style` selectors, fix a duplicate-class bug in the drawer handle, and pin `radix-ui` so the dependency is deterministic.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, Radix UI (via `radix-ui` umbrella package), Vaul, shadcn/ui, Vitest.

---

## File Structure

| File                                              | Responsibility                                                                                  |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `package.json`                                    | Pin `radix-ui` from `"latest"` to `"1.4.3"`                                                     |
| `components/ui/dialog.tsx`                        | Fix overlay + content animation selectors                                                       |
| `components/ui/sheet.tsx`                         | Fix overlay animation selectors, remove unsupported `data-starting-style` / `data-ending-style` |
| `components/ui/dropdown-menu.tsx`                 | Fix content + sub-content animation selectors                                                   |
| `components/ui/navigation-menu.tsx`               | Fix trigger, content, and viewport animation/selectors                                          |
| `components/ui/drawer.tsx`                        | Fix overlay animation selectors, remove duplicate handle classes                                |
| `tests/components/ui/animation-selectors.test.ts` | Regression tests ensuring UI files use `data-[state=...]` selectors                             |

---

## Prerequisite

- [ ] **Create a dedicated worktree using `using-git-worktrees`** and run `pnpm install` inside it.

---

### Task 1: Pin `radix-ui` to a deterministic version

**Files:**

- Modify: `package.json`

**Why:** The dependency is currently `"radix-ui": "latest"`. The lockfile resolves to 1.4.3 today, but `"latest"` is non-deterministic and drifts over time. Pin it to the version we are targeting.

- [ ] **Step 1: Update dependency**

```json
{
  "dependencies": {
    "radix-ui": "1.4.3"
  }
}
```

Replace the existing `"radix-ui": "latest"` line in `package.json` with `"radix-ui": "1.4.3"`.

- [ ] **Step 2: Reinstall and verify lockfile**

Run:

```bash
pnpm install
```

Expected: `pnpm-lock.yaml` updates, no errors.

Verify:

```bash
cat node_modules/radix-ui/package.json | grep '"version"'
```

Expected output:

```
"version": "1.4.3"
```

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: pin radix-ui to 1.4.3"
```

---

### Task 2: Add regression test for animation selectors

**Files:**

- Create: `tests/components/ui/animation-selectors.test.ts`

**Why:** We want a fast, deterministic test that fails if anyone re-introduces `data-open:` / `data-closed:` selectors or the unsupported `data-starting-style` / `data-ending-style` attributes.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const UI_COMPONENTS = [
  "components/ui/dialog.tsx",
  "components/ui/sheet.tsx",
  "components/ui/dropdown-menu.tsx",
  "components/ui/navigation-menu.tsx",
  "components/ui/drawer.tsx",
];

function readComponent(file: string): string {
  return readFileSync(join(process.cwd(), file), "utf-8");
}

describe("UI component animation selectors", () => {
  UI_COMPONENTS.forEach((file) => {
    it(`${file} does not use data-open: or data-closed: selectors`, () => {
      const content = readComponent(file);
      expect(content).not.toMatch(/data-open:/);
      expect(content).not.toMatch(/data-closed:/);
    });

    it(`${file} uses data-[state=open]: and data-[state=closed]: selectors`, () => {
      const content = readComponent(file);
      expect(content).toMatch(/data-\[state=open\]:/);
      expect(content).toMatch(/data-\[state=closed\]:/);
    });
  });

  it("sheet.tsx does not use data-starting-style or data-ending-style", () => {
    const content = readComponent("components/ui/sheet.tsx");
    expect(content).not.toMatch(/data-starting-style/);
    expect(content).not.toMatch(/data-ending-style/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm vitest run tests/components/ui/animation-selectors.test.ts
```

Expected: FAIL with multiple assertions like `expected "components/ui/dialog.tsx" not to match /data-open:/`.

- [ ] **Step 3: Commit the failing test**

```bash
git add tests/components/ui/animation-selectors.test.ts
git commit -m "test: add regression test for UI animation selectors"
```

---

### Task 3: Fix `components/ui/dialog.tsx`

**Files:**

- Modify: `components/ui/dialog.tsx`

**Why:** Dialog overlay and content use `data-open:` / `data-closed:` selectors that never match the installed Radix Dialog, so open/close animations are skipped.

- [ ] **Step 1: Fix overlay class string**

Replace line 41:

```tsx
// old
className={cn("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 isolate z-50", className)}

// new
className={cn("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 isolate z-50", className)}
```

- [ ] **Step 2: Fix content class string**

Replace line 61:

```tsx
// old
className={cn(
  "bg-background data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 ring-foreground/10 grid max-w-[calc(100%-2rem)] gap-4 rounded-none p-4 text-xs/relaxed ring-1 duration-100 sm:max-w-sm fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2",
  className
)}

// new
className={cn(
  "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ring-foreground/10 grid max-w-[calc(100%-2rem)] gap-4 rounded-none p-4 text-xs/relaxed ring-1 duration-100 sm:max-w-sm fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2",
  className
)}
```

- [ ] **Step 3: Run the regression test for dialog**

Run:

```bash
pnpm vitest run tests/components/ui/animation-selectors.test.ts
```

Expected: The dialog assertions now pass; the remaining components still fail.

- [ ] **Step 4: Commit**

```bash
git add components/ui/dialog.tsx
git commit -m "fix(dialog): use data-state selectors for open/close animations"
```

---

### Task 4: Fix `components/ui/sheet.tsx`

**Files:**

- Modify: `components/ui/sheet.tsx`

**Why:** Sheet overlay uses `data-open:` / `data-closed:` and unsupported `data-starting-style` / `data-ending-style` selectors.

- [ ] **Step 1: Fix overlay class string**

Replace line 39:

```tsx
// old
className={cn("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 text-xs/relaxed duration-100 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 z-50", className)}

// new
className={cn("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-black/10 text-xs/relaxed duration-100 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 z-50", className)}
```

- [ ] **Step 2: Run the regression test for sheet**

Run:

```bash
pnpm vitest run tests/components/ui/animation-selectors.test.ts
```

Expected: Sheet assertions pass; remaining components still fail.

- [ ] **Step 3: Commit**

```bash
git add components/ui/sheet.tsx
git commit -m "fix(sheet): use data-state selectors and remove unsupported style attrs"
```

---

### Task 5: Fix `components/ui/dropdown-menu.tsx`

**Files:**

- Modify: `components/ui/dropdown-menu.tsx`

**Why:** Dropdown content and sub-content mix `data-open:` / `data-closed:` with one stray `data-[state=closed]:overflow-hidden`. Align all selectors to `data-[state=...]`.

- [ ] **Step 1: Fix content class string**

Replace line 46:

```tsx
// old
className={cn("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground min-w-32 rounded-none shadow-md ring-1 duration-100 z-50 max-h-(--radix-dropdown-menu-content-available-height) w-(--radix-dropdown-menu-trigger-width) origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto data-[state=closed]:overflow-hidden", className )}

// new
className={cn("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground min-w-32 rounded-none shadow-md ring-1 duration-100 z-50 max-h-(--radix-dropdown-menu-content-available-height) w-(--radix-dropdown-menu-trigger-width) origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto data-[state=closed]:overflow-hidden", className)}
```

- [ ] **Step 2: Fix sub-content class string**

Replace line 233:

```tsx
// old
className={cn("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground min-w-[96px] rounded-none shadow-lg ring-1 duration-100 z-50 origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden", className )}

// new
className={cn("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground min-w-[96px] rounded-none shadow-lg ring-1 duration-100 z-50 origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden", className)}
```

- [ ] **Step 3: Run the regression test for dropdown-menu**

Run:

```bash
pnpm vitest run tests/components/ui/animation-selectors.test.ts
```

Expected: Dropdown-menu assertions pass; navigation-menu and drawer still fail.

- [ ] **Step 4: Commit**

```bash
git add components/ui/dropdown-menu.tsx
git commit -m "fix(dropdown-menu): use data-state selectors for animations"
```

---

### Task 6: Fix `components/ui/navigation-menu.tsx`

**Files:**

- Modify: `components/ui/navigation-menu.tsx`

**Why:** Trigger, chevron, content, and viewport use `data-open`, `data-closed`, `data-popup-open`, and `group-data-open` selectors that do not match the installed Radix NavigationMenu.

- [ ] **Step 1: Fix trigger style class string**

Replace line 62:

```tsx
// old
const navigationMenuTriggerStyle = cva(
  "bg-background hover:bg-muted focus:bg-muted data-open:hover:bg-muted data-open:focus:bg-muted data-open:bg-muted/50 focus-visible:ring-ring/50 data-popup-open:bg-muted/50 data-popup-open:hover:bg-muted rounded-none px-2.5 py-1.5 text-xs font-medium transition-all focus-visible:ring-1 focus-visible:outline-1 disabled:opacity-50 group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center disabled:pointer-events-none outline-none",
);

// new
const navigationMenuTriggerStyle = cva(
  "bg-background hover:bg-muted focus:bg-muted data-[state=open]:hover:bg-muted data-[state=open]:focus:bg-muted data-[state=open]:bg-muted/50 focus-visible:ring-ring/50 data-[state=open]:bg-muted/50 data-[state=open]:hover:bg-muted rounded-none px-2.5 py-1.5 text-xs font-medium transition-all focus-visible:ring-1 focus-visible:outline-1 disabled:opacity-50 group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center disabled:pointer-events-none outline-none",
);
```

- [ ] **Step 2: Fix chevron rotation class string**

Replace line 77:

```tsx
// old
<IconChevronDown className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-open/navigation-menu-trigger:rotate-180 group-data-popup-open/navigation-menu-trigger:rotate-180" aria-hidden="true" />

// new
<IconChevronDown className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]/navigation-menu-trigger:rotate-180" aria-hidden="true" />
```

- [ ] **Step 3: Fix content class string**

Replace line 90:

```tsx
// old
className={cn(
  "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-open:animate-in group-data-[viewport=false]/navigation-menu:data-closed:animate-out group-data-[viewport=false]/navigation-menu:data-closed:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-open:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-open:fade-in-0 group-data-[viewport=false]/navigation-menu:data-closed:fade-out-0 group-data-[viewport=false]/navigation-menu:ring-foreground/10 p-1 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[viewport=false]/navigation-menu:rounded-none group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:ring-1 group-data-[viewport=false]/navigation-menu:duration-300 top-0 left-0 w-full group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none md:absolute md:w-auto",
  className
)}

// new
className={cn(
  "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:ring-foreground/10 p-1 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[viewport=false]/navigation-menu:rounded-none group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:ring-1 group-data-[viewport=false]/navigation-menu:duration-300 top-0 left-0 w-full group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none md:absolute md:w-auto",
  className
)}
```

- [ ] **Step 4: Fix viewport class string**

Replace line 111:

```tsx
// old
className={cn(
  "bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:zoom-out-95 data-open:zoom-in-90 ring-foreground/10 rounded-none shadow ring-1 duration-100 origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden md:w-[var(--radix-navigation-menu-viewport-width)]",
  className
)}

// new
className={cn(
  "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 ring-foreground/10 rounded-none shadow ring-1 duration-100 origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden md:w-[var(--radix-navigation-menu-viewport-width)]",
  className
)}
```

- [ ] **Step 5: Run the regression test for navigation-menu**

Run:

```bash
pnpm vitest run tests/components/ui/animation-selectors.test.ts
```

Expected: Navigation-menu assertions pass; drawer still fails.

- [ ] **Step 6: Commit**

```bash
git add components/ui/navigation-menu.tsx
git commit -m "fix(navigation-menu): use data-state selectors for animations"
```

---

### Task 7: Fix `components/ui/drawer.tsx`

**Files:**

- Modify: `components/ui/drawer.tsx`

**Why:** Drawer overlay uses `data-open:` / `data-closed:` selectors that do not match `vaul` (it emits `data-state`). The drawer handle also has duplicated class names.

- [ ] **Step 1: Fix overlay class string**

Replace line 39:

```tsx
// old
className={cn("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 z-50", className)}

// new
className={cn("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-black/10 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 z-50", className)}
```

- [ ] **Step 2: Remove duplicate classes from drawer handle**

Replace line 61:

```tsx
// old
<div className="bg-muted mx-auto mt-4 hidden h-1 w-[100px] shrink-0 rounded-none group-data-[vaul-drawer-direction=bottom]/drawer-content:block bg-muted mx-auto hidden shrink-0 group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />

// new
<div className="bg-muted mx-auto mt-4 hidden h-1 w-[100px] shrink-0 rounded-none group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
```

- [ ] **Step 3: Run the full regression test suite**

Run:

```bash
pnpm vitest run tests/components/ui/animation-selectors.test.ts
```

Expected: ALL tests pass.

- [ ] **Step 4: Commit**

```bash
git add components/ui/drawer.tsx
git commit -m "fix(drawer): use data-state selectors and deduplicate handle classes"
```

---

### Task 8: Verify build and full test suite

**Files:**

- None (verification only)

- [ ] **Step 1: Run Prettier on affected files**

Run:

```bash
pnpm prettier --write components/ui/dialog.tsx components/ui/sheet.tsx components/ui/dropdown-menu.tsx components/ui/navigation-menu.tsx components/ui/drawer.tsx tests/components/ui/animation-selectors.test.ts
```

- [ ] **Step 2: Run full test suite**

Run:

```bash
pnpm test:run
```

Expected: All 69 existing tests + the new regression tests pass.

- [ ] **Step 3: Run TypeScript type check**

Run:

```bash
pnpm tsc --noEmit
```

Expected: No errors in application code (the pre-existing test-only TS errors are out of scope for this plan).

- [ ] **Step 4: Run production build**

Run:

```bash
pnpm build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit formatting changes**

```bash
git add -A
git commit -m "style: format UI components after animation selector fixes"
```

---

## Self-Review

**1. Spec coverage:** This plan covers the broken `data-open`/`data-closed` animation selectors in all five affected UI components, the unsupported `data-starting-style`/`data-ending-style` attributes in sheet, the duplicate drawer handle classes, deterministic `radix-ui` versioning, and regression tests.

**2. Placeholder scan:** No TBD/TODO placeholders. Every step contains exact file paths, exact before/after code, and exact commands.

**3. Type consistency:** All replacements keep the same Tailwind utility classes and only change the data-attribute selector prefix from `data-open`/`data-closed` to `data-[state=open]`/`data-[state=closed]`.
