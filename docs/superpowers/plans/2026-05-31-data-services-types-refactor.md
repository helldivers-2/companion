# Data / Services / Types Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the codebase into layered functional modules (`lib/api/`, `lib/services/`, `lib/transformers/`, `lib/data/`, `types/`) with explicit DTOs, Result types, React `cache()`, and Vitest unit tests, migrating one domain at a time.

**Architecture:** Widgets (RSC) call composed queries in `lib/data/` which orchestrate `lib/services/` to fetch from `lib/api/`. Pure transformations live in `lib/transformers/` and are tested independently. All shared types live under `types/` with explicit DTO/App separation.

**Tech Stack:** Next.js 16 App Router (RSC), TypeScript, Vitest (`environment: 'node'`), React `cache()` for request deduplication.

---

## File Structure

```text
lib/
  api/
    client.ts          # getAPI() — Result type, retries, timeouts, headers
    endpoints.ts       # URL builders & revalidation constants per endpoint
  services/
    campaigns.ts       # fetchCampaigns(), fetchWarStats()
    assignments.ts     # fetchAssignments()
    dispatches.ts      # fetchDispatches()
    space-station.ts   # fetchSpaceStations()
    news.ts            # fetchPatchNotes()
  transformers/
    campaigns.ts       # DTO→App mapping + pure math
    dispatches.ts      # parseContent(), getDispatchTypeInfo()
    assignments.ts     # getStatusInfo(), getRewardTypeLabel(), mapAssignmentDto()
    war.ts             # mapWarStatsDto()
    space-station.ts   # mapSpaceStationDto(), mapTacticalActionDto(), mapCostDto()
    news.ts            # mapPatchNoteDto()
  data/
    dispatches.ts       # getDispatches() with cache()
    assignments.ts      # getAssignments() with cache()
    campaigns.ts        # getCampaignData() with cache()
    war.ts              # getWarStats() with cache()
    dashboard.ts        # getDashboardStats() with cache()
    space-station.ts    # getSpaceStations() with cache()
    news.ts             # getPatchNotes() with cache()
types/
  campaigns.ts         # DTOs + Application types
  assignments.ts       # DTOs + Application types
  dispatches.ts        # DTOs + Application types
  war.ts               # DTOs + Application types
  space-station.ts     # DTOs + Application types
  news.ts              # DTOs + Application types
```

---

## Phase 1: Infrastructure

### Task 1: Set up Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Install Vitest**

Run: `pnpm add -D vitest`
Expected: Package installed successfully.

- [ ] **Step 2: Add test scripts to package.json**

Modify `package.json`:
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

- [ ] **Step 3: Create vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 4: Run tests**

Run: `pnpm test:run`
Expected: Vitest starts and finds 0 tests. No errors.

- [ ] **Step 5: Commit**

```bash
git add package.json vitest.config.ts pnpm-lock.yaml
git commit -m "chore: add vitest with node environment"
```

### Task 2: Create lib/api/client.ts and lib/api/endpoints.ts

**Files:**
- Create: `lib/api/client.ts`
- Create: `lib/api/endpoints.ts`
- Create: `tests/lib/api/client.test.ts`

- [ ] **Step 1: Write failing test for client**

Create `tests/lib/api/client.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAPI } from "@/lib/api/client";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("getAPI", () => {
  it("returns success on valid response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ foo: "bar" }),
    } as Response);

    const result = await getAPI({ url: "/test" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ foo: "bar" });
    }
  });

  it("returns error on HTTP failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);

    const result = await getAPI({ url: "/test" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("500");
    }
  });

  it("retries once on 429 and succeeds", async () => {
    const fetchMock = vi.fn();
    fetchMock
      .mockResolvedValueOnce({
        status: 429,
        headers: { get: (name: string) => (name === "retry-after" ? "1" : null) },
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: "ok" }),
      } as Response);

    global.fetch = fetchMock;

    const result = await getAPI({ url: "/test" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(true);
  });

  it("returns error on fetch exception", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const result = await getAPI({ url: "/test" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("Network error");
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run tests/lib/api/client.test.ts`
Expected: FAIL with "getAPI is not defined" or "Cannot find module"

- [ ] **Step 3: Create endpoints file**

Create `lib/api/endpoints.ts`:
```typescript
export const ENDPOINTS = {
  CAMPAIGNS: { url: "/v1/campaigns", revalidate: 3600 },
  WAR: { url: "/v1/war", revalidate: 1800 },
  ASSIGNMENTS: { url: "/v1/assignments", revalidate: 900 },
  DISPATCHES: { url: "/v2/dispatches", revalidate: 600 },
  SPACE_STATION: { url: "/v2/space-stations", revalidate: 3600 },
  STEAM: { url: "/v1/steam", revalidate: 300 },
} as const;
```

- [ ] **Step 4: Implement API client**

Create `lib/api/client.ts`:
```typescript
import { siteConfig } from "@/config/site";

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

export async function getAPI<T>({
  url,
  revalidate = 3600,
  timeout = 10000,
}: {
  url: string;
  revalidate?: number | false;
  timeout?: number;
}): Promise<Result<T>> {
  try {
    const fetchOptions = {
      next: { revalidate },
      headers: {
        "X-Super-Client": siteConfig.x_super.client,
        "X-Super-Contact": siteConfig.x_super.contact,
      },
    };
    const apiUrl = `https://api.helldivers2.dev/api${url}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let res: Response;
    try {
      res = await fetch(apiUrl, { ...fetchOptions, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("retry-after")) || 2;
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      const retryController = new AbortController();
      const retryTimeoutId = setTimeout(() => retryController.abort(), timeout);
      try {
        res = await fetch(apiUrl, { ...fetchOptions, signal: retryController.signal });
      } finally {
        clearTimeout(retryTimeoutId);
      }
    }

    if (!res.ok) {
      const message = `API ${url} returned HTTP ${res.status}: ${res.statusText}`;
      console.error(message);
      return { success: false, error: new Error(message) };
    }

    const data = (await res.json()) as T;
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`API ${url} failed: ${message}`);
    return { success: false, error: new Error(message) };
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm test:run tests/lib/api/client.test.ts`
Expected: All 4 tests PASS

- [ ] **Step 6: Commit**

```bash
git add lib/api/ tests/lib/api/
git commit -m "feat: add api client with Result type and endpoints"
```

---

## Phase 2: Dispatches Domain

### Task 3: Create types/dispatches.ts

**Files:**
- Create: `types/dispatches.ts`

- [ ] **Step 1: Create file**

```typescript
export interface DispatchDto {
  id: number;
  published: string;
  type: number;
  message: string;
}

export interface Dispatch {
  id: number;
  published: string;
  type: number;
  message: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add types/dispatches.ts
git commit -m "types: add dispatches DTOs and app types"
```

### Task 4: Create lib/services/dispatches.ts + test

**Files:**
- Create: `lib/services/dispatches.ts`
- Create: `tests/lib/services/dispatches.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/services/dispatches.test.ts`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { fetchDispatches } from "@/lib/services/dispatches";
import { getAPI } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  getAPI: vi.fn(),
}));

describe("fetchDispatches", () => {
  it("returns DTOs on success", async () => {
    const mock = [{ id: 1, published: "2024-01-01", type: 0, message: "Hello" }];
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: mock });

    const result = await fetchDispatches();
    expect(result).toEqual(mock);
  });

  it("throws on API failure", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchDispatches()).rejects.toThrow("Failed to fetch dispatches");
  });

  it("throws on invalid shape", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: { notAnArray: true } });
    await expect(fetchDispatches()).rejects.toThrow("Invalid dispatches data");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run tests/lib/services/dispatches.test.ts`
Expected: FAIL with "fetchDispatches is not defined"

- [ ] **Step 3: Implement service**

Create `lib/services/dispatches.ts`:
```typescript
import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { DispatchDto } from "@/types/dispatches";

export async function fetchDispatches(): Promise<DispatchDto[]> {
  const result = await getAPI<DispatchDto[]>({
    url: ENDPOINTS.DISPATCHES.url,
    revalidate: ENDPOINTS.DISPATCHES.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch dispatches: ${result.error.message}`);
  }
  if (!Array.isArray(result.data)) {
    throw new Error("Invalid dispatches data: expected array");
  }
  return result.data;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:run tests/lib/services/dispatches.test.ts`
Expected: All 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/services/dispatches.ts tests/lib/services/dispatches.test.ts
git commit -m "feat: add dispatches service with tests"
```

### Task 5: Create lib/transformers/dispatches.ts + test

**Files:**
- Create: `lib/transformers/dispatches.ts`
- Create: `tests/lib/transformers/dispatches.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/transformers/dispatches.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { mapDispatchDto, parseContent, getDispatchTypeInfo } from "@/lib/transformers/dispatches";

describe("mapDispatchDto", () => {
  it("maps identical fields", () => {
    const dto = { id: 1, published: "2024-01-01", type: 0, message: "Test" };
    expect(mapDispatchDto(dto)).toEqual(dto);
  });
});

describe("parseContent", () => {
  it("strips i tags", () => {
    expect(parseContent("<i=1>hello</i>")).toBe("hello");
  });

  it("strips span tags with data-ah", () => {
    expect(parseContent('<span data-ah="1">world</span>')).toBe("world");
  });

  it("trims whitespace", () => {
    expect(parseContent("  text  ")).toBe("text");
  });
});

describe("getDispatchTypeInfo", () => {
  it("returns victory for major order won", () => {
    const info = getDispatchTypeInfo("Major Order WON");
    expect(info.label).toBe("Victory");
  });

  it("returns failure for major order failed", () => {
    const info = getDispatchTypeInfo("Major Order FAILED");
    expect(info.label).toBe("Failed");
  });

  it("returns update by default", () => {
    const info = getDispatchTypeInfo("Regular update");
    expect(info.label).toBe("Update");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run tests/lib/transformers/dispatches.test.ts`
Expected: FAIL with functions not defined

- [ ] **Step 3: Implement transformers**

Create `lib/transformers/dispatches.ts`:
```typescript
import type { DispatchDto, Dispatch } from "@/types/dispatches";
import { Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export function mapDispatchDto(dto: DispatchDto): Dispatch {
  return { ...dto };
}

export function parseContent(content: string): string {
  return content
    .replace(/<i=\d+>(.*?)<\/i>/g, "$1")
    .replace(/<span[^>]*data-ah="[^"]*"[^>]*>(.*?)<\/span>/g, "$1")
    .trim();
}

export interface DispatchTypeInfo {
  type: string;
  label: string;
  icon: typeof Clock;
  color: string;
}

export function getDispatchTypeInfo(message: string): DispatchTypeInfo {
  const upperMessage = message.toUpperCase();
  if (upperMessage.includes("MAJOR ORDER WON")) {
    return {
      type: "success",
      label: "Victory",
      icon: CheckCircle,
      color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    };
  } else if (upperMessage.includes("MAJOR ORDER FAILED")) {
    return {
      type: "failure",
      label: "Failed",
      icon: XCircle,
      color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    };
  } else if (upperMessage.includes("NEW MAJOR ORDER")) {
    return {
      type: "urgent",
      label: "New Order",
      icon: AlertTriangle,
      color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
    };
  } else if (
    upperMessage.includes("SABOTAGED") ||
    upperMessage.includes("INVASION")
  ) {
    return {
      type: "alert",
      label: "Alert",
      icon: AlertTriangle,
      color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    };
  }
  return {
    type: "info",
    label: "Update",
    icon: Clock,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:run tests/lib/transformers/dispatches.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/transformers/dispatches.ts tests/lib/transformers/dispatches.test.ts
git commit -m "feat: add dispatches transformers with tests"
```

### Task 6: Create lib/data/dispatches.ts + test

**Files:**
- Create: `lib/data/dispatches.ts`
- Create: `tests/lib/data/dispatches.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/data/dispatches.test.ts`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { getDispatches } from "@/lib/data/dispatches";
import { fetchDispatches } from "@/lib/services/dispatches";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => any>(fn: T): T => fn,
  };
});

vi.mock("@/lib/services/dispatches", () => ({
  fetchDispatches: vi.fn(),
}));

describe("getDispatches", () => {
  it("returns mapped dispatches", async () => {
    const mock = [{ id: 1, published: "2024-01-01", type: 0, message: "Hello" }];
    vi.mocked(fetchDispatches).mockResolvedValue(mock);

    const result = await getDispatches();
    expect(result).toHaveLength(1);
    expect(result[0].message).toBe("Hello");
  });

  it("returns empty array on failure", async () => {
    vi.mocked(fetchDispatches).mockRejectedValue(new Error("fail"));
    const result = await getDispatches();
    expect(result).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run tests/lib/data/dispatches.test.ts`
Expected: FAIL with "getDispatches is not defined"

- [ ] **Step 3: Implement data layer**

Create `lib/data/dispatches.ts`:
```typescript
import { cache } from "react";
import { fetchDispatches } from "@/lib/services/dispatches";
import { mapDispatchDto } from "@/lib/transformers/dispatches";
import type { Dispatch } from "@/types/dispatches";

async function _getDispatches(): Promise<Dispatch[]> {
  try {
    const dtos = await fetchDispatches();
    return dtos.map(mapDispatchDto);
  } catch (error) {
    console.error("getDispatches failed:", error);
    return [];
  }
}

export const getDispatches = cache(_getDispatches);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:run tests/lib/data/dispatches.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/data/dispatches.ts tests/lib/data/dispatches.test.ts
git commit -m "feat: add dispatches data layer with tests"
```

### Task 7: Update dispatches widget

**Files:**
- Modify: `components/widgets/root/dispatches.tsx`

- [ ] **Step 1: Update widget**

Replace the complete file:
```typescript
import { getDispatches } from "@/lib/data/dispatches";
import { parseContent, getDispatchTypeInfo } from "@/lib/transformers/dispatches";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function Dispatches() {
  const dispatches = await getDispatches();

  return (
    <div className="space-y-3">
      {dispatches.slice(0, 5).map((dispatch) => {
        const publishedDate = new Date(dispatch.published);
        const typeInfo = getDispatchTypeInfo(dispatch.message);
        const Icon = typeInfo.icon;

        return (
          <div
            key={dispatch.id}
            className="border-b border-border pb-3 last:border-0 last:pb-0"
          >
            <div className="flex items-center justify-between mb-1.5">
              <Badge
                variant="secondary"
                className={`${typeInfo.color} border-0 font-medium`}
              >
                <Icon className="mr-1.5 h-3 w-3" />
                {typeInfo.label}
              </Badge>

              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                <time dateTime={dispatch.published}>
                  {formatDistanceToNow(publishedDate, {
                    addSuffix: true,
                  })}
                </time>
              </div>
            </div>

            <div className="text-sm leading-relaxed">
              {parseContent(dispatch.message)}
            </div>
          </div>
        );
      })}

      {dispatches.length === 0 && (
        <div className="py-8 text-center">
          <Clock className="mx-auto mb-3 h-10 w-10" />
          <h3 className="mb-1 text-base font-medium">No dispatches available</h3>
          <p className="text-sm text-muted-foreground">Check back later for updates from High Command</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build check**

Run: `pnpm build`
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add components/widgets/root/dispatches.tsx
git commit -m "refactor: migrate dispatches widget to new data layer"
```

---

## Phase 3: Assignments Domain

### Task 8: Update types/assignments.ts with DTOs

**Files:**
- Modify: `types/assignments.ts`

- [ ] **Step 1: Update file**

```typescript
export interface RewardDto {
  type: number;
  amount: number;
}

export interface AssignmentDto {
  id: string | number;
  briefing: string;
  expiration: string;
  progress: number[];
  rewards?: RewardDto[];
}

export interface Reward {
  type: number;
  amount: number;
}

export interface Assignment {
  id: string | number;
  briefing: string;
  expiration: string;
  progress: number[];
  rewards?: Reward[];
}

export interface StatusInfo {
  text: string;
  color: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add types/assignments.ts
git commit -m "types: add assignment DTOs alongside app types"
```

### Task 9: Create lib/services/assignments.ts + test

**Files:**
- Create: `lib/services/assignments.ts`
- Create: `tests/lib/services/assignments.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/services/assignments.test.ts`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { fetchAssignments } from "@/lib/services/assignments";
import { getAPI } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  getAPI: vi.fn(),
}));

describe("fetchAssignments", () => {
  it("returns DTOs on success", async () => {
    const mock = [{ id: 1, briefing: "Test", expiration: "2024-01-01", progress: [0] }];
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: mock });

    const result = await fetchAssignments();
    expect(result).toEqual(mock);
  });

  it("throws on API failure", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchAssignments()).rejects.toThrow("Failed to fetch assignments");
  });

  it("throws on invalid shape", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: "not-array" });
    await expect(fetchAssignments()).rejects.toThrow("Invalid assignments data");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run tests/lib/services/assignments.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement service**

Create `lib/services/assignments.ts`:
```typescript
import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { AssignmentDto } from "@/types/assignments";

export async function fetchAssignments(): Promise<AssignmentDto[]> {
  const result = await getAPI<AssignmentDto[]>({
    url: ENDPOINTS.ASSIGNMENTS.url,
    revalidate: ENDPOINTS.ASSIGNMENTS.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch assignments: ${result.error.message}`);
  }
  if (!Array.isArray(result.data)) {
    throw new Error("Invalid assignments data: expected array");
  }
  return result.data;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:run tests/lib/services/assignments.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/services/assignments.ts tests/lib/services/assignments.test.ts
git commit -m "feat: add assignments service with tests"
```

### Task 10: Create lib/transformers/assignments.ts + test

**Files:**
- Create: `lib/transformers/assignments.ts`
- Create: `tests/lib/transformers/assignments.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/transformers/assignments.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { mapAssignmentDto, getRewardTypeLabel, getStatusInfo } from "@/lib/transformers/assignments";

describe("mapAssignmentDto", () => {
  it("maps fields correctly", () => {
    const dto = {
      id: 1,
      briefing: "Test",
      expiration: "2024-01-01",
      progress: [0, 1],
      rewards: [{ type: 1, amount: 100 }],
    };
    const result = mapAssignmentDto(dto);
    expect(result.briefing).toBe("Test");
    expect(result.rewards).toEqual([{ type: 1, amount: 100 }]);
  });

  it("handles missing rewards", () => {
    const dto = {
      id: 1,
      briefing: "Test",
      expiration: "2024-01-01",
      progress: [0],
    };
    const result = mapAssignmentDto(dto);
    expect(result.rewards).toBeUndefined();
  });
});

describe("getRewardTypeLabel", () => {
  it("returns Medals for type 1", () => {
    expect(getRewardTypeLabel(1)).toBe("Medals");
  });
  it("returns Unknown for invalid type", () => {
    expect(getRewardTypeLabel(999)).toBe("Unknown Reward");
  });
});

describe("getStatusInfo", () => {
  it("returns EXPIRED for past date", () => {
    const past = new Date(Date.now() - 1000).toISOString();
    const info = getStatusInfo(past, 0);
    expect(info.text).toBe("EXPIRED");
  });
  it("returns COMPLETED for 100% progress", () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    const info = getStatusInfo(future, 100);
    expect(info.text).toBe("COMPLETED");
  });
  it("returns URGENT for less than 24h", () => {
    const soon = new Date(Date.now() + 3600000).toISOString();
    const info = getStatusInfo(soon, 50);
    expect(info.text).toBe("URGENT");
  });
  it("returns ACTIVE otherwise", () => {
    const future = new Date(Date.now() + 864000000).toISOString();
    const info = getStatusInfo(future, 50);
    expect(info.text).toBe("ACTIVE");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run tests/lib/transformers/assignments.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement transformers**

Create `lib/transformers/assignments.ts`:
```typescript
import type { AssignmentDto, Assignment, StatusInfo } from "@/types/assignments";

export function mapAssignmentDto(dto: AssignmentDto): Assignment {
  return {
    id: dto.id,
    briefing: dto.briefing,
    expiration: dto.expiration,
    progress: dto.progress,
    rewards: dto.rewards
      ? dto.rewards.map((r) => ({ type: r.type, amount: r.amount }))
      : undefined,
  };
}

const REWARD_TYPES: Record<number, string> = {
  1: "Medals",
  2: "Super Credits",
  3: "Samples",
  4: "Requisition",
};

type RewardType = keyof typeof REWARD_TYPES;

export function getRewardTypeLabel(type: number): string {
  return REWARD_TYPES[type as RewardType] || "Unknown Reward";
}

export function getStatusInfo(expiration: string, progressPercent: number): StatusInfo {
  const timeLeft = new Date(expiration).getTime() - new Date().getTime();
  if (timeLeft <= 0) return { text: "EXPIRED", color: "bg-red-500" };
  if (progressPercent === 100) return { text: "COMPLETED", color: "bg-green-500" };
  if (timeLeft < 24 * 60 * 60 * 1000) return { text: "URGENT", color: "bg-orange-500" };
  return { text: "ACTIVE", color: "bg-blue-500" };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:run tests/lib/transformers/assignments.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/transformers/assignments.ts tests/lib/transformers/assignments.test.ts
git commit -m "feat: add assignments transformers with tests"
```

### Task 11: Create lib/data/assignments.ts + test

**Files:**
- Create: `lib/data/assignments.ts`
- Create: `tests/lib/data/assignments.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/data/assignments.test.ts`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { getAssignments } from "@/lib/data/assignments";
import { fetchAssignments } from "@/lib/services/assignments";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => any>(fn: T): T => fn,
  };
});

vi.mock("@/lib/services/assignments", () => ({
  fetchAssignments: vi.fn(),
}));

describe("getAssignments", () => {
  it("returns mapped assignments", async () => {
    const mock = [{ id: 1, briefing: "Test", expiration: "2024-01-01", progress: [0] }];
    vi.mocked(fetchAssignments).mockResolvedValue(mock);

    const result = await getAssignments();
    expect(result).toHaveLength(1);
    expect(result[0].briefing).toBe("Test");
  });

  it("returns empty array on failure", async () => {
    vi.mocked(fetchAssignments).mockRejectedValue(new Error("fail"));
    const result = await getAssignments();
    expect(result).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run tests/lib/data/assignments.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement data layer**

Create `lib/data/assignments.ts`:
```typescript
import { cache } from "react";
import { fetchAssignments } from "@/lib/services/assignments";
import { mapAssignmentDto } from "@/lib/transformers/assignments";
import type { Assignment } from "@/types/assignments";

async function _getAssignments(): Promise<Assignment[]> {
  try {
    const dtos = await fetchAssignments();
    return dtos.map(mapAssignmentDto);
  } catch (error) {
    console.error("getAssignments failed:", error);
    return [];
  }
}

export const getAssignments = cache(_getAssignments);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:run tests/lib/data/assignments.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/data/assignments.ts tests/lib/data/assignments.test.ts
git commit -m "feat: add assignments data layer with tests"
```

### Task 12: Update major-order widget

**Files:**
- Modify: `components/widgets/root/major-order.tsx`

- [ ] **Step 1: Update widget**

Replace the complete file:
```typescript
import { getAssignments } from "@/lib/data/assignments";
import { getStatusInfo, getRewardTypeLabel } from "@/lib/transformers/assignments";
import type { Assignment } from "@/types/assignments";
import { formatDistanceToNow } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, CheckCircle2, Calendar, Award } from "lucide-react";

export default async function MajorOrder() {
  const assignments = await getAssignments();

  return (
    <>
      {assignments.length === 0 ? (
        <div className="py-12 text-center">
          <Target className="mx-auto mb-4 h-16 w-16 text-icon" />
          <h3 className="mb-2 text-xl font-semibold">No Major Orders Active</h3>
          <p className="text-muted-foreground">
            Super Earth Command has no active major orders at this time.
          </p>
        </div>
      ) : (
        <div>
          {assignments.map((assignment: Assignment) => {
            const completedCount = assignment.progress.filter((p) => p === 1).length;
            const progressPercent = assignment.progress.length > 0
              ? (completedCount / assignment.progress.length) * 100
              : 0;
            const timeRemaining = formatDistanceToNow(
              new Date(assignment.expiration),
              { addSuffix: true },
            );
            const statusInfo = getStatusInfo(assignment.expiration, progressPercent);
            const briefing = assignment.briefing;

            return (
              <div key={assignment.id}>
                <div className="space-y-3">
                  <div className="flex-1 space-y-3">
                    <p className="text-lg leading-relaxed">{briefing}</p>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <Badge
                        className={`${statusInfo.color} px-3 py-1 text-xs font-semibold tracking-wider uppercase`}
                      >
                        {statusInfo.text}
                      </Badge>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">
                          Expires {timeRemaining}
                        </span>
                      </div>

                      {assignment.rewards && assignment.rewards.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          <span className="font-medium">
                            {assignment.rewards[0].amount}{" "}
                            {getRewardTypeLabel(assignment.rewards[0].type)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-base font-semibold">
                      <Trophy className="h-5 w-5" />
                      Mission Progress
                    </h3>
                    <span className="text-sm font-semibold">
                      {Math.round(progressPercent)}% Complete
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Progress value={progressPercent} className="h-3" />
                    <div className="flex justify-between text-xs">
                      <span>
                        {completedCount} of {assignment.progress.length} objectives completed
                      </span>
                      {progressPercent === 100 && (
                        <span className="flex items-center gap-1 font-medium text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Mission Complete
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Build check**

Run: `pnpm build`
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add components/widgets/root/major-order.tsx
git commit -m "refactor: migrate major-order widget to new data layer"
```

---

## Phase 4: Campaigns / War / Space Station Domains

### Task 13: Create types/war.ts

**Files:**
- Create: `types/war.ts`

- [ ] **Step 1: Create file**

```typescript
export interface WarStatsDto {
  statistics: {
    playerCount: number;
    missionSuccessRate: number;
    missionsWon: number;
    missionTime: number;
    terminidKills: number;
    automatonKills: number;
    illuminateKills: number;
    bulletsFired: number;
    deaths: number;
    friendlies: number;
    missionsLost: number;
  };
}

export interface WarStats {
  playerCount: number;
  missionSuccessRate: number;
  missionsWon: number;
  missionTime: number;
  terminidKills: number;
  automatonKills: number;
  illuminateKills: number;
  bulletsFired: number;
  deaths: number;
  friendlies: number;
  missionsLost: number;
}
```

- [ ] **Step 2: Commit**

```bash
git add types/war.ts
git commit -m "types: add war stats DTOs and app types"
```

### Task 14: Update types/campaigns.ts with DTOs

**Files:**
- Modify: `types/campaigns.ts`

- [ ] **Step 1: Update file**

```typescript
export interface Species {
  value: string;
  icon: string;
}

export interface PlanetPositionDto {
  x: number;
  y: number;
}

export interface PlanetStatisticsDto {
  playerCount: number;
}

export interface PlanetEventDto {
  id: number;
  eventType: number;
  faction: string;
  health: number;
  maxHealth: number;
  startTime: string;
  endTime: string;
}

export interface PlanetDto {
  name: string;
  sector: string;
  position: PlanetPositionDto;
  health: number;
  maxHealth: number;
  regenPerSecond: number;
  currentOwner: string;
  initialOwner: string;
  statistics: PlanetStatisticsDto;
  event?: PlanetEventDto | null;
  biome?: { name: string; description: string };
  hazards?: { name: string; description: string }[];
}

export interface CampaignDto {
  id?: string | number;
  planet: PlanetDto;
  faction: string;
}

export interface PlanetPosition {
  x: number;
  y: number;
}

export interface PlanetStatistics {
  playerCount: number;
}

export interface PlanetEvent {
  id: number;
  eventType: number;
  faction: string;
  health: number;
  maxHealth: number;
  startTime: string;
  endTime: string;
}

export interface Planet {
  name: string;
  sector: string;
  position: PlanetPosition;
  health: number;
  maxHealth: number;
  regenPerSecond: number;
  currentOwner: string;
  initialOwner: string;
  statistics: PlanetStatistics;
  event?: PlanetEvent | null;
  biome?: { name: string; description: string };
  hazards?: { name: string; description: string }[];
}

export interface Campaign {
  id?: string | number;
  planet: Planet;
  faction: string;
}

export interface CampaignStats {
  campaigns: Campaign[];
  activePlanets: Campaign[];
  liberatedPlanets: Campaign[];
  liberatedPlayerCount: number;
}
```

- [ ] **Step 2: Commit**

```bash
git add types/campaigns.ts
git commit -m "types: add campaign DTOs alongside app types"
```

### Task 15: Update types/space-station.ts with DTOs

**Files:**
- Modify: `types/space-station.ts`

- [ ] **Step 1: Update file**

```typescript
import type { PlanetDto, Planet } from "./campaigns";

export interface CostDto {
  id: string;
  targetValue: number;
  currentValue: number;
  deltaPerSecond: number;
}

export interface TacticalActionDto {
  id32: number;
  name: string;
  description: string;
  strategicDescription: string;
  status: number;
  statusExpire: string;
  costs: CostDto[];
}

export interface SpaceStationDto {
  id32: number;
  planet: PlanetDto;
  electionEnd: string;
  flags: number;
  tacticalActions: TacticalActionDto[];
}

export interface Cost {
  id: string;
  targetValue: number;
  currentValue: number;
  deltaPerSecond: number;
}

export interface TacticalAction {
  id32: number;
  name: string;
  description: string;
  strategicDescription: string;
  status: number;
  statusExpire: string;
  costs: Cost[];
}

export interface SpaceStation {
  id32: number;
  planet: Planet;
  electionEnd: string;
  flags: number;
  tacticalActions: TacticalAction[];
}
```

- [ ] **Step 2: Commit**

```bash
git add types/space-station.ts
git commit -m "types: add space-station DTOs alongside app types"
```

### Task 16: Create lib/services/campaigns.ts + test

**Files:**
- Create: `lib/services/campaigns.ts`
- Create: `tests/lib/services/campaigns.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/services/campaigns.test.ts`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { fetchCampaigns, fetchWarStats } from "@/lib/services/campaigns";
import { getAPI } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  getAPI: vi.fn(),
}));

describe("fetchCampaigns", () => {
  it("returns DTOs on success", async () => {
    const mock = [
      {
        id: 1,
        planet: {
          name: "Test",
          sector: "S1",
          position: { x: 0, y: 0 },
          health: 50,
          maxHealth: 100,
          regenPerSecond: 0,
          currentOwner: "Humans",
          initialOwner: "Humans",
          statistics: { playerCount: 100 },
        },
        faction: "Terminids",
      },
    ];
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: mock });

    const result = await fetchCampaigns();
    expect(result).toEqual(mock);
  });

  it("throws on API failure", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchCampaigns()).rejects.toThrow("Failed to fetch campaigns");
  });

  it("throws on invalid shape", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: "not-array" });
    await expect(fetchCampaigns()).rejects.toThrow("Invalid campaigns data");
  });
});

describe("fetchWarStats", () => {
  it("returns DTO on success", async () => {
    const mock = { statistics: { playerCount: 1000 } };
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: mock });

    const result = await fetchWarStats();
    expect(result.statistics.playerCount).toBe(1000);
  });

  it("throws on API failure", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchWarStats()).rejects.toThrow("Failed to fetch war stats");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run tests/lib/services/campaigns.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement service**

Create `lib/services/campaigns.ts`:
```typescript
import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { CampaignDto } from "@/types/campaigns";
import type { WarStatsDto } from "@/types/war";

export async function fetchCampaigns(): Promise<CampaignDto[]> {
  const result = await getAPI<CampaignDto[]>({
    url: ENDPOINTS.CAMPAIGNS.url,
    revalidate: ENDPOINTS.CAMPAIGNS.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch campaigns: ${result.error.message}`);
  }
  if (!Array.isArray(result.data)) {
    throw new Error("Invalid campaigns data: expected array");
  }
  return result.data;
}

export async function fetchWarStats(): Promise<WarStatsDto> {
  const result = await getAPI<WarStatsDto>({
    url: ENDPOINTS.WAR.url,
    revalidate: ENDPOINTS.WAR.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch war stats: ${result.error.message}`);
  }
  return result.data;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:run tests/lib/services/campaigns.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/services/campaigns.ts tests/lib/services/campaigns.test.ts
git commit -m "feat: add campaigns and war service with tests"
```

### Task 17: Create lib/services/space-station.ts + test

**Files:**
- Create: `lib/services/space-station.ts`
- Create: `tests/lib/services/space-station.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/services/space-station.test.ts`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { fetchSpaceStations } from "@/lib/services/space-station";
import { getAPI } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  getAPI: vi.fn(),
}));

describe("fetchSpaceStations", () => {
  it("returns DTOs on success", async () => {
    const mock = [
      {
        id32: 1,
        planet: {
          name: "Test",
          sector: "S1",
          position: { x: 0, y: 0 },
          health: 100,
          maxHealth: 100,
          regenPerSecond: 0,
          currentOwner: "Humans",
          initialOwner: "Humans",
          statistics: { playerCount: 0 },
        },
        electionEnd: "2024-01-01",
        flags: 0,
        tacticalActions: [],
      },
    ];
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: mock });

    const result = await fetchSpaceStations();
    expect(result).toEqual(mock);
  });

  it("throws on API failure", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchSpaceStations()).rejects.toThrow("Failed to fetch space stations");
  });

  it("throws on invalid shape", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: "not-array" });
    await expect(fetchSpaceStations()).rejects.toThrow("Invalid space station data");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run tests/lib/services/space-station.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement service**

Create `lib/services/space-station.ts`:
```typescript
import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { SpaceStationDto } from "@/types/space-station";

export async function fetchSpaceStations(): Promise<SpaceStationDto[]> {
  const result = await getAPI<SpaceStationDto[]>({
    url: ENDPOINTS.SPACE_STATION.url,
    revalidate: ENDPOINTS.SPACE_STATION.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch space stations: ${result.error.message}`);
  }
  if (!Array.isArray(result.data)) {
    throw new Error("Invalid space station data: expected array");
  }
  return result.data;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:run tests/lib/services/space-station.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/services/space-station.ts tests/lib/services/space-station.test.ts
git commit -m "feat: add space-station service with tests"
```

### Task 18: Create lib/transformers/campaigns.ts + test

**Files:**
- Create: `lib/transformers/campaigns.ts`
- Create: `tests/lib/transformers/campaigns.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/transformers/campaigns.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import {
  getLiberation,
  getLiberationRate,
  getStatus,
  getTimeToLiberation,
  getPlanetStats,
  getCampaignStats,
  mapPlanetDto,
  mapCampaignDto,
  species,
} from "@/lib/transformers/campaigns";

describe("species", () => {
  it("has 4 factions", () => {
    expect(species).toHaveLength(4);
  });
});

describe("mapPlanetDto", () => {
  it("maps all fields", () => {
    const dto = {
      name: "Test",
      sector: "S1",
      position: { x: 1, y: 2 },
      health: 50,
      maxHealth: 100,
      regenPerSecond: 1,
      currentOwner: "Humans",
      initialOwner: "Humans",
      statistics: { playerCount: 10 },
      event: null,
    };
    const planet = mapPlanetDto(dto);
    expect(planet.name).toBe("Test");
    expect(planet.position.x).toBe(1);
    expect(planet.event).toBeNull();
  });
});

describe("mapCampaignDto", () => {
  it("maps campaign fields", () => {
    const dto = {
      id: 1,
      planet: {
        name: "Test",
        sector: "S1",
        position: { x: 0, y: 0 },
        health: 50,
        maxHealth: 100,
        regenPerSecond: 0,
        currentOwner: "Humans",
        initialOwner: "Humans",
        statistics: { playerCount: 0 },
      },
      faction: "Terminids",
    };
    const campaign = mapCampaignDto(dto);
    expect(campaign.faction).toBe("Terminids");
    expect(campaign.planet.name).toBe("Test");
  });
});

describe("getLiberation", () => {
  it("calculates liberation percentage", () => {
    expect(getLiberation(50, 100)).toBe("50.00");
  });
  it("clamps to 0-100", () => {
    expect(getLiberation(-10, 100)).toBe("100.00");
    expect(getLiberation(110, 100)).toBe("0.00");
  });
  it("handles inverse mode", () => {
    expect(getLiberation(50, 100, true)).toBe("50.00");
  });
  it("returns 0 for maxHealth 0", () => {
    expect(getLiberation(50, 0)).toBe("0.00");
  });
});

describe("getLiberationRate", () => {
  it("calculates hourly rate", () => {
    const rate = getLiberationRate(0.01, 100);
    expect(rate).toBeCloseTo(-3.6, 1);
  });
  it("returns 0 for maxHealth 0", () => {
    expect(getLiberationRate(0.01, 0)).toBe(0);
  });
});

describe("getStatus", () => {
  it("returns Gaining Ground for positive rate", () => {
    expect(getStatus(1).text).toBe("Gaining Ground");
  });
  it("returns Losing Ground for negative rate", () => {
    expect(getStatus(-1).text).toBe("Losing Ground");
  });
  it("returns Stalemate for neutral rate", () => {
    expect(getStatus(0).text).toBe("Stalemate");
  });
});

describe("getTimeToLiberation", () => {
  it("returns null for non-positive rate", () => {
    expect(getTimeToLiberation(50, 0)).toBeNull();
    expect(getTimeToLiberation(50, -1)).toBeNull();
  });
  it("returns minutes for short time", () => {
    expect(getTimeToLiberation(50, 50)).toBe("60m");
  });
  it("returns hours and minutes for longer time", () => {
    expect(getTimeToLiberation(50, 25)).toBe("2h 0m");
  });
});

describe("getPlanetStats", () => {
  it("calculates stats for a planet", () => {
    const planet = {
      name: "Test",
      sector: "S1",
      position: { x: 0, y: 0 },
      health: 50,
      maxHealth: 100,
      regenPerSecond: 0,
      currentOwner: "Humans",
      initialOwner: "Humans",
      statistics: { playerCount: 0 },
    };
    const stats = getPlanetStats(planet);
    expect(stats.liberation).toBe("50.00");
    expect(stats.status.text).toBe("Stalemate");
  });
});

describe("getCampaignStats", () => {
  it("categorizes campaigns correctly", () => {
    const campaigns = [
      {
        id: 1,
        planet: {
          name: "Active1",
          sector: "S1",
          position: { x: 0, y: 0 },
          health: 50,
          maxHealth: 100,
          regenPerSecond: 0,
          currentOwner: "Humans",
          initialOwner: "Humans",
          statistics: { playerCount: 10 },
        },
        faction: "Terminids",
      },
      {
        id: 2,
        planet: {
          name: "Liberated",
          sector: "S2",
          position: { x: 0, y: 0 },
          health: 100,
          maxHealth: 100,
          regenPerSecond: 0,
          currentOwner: "Humans",
          initialOwner: "Humans",
          statistics: { playerCount: 5 },
        },
        faction: "Automaton",
      },
    ];
    const stats = getCampaignStats(campaigns);
    expect(stats.activePlanets).toHaveLength(1);
    expect(stats.liberatedPlanets).toHaveLength(1);
    expect(stats.liberatedPlayerCount).toBe(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run tests/lib/transformers/campaigns.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement transformers**

Create `lib/transformers/campaigns.ts`:
```typescript
import type {
  CampaignDto,
  Campaign,
  PlanetDto,
  Planet,
  Species,
  CampaignStats,
} from "@/types/campaigns";

export const species: Species[] = [
  { value: "Humans", icon: "/factions/Super_Earth.webp" },
  { value: "Terminids", icon: "/factions/Terminids.webp" },
  { value: "Automaton", icon: "/factions/Automatons.webp" },
  { value: "Illuminate", icon: "/factions/Illuminate.webp" },
];

export function getFactionIcon(faction: string): string | null {
  const factionData = species.find((s) => s.value === faction);
  return factionData ? factionData.icon : null;
}

export function mapPlanetDto(dto: PlanetDto): Planet {
  return {
    name: dto.name,
    sector: dto.sector,
    position: dto.position,
    health: dto.health,
    maxHealth: dto.maxHealth,
    regenPerSecond: dto.regenPerSecond,
    currentOwner: dto.currentOwner,
    initialOwner: dto.initialOwner,
    statistics: dto.statistics,
    event: dto.event ?? null,
    biome: dto.biome,
    hazards: dto.hazards,
  };
}

export function mapCampaignDto(dto: CampaignDto): Campaign {
  return {
    id: dto.id,
    planet: mapPlanetDto(dto.planet),
    faction: dto.faction,
  };
}

export function getEffectiveHealth(
  planet: Planet,
): { health: number; maxHealth: number } {
  return {
    health: planet.event?.health ?? planet.health,
    maxHealth: planet.event?.maxHealth ?? planet.maxHealth,
  };
}

export function getLiberation(
  health: number,
  maxHealth: number,
  inverse: boolean = false,
): string {
  if (maxHealth === 0) return "0.00";
  const healthPercent = (health / maxHealth) * 100;
  const result = inverse ? healthPercent : 100 - healthPercent;
  return Math.max(0, Math.min(100, result)).toFixed(2);
}

export function getLiberationRate(
  regenPerSecond: number,
  maxHealth: number,
): number {
  if (maxHealth === 0) return 0;
  const hourlyRegen = regenPerSecond * 3600;
  const ratePercent = (hourlyRegen / maxHealth) * 100;
  return -ratePercent;
}

export function getStatus(
  rate: number,
): { text: string; color: string } {
  if (rate > 0.5) return { text: "Gaining Ground", color: "text-green-500" };
  if (rate < -0.5) return { text: "Losing Ground", color: "text-red-500" };
  return { text: "Stalemate", color: "text-yellow-500" };
}

export function getTimeToLiberation(
  liberation: number,
  ratePerHour: number,
): string | null {
  if (ratePerHour <= 0) return null;
  const hoursRemaining = (100 - liberation) / ratePerHour;
  const minutes = Math.round(hoursRemaining * 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return `${hours}h ${remainingMins}m`;
}

export function getPlanetStats(planet: Planet) {
  const { health, maxHealth } = getEffectiveHealth(planet);
  const liberation = getLiberation(health, maxHealth);
  const regenPerSecond = planet.regenPerSecond || 0;
  const rate = getLiberationRate(regenPerSecond, maxHealth);
  const status = getStatus(rate);
  const eta = getTimeToLiberation(Number(liberation), rate);
  return { liberation, rate, status, eta };
}

export function getCampaignStats(campaigns: Campaign[]): CampaignStats {
  const campaignPlanets = campaigns.filter(
    (campaign) =>
      campaign.planet.health < campaign.planet.maxHealth &&
      campaign.planet.event == null,
  );

  const eventPlanets = campaigns.filter(
    (campaign) =>
      campaign.planet.event != null &&
      campaign.planet.event.health < campaign.planet.event.maxHealth,
  );

  const activePlanets = [...campaignPlanets, ...eventPlanets].sort(
    (a, b) => {
      const { health: aH, maxHealth: aMH } = getEffectiveHealth(a.planet);
      const { health: bH, maxHealth: bMH } = getEffectiveHealth(b.planet);
      return bH / bMH - aH / aMH;
    },
  );

  const liberatedPlanets = campaigns.filter(
    (campaign) =>
      campaign.planet.health === campaign.planet.maxHealth &&
      campaign.planet.event === null,
  );

  const liberatedPlayerCount = liberatedPlanets.reduce(
    (sum, campaign) => {
      const playerCount = campaign.planet.statistics?.playerCount || 0;
      return sum + playerCount;
    },
    0,
  );

  return { campaigns, activePlanets, liberatedPlanets, liberatedPlayerCount };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:run tests/lib/transformers/campaigns.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/transformers/campaigns.ts tests/lib/transformers/campaigns.test.ts
git commit -m "feat: add campaign transformers with tests"
```

### Task 19: Create lib/transformers/war.ts + test

**Files:**
- Create: `lib/transformers/war.ts`
- Create: `tests/lib/transformers/war.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/transformers/war.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { mapWarStatsDto } from "@/lib/transformers/war";

describe("mapWarStatsDto", () => {
  it("maps statistics fields", () => {
    const dto = {
      statistics: {
        playerCount: 1000,
        missionSuccessRate: 50,
        missionsWon: 100,
        missionTime: 3600,
        terminidKills: 1000,
        automatonKills: 500,
        illuminateKills: 100,
        bulletsFired: 10000,
        deaths: 50,
        friendlies: 10,
        missionsLost: 5,
      },
    };
    const result = mapWarStatsDto(dto);
    expect(result.playerCount).toBe(1000);
    expect(result.missionSuccessRate).toBe(50);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run tests/lib/transformers/war.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement transformer**

Create `lib/transformers/war.ts`:
```typescript
import type { WarStatsDto, WarStats } from "@/types/war";

export function mapWarStatsDto(dto: WarStatsDto): WarStats {
  return dto.statistics;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:run tests/lib/transformers/war.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/transformers/war.ts tests/lib/transformers/war.test.ts
git commit -m "feat: add war stats transformer with tests"
```

### Task 20: Create lib/transformers/space-station.ts + test

**Files:**
- Create: `lib/transformers/space-station.ts`
- Create: `tests/lib/transformers/space-station.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/transformers/space-station.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { mapSpaceStationDto } from "@/lib/transformers/space-station";

describe("mapSpaceStationDto", () => {
  it("maps all fields", () => {
    const dto = {
      id32: 1,
      planet: {
        name: "Test",
        sector: "S1",
        position: { x: 0, y: 0 },
        health: 100,
        maxHealth: 100,
        regenPerSecond: 0,
        currentOwner: "Humans",
        initialOwner: "Humans",
        statistics: { playerCount: 0 },
      },
      electionEnd: "2024-01-01",
      flags: 0,
      tacticalActions: [
        {
          id32: 1,
          name: "Action",
          description: "Desc",
          strategicDescription: "Strat",
          status: 1,
          statusExpire: "2024-01-01",
          costs: [{ id: "c1", targetValue: 100, currentValue: 50, deltaPerSecond: 0 }],
        },
      ],
    };

    const result = mapSpaceStationDto(dto);
    expect(result.id32).toBe(1);
    expect(result.planet.name).toBe("Test");
    expect(result.tacticalActions).toHaveLength(1);
    expect(result.tacticalActions[0].costs[0].currentValue).toBe(50);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run tests/lib/transformers/space-station.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement transformer**

Create `lib/transformers/space-station.ts`:
```typescript
import type {
  SpaceStationDto,
  SpaceStation,
  TacticalActionDto,
  TacticalAction,
  CostDto,
  Cost,
} from "@/types/space-station";
import { mapPlanetDto } from "./campaigns";

export function mapCostDto(dto: CostDto): Cost {
  return { ...dto };
}

export function mapTacticalActionDto(dto: TacticalActionDto): TacticalAction {
  return {
    ...dto,
    costs: dto.costs.map(mapCostDto),
  };
}

export function mapSpaceStationDto(dto: SpaceStationDto): SpaceStation {
  return {
    id32: dto.id32,
    planet: mapPlanetDto(dto.planet),
    electionEnd: dto.electionEnd,
    flags: dto.flags,
    tacticalActions: dto.tacticalActions.map(mapTacticalActionDto),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:run tests/lib/transformers/space-station.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/transformers/space-station.ts tests/lib/transformers/space-station.test.ts
git commit -m "feat: add space-station transformer with tests"
```

### Task 21: Create lib/data/campaigns.ts + test

**Files:**
- Create: `lib/data/campaigns.ts`
- Create: `tests/lib/data/campaigns.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/data/campaigns.test.ts`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { getCampaignData } from "@/lib/data/campaigns";
import { fetchCampaigns } from "@/lib/services/campaigns";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => any>(fn: T): T => fn,
  };
});

vi.mock("@/lib/services/campaigns", () => ({
  fetchCampaigns: vi.fn(),
}));

describe("getCampaignData", () => {
  it("returns campaign stats on success", async () => {
    const mock = [
      {
        id: 1,
        planet: {
          name: "Test",
          sector: "S1",
          position: { x: 0, y: 0 },
          health: 50,
          maxHealth: 100,
          regenPerSecond: 0,
          currentOwner: "Humans",
          initialOwner: "Humans",
          statistics: { playerCount: 0 },
        },
        faction: "Terminids",
      },
    ];
    vi.mocked(fetchCampaigns).mockResolvedValue(mock);

    const result = await getCampaignData();
    expect(result.activePlanets).toHaveLength(1);
  });

  it("returns empty stats on failure", async () => {
    vi.mocked(fetchCampaigns).mockRejectedValue(new Error("fail"));
    const result = await getCampaignData();
    expect(result.activePlanets).toHaveLength(0);
    expect(result.liberatedPlayerCount).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run tests/lib/data/campaigns.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement data layer**

Create `lib/data/campaigns.ts`:
```typescript
import { cache } from "react";
import { fetchCampaigns } from "@/lib/services/campaigns";
import { mapCampaignDto, getCampaignStats } from "@/lib/transformers/campaigns";
import type { CampaignStats } from "@/types/campaigns";

async function _getCampaignData(): Promise<CampaignStats> {
  try {
    const dtos = await fetchCampaigns();
    const campaigns = dtos.map(mapCampaignDto);
    return getCampaignStats(campaigns);
  } catch (error) {
    console.error("getCampaignData failed:", error);
    return {
      campaigns: [],
      activePlanets: [],
      liberatedPlanets: [],
      liberatedPlayerCount: 0,
    };
  }
}

export const getCampaignData = cache(_getCampaignData);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:run tests/lib/data/campaigns.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/data/campaigns.ts tests/lib/data/campaigns.test.ts
git commit -m "feat: add campaigns data layer with tests"
```

### Task 22: Create lib/data/war.ts + test

**Files:**
- Create: `lib/data/war.ts`
- Create: `tests/lib/data/war.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/data/war.test.ts`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { getWarStats } from "@/lib/data/war";
import { fetchWarStats } from "@/lib/services/campaigns";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => any>(fn: T): T => fn,
  };
});

vi.mock("@/lib/services/campaigns", () => ({
  fetchWarStats: vi.fn(),
}));

describe("getWarStats", () => {
  it("returns mapped war stats", async () => {
    vi.mocked(fetchWarStats).mockResolvedValue({
      statistics: {
        playerCount: 1000,
        missionSuccessRate: 50,
        missionsWon: 100,
        missionTime: 3600,
        terminidKills: 1000,
        automatonKills: 500,
        illuminateKills: 100,
        bulletsFired: 10000,
        deaths: 50,
        friendlies: 10,
        missionsLost: 5,
      },
    });

    const result = await getWarStats();
    expect(result.playerCount).toBe(1000);
  });

  it("returns zeros on failure", async () => {
    vi.mocked(fetchWarStats).mockRejectedValue(new Error("fail"));
    const result = await getWarStats();
    expect(result.playerCount).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run tests/lib/data/war.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement data layer**

Create `lib/data/war.ts`:
```typescript
import { cache } from "react";
import { fetchWarStats } from "@/lib/services/campaigns";
import { mapWarStatsDto } from "@/lib/transformers/war";
import type { WarStats } from "@/types/war";

async function _getWarStats(): Promise<WarStats> {
  try {
    const dto = await fetchWarStats();
    return mapWarStatsDto(dto);
  } catch (error) {
    console.error("getWarStats failed:", error);
    return {
      playerCount: 0,
      missionSuccessRate: 0,
      missionsWon: 0,
      missionTime: 0,
      terminidKills: 0,
      automatonKills: 0,
      illuminateKills: 0,
      bulletsFired: 0,
      deaths: 0,
      friendlies: 0,
      missionsLost: 0,
    };
  }
}

export const getWarStats = cache(_getWarStats);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:run tests/lib/data/war.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/data/war.ts tests/lib/data/war.test.ts
git commit -m "feat: add war stats data layer with tests"
```

### Task 23: Create lib/data/dashboard.ts + test

**Files:**
- Create: `lib/data/dashboard.ts`
- Create: `tests/lib/data/dashboard.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/data/dashboard.test.ts`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { getDashboardStats } from "@/lib/data/dashboard";
import { getCampaignData } from "@/lib/data/campaigns";
import { getWarStats } from "@/lib/data/war";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => any>(fn: T): T => fn,
  };
});

vi.mock("@/lib/data/campaigns", () => ({
  getCampaignData: vi.fn(),
}));

vi.mock("@/lib/data/war", () => ({
  getWarStats: vi.fn(),
}));

describe("getDashboardStats", () => {
  it("returns dashboard data", async () => {
    vi.mocked(getCampaignData).mockResolvedValue({
      campaigns: [],
      activePlanets: [
        {
          id: 1,
          planet: {
            name: "Test",
            sector: "S1",
            position: { x: 0, y: 0 },
            health: 50,
            maxHealth: 100,
            regenPerSecond: 0,
            currentOwner: "Humans",
            initialOwner: "Humans",
            statistics: { playerCount: 0 },
            event: null,
          },
          faction: "Terminids",
        },
      ],
      liberatedPlanets: [],
      liberatedPlayerCount: 0,
    });
    vi.mocked(getWarStats).mockResolvedValue({
      playerCount: 1000,
      missionSuccessRate: 0,
      missionsWon: 0,
      missionTime: 0,
      terminidKills: 0,
      automatonKills: 0,
      illuminateKills: 0,
      bulletsFired: 0,
      deaths: 0,
      friendlies: 0,
      missionsLost: 0,
    });

    const result = await getDashboardStats();
    expect(result.playerCount).toBe(1000);
    expect(result.activeCount).toBe(1);
  });

  it("returns zeros on failure", async () => {
    vi.mocked(getCampaignData).mockRejectedValue(new Error("fail"));
    vi.mocked(getWarStats).mockRejectedValue(new Error("fail"));

    const result = await getDashboardStats();
    expect(result.playerCount).toBe(0);
    expect(result.activeCount).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run tests/lib/data/dashboard.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement data layer**

Create `lib/data/dashboard.ts`:
```typescript
import { cache } from "react";
import { getCampaignData } from "./campaigns";
import { getWarStats } from "./war";

export interface DashboardData {
  playerCount: number;
  activeCount: number;
  eventCount: number;
  liberatedCount: number;
}

async function _getDashboardStats(): Promise<DashboardData> {
  try {
    const [warStats, campaignStats] = await Promise.all([
      getWarStats(),
      getCampaignData(),
    ]);

    return {
      playerCount: warStats.playerCount,
      activeCount: campaignStats.activePlanets.length,
      eventCount: campaignStats.activePlanets.filter(
        (c) => c.planet.event != null,
      ).length,
      liberatedCount: campaignStats.liberatedPlanets.length,
    };
  } catch (error) {
    console.error("getDashboardStats failed:", error);
    return {
      playerCount: 0,
      activeCount: 0,
      eventCount: 0,
      liberatedCount: 0,
    };
  }
}

export const getDashboardStats = cache(_getDashboardStats);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:run tests/lib/data/dashboard.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/data/dashboard.ts tests/lib/data/dashboard.test.ts
git commit -m "feat: add dashboard data layer with tests"
```

### Task 24: Create lib/data/space-station.ts + test

**Files:**
- Create: `lib/data/space-station.ts`
- Create: `tests/lib/data/space-station.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/data/space-station.test.ts`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { getSpaceStations } from "@/lib/data/space-station";
import { fetchSpaceStations } from "@/lib/services/space-station";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => any>(fn: T): T => fn,
  };
});

vi.mock("@/lib/services/space-station", () => ({
  fetchSpaceStations: vi.fn(),
}));

describe("getSpaceStations", () => {
  it("returns mapped stations", async () => {
    const mock = [
      {
        id32: 1,
        planet: {
          name: "Test",
          sector: "S1",
          position: { x: 0, y: 0 },
          health: 100,
          maxHealth: 100,
          regenPerSecond: 0,
          currentOwner: "Humans",
          initialOwner: "Humans",
          statistics: { playerCount: 0 },
        },
        electionEnd: "2024-01-01",
        flags: 0,
        tacticalActions: [],
      },
    ];
    vi.mocked(fetchSpaceStations).mockResolvedValue(mock);

    const result = await getSpaceStations();
    expect(result).toHaveLength(1);
    expect(result[0].id32).toBe(1);
  });

  it("returns empty array on failure", async () => {
    vi.mocked(fetchSpaceStations).mockRejectedValue(new Error("fail"));
    const result = await getSpaceStations();
    expect(result).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run tests/lib/data/space-station.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement data layer**

Create `lib/data/space-station.ts`:
```typescript
import { cache } from "react";
import { fetchSpaceStations } from "@/lib/services/space-station";
import { mapSpaceStationDto } from "@/lib/transformers/space-station";
import type { SpaceStation } from "@/types/space-station";

async function _getSpaceStations(): Promise<SpaceStation[]> {
  try {
    const dtos = await fetchSpaceStations();
    return dtos.map(mapSpaceStationDto);
  } catch (error) {
    console.error("getSpaceStations failed:", error);
    return [];
  }
}

export const getSpaceStations = cache(_getSpaceStations);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test:run tests/lib/data/space-station.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/data/space-station.ts tests/lib/data/space-station.test.ts
git commit -m "feat: add space-station data layer with tests"
```

### Task 25: Update campaign-table widget

**Files:**
- Modify: `components/widgets/root/campaign-table.tsx`

- [ ] **Step 1: Update widget**

Replace the complete file:
```typescript
import { getCampaignData } from "@/lib/data/campaigns";
import type { CampaignStats } from "@/types/campaigns";
import CampaignTableClient from "@/components/widgets/root/campaign-table-client";

export default async function CampaignTable() {
  try {
    const { activePlanets, liberatedPlayerCount }: CampaignStats =
      await getCampaignData();

    return (
      <CampaignTableClient
        activePlanets={activePlanets}
        liberatedPlayerCount={liberatedPlayerCount}
      />
    );
  } catch (error) {
    console.error("Failed to load campaign table:", error);
    return (
      <div className="p-4 text-center text-red-500">
        Failed to load campaign data. Please try again later.
      </div>
    );
  }
}
```

- [ ] **Step 2: Build check**

Run: `pnpm build`
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add components/widgets/root/campaign-table.tsx
git commit -m "refactor: migrate campaign-table widget to new data layer"
```

### Task 26: Update war-summary widget

**Files:**
- Modify: `components/widgets/root/war-summary.tsx`

- [ ] **Step 1: Update widget**

Replace the complete file:
```typescript
import { getDashboardStats } from "@/lib/data/dashboard";
import { millify } from "@/lib/utils";
import { Users, Swords, ShieldAlert, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function WarSummary() {
  const stats = await getDashboardStats();

  const items = [
    { icon: Users, label: "Players", value: millify(stats.playerCount) },
    { icon: Swords, label: "Active", value: String(stats.activeCount) },
    { icon: ShieldAlert, label: "Events", value: String(stats.eventCount) },
    { icon: Globe, label: "Liberated", value: String(stats.liberatedCount) },
  ];

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon className="size-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="font-mono text-sm font-medium">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Build check**

Run: `pnpm build`
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add components/widgets/root/war-summary.tsx
git commit -m "refactor: migrate war-summary widget to new data layer"
```

### Task 27: Update campaign-map-server widget

**Files:**
- Modify: `components/widgets/root/campaign-map-server.tsx`

- [ ] **Step 1: Update widget**

Replace the complete file:
```typescript
import { getCampaignData } from "@/lib/data/campaigns";
import CampaignMap from "@/components/widgets/root/campaign-map-dynamic";

export default async function CampaignMapServer() {
  try {
    const { activePlanets, liberatedPlanets } = await getCampaignData();
    return (
      <CampaignMap
        activePlanets={activePlanets}
        liberatedPlanets={liberatedPlanets}
      />
    );
  } catch (error) {
    console.error("Failed to fetch campaign data for map:", error);
    return (
      <CampaignMap
        activePlanets={[]}
        liberatedPlanets={[]}
        error={String(error)}
      />
    );
  }
}
```

- [ ] **Step 2: Build check**

Run: `pnpm build`
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add components/widgets/root/campaign-map-server.tsx
git commit -m "refactor: migrate campaign-map-server widget to new data layer"
```

### Task 28: Update space-station widget

**Files:**
- Modify: `components/widgets/root/space-station.tsx`

- [ ] **Step 1: Update widget**

Replace the complete file:
```typescript
import { getSpaceStations } from "@/lib/data/space-station";
import type { SpaceStation, TacticalAction, Cost } from "@/types/space-station";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { stripHtmlTags } from "@/lib/utils";

function formatTimeRemaining(endTime: string): string {
  const end = new Date(endTime);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return "Ended";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function CostProgress({ cost }: { cost: Cost }) {
  const progress = (cost.currentValue / cost.targetValue) * 100;
  const ratePerHour = cost.deltaPerSecond * 3600;

  return (
    <div className="space-y-1">
      <div className="flex justify-end text-sm">
        <span className="font-mono">
          {Math.round(cost.currentValue).toLocaleString()} /{" "}
          {cost.targetValue.toLocaleString()}
        </span>
      </div>
      <Progress value={progress} />
      {ratePerHour !== 0 && (
        <div className="text-xs text-muted-foreground text-right">
          {ratePerHour >= 0 ? "+" : ""}
          {ratePerHour.toFixed(1)}/hr
        </div>
      )}
    </div>
  );
}

const STATUS_LABELS: Record<number, { text: string; color: string }> = {
  0: { text: "Inactive", color: "text-muted-foreground" },
  1: { text: "Active", color: "text-green-500" },
  2: { text: "Completed", color: "text-blue-500" },
  3: { text: "Failed", color: "text-red-500" },
};

function TacticalActionCard({ action }: { action: TacticalAction }) {
  const status = STATUS_LABELS[action.status] ?? STATUS_LABELS[0];

  return (
    <div className="border p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-medium">{action.name}</h4>
          <p className="text-sm text-muted-foreground">{action.description}</p>
        </div>
        <Badge variant="outline" className={status.color}>
          {status.text}
        </Badge>
      </div>

      {action.strategicDescription && (
        <p className="text-sm italic text-muted-foreground">
          {stripHtmlTags(action.strategicDescription)}
        </p>
      )}

      {action.costs.length > 0 && (
        <div className="space-y-2">
          {action.costs.map((cost) => (
            <CostProgress key={cost.id} cost={cost} />
          ))}
        </div>
      )}

      {action.statusExpire && (
        <div className="text-xs text-muted-foreground">
          {new Date(action.statusExpire) <= new Date()
            ? "Expired"
            : `Expires in ${formatTimeRemaining(action.statusExpire)}`}
        </div>
      )}
    </div>
  );
}

export default async function SpaceStation() {
  const stations = await getSpaceStations();

  if (stations.length === 0) {
    return (
      <div className="text-muted-foreground text-sm p-4 text-center">
        No active space stations
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stations.map((station) => {
        const mostRelevantAction = station.tacticalActions.reduce((best, current) => {
          const bestVotes = best.costs[0]?.currentValue ?? 0;
          const currentVotes = current.costs[0]?.currentValue ?? 0;
          return currentVotes > bestVotes ? current : best;
        }, station.tacticalActions[0]);

        const electionEnded = new Date(station.electionEnd) <= new Date();

        return (
          <div key={station.id32} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{station.planet.name}</h3>
                <div className="text-sm text-muted-foreground">
                  {electionEnded ? "Election ended" : "Election ends"}
                </div>
                {!electionEnded && (
                  <div className="font-mono">
                    {formatTimeRemaining(station.electionEnd)}
                  </div>
                )}
              </div>
            </div>

            {station.tacticalActions.length > 0 ? (
              <div className="space-y-3">
                <TacticalActionCard key={mostRelevantAction.id32} action={mostRelevantAction} />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No active tactical actions
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Build check**

Run: `pnpm build`
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add components/widgets/root/space-station.tsx
git commit -m "refactor: migrate space-station widget to new data layer"
```

### Task 29: Update client component imports

**Files:**
- Modify: `components/widgets/root/campaign-table-client.tsx`
- Modify: `components/widgets/root/campaign-map.tsx`
- Modify: `components/planet-detail.tsx`

- [ ] **Step 1: Update campaign-table-client.tsx imports**

Replace the import block (lines 1-10):
```typescript
"use client";

import { useState } from "react";
import type { Campaign } from "@/types/campaigns";
import {
  getFactionIcon,
  getPlanetStats,
  species,
} from "@/lib/transformers/campaigns";
import Image from "next/image";
import { millify } from "@/lib/utils";
```

The rest of the file remains unchanged.

- [ ] **Step 2: Update campaign-map.tsx imports**

Replace the import block (lines 1-11):
```typescript
"use client";

import { getFactionIcon, getLiberation } from "@/lib/transformers/campaigns";
import { useState, useMemo, useEffect } from "react";
import { millify } from "@/lib/utils";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Campaign } from "@/types/campaigns";
import PlanetDetail from "@/components/planet-detail";
import { useMediaQuery } from "@/lib/use-media-query";
```

The rest of the file remains unchanged.

- [ ] **Step 3: Update planet-detail.tsx imports**

Replace the import block (lines 1-15):
```typescript
"use client";

import type { Campaign } from "@/types/campaigns";
import {
  getLiberation,
  getPlanetStats,
  getFactionIcon,
} from "@/lib/transformers/campaigns";
import Image from "next/image";
import { millify } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
```

The rest of the file remains unchanged.

- [ ] **Step 4: Build check**

Run: `pnpm build`
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add components/widgets/root/campaign-table-client.tsx components/widgets/root/campaign-map.tsx components/planet-detail.tsx
git commit -m "refactor: update client components to import from transformers"
```

---

## Phase 5: News Domain

### Task 30: Create news domain (types, service, data, test)

**Files:**
- Create: `types/news.ts`
- Create: `lib/services/news.ts`
- Create: `lib/transformers/news.ts`
- Create: `lib/data/news.ts`
- Create: `tests/lib/services/news.test.ts`
- Create: `tests/lib/data/news.test.ts`

- [ ] **Step 1: Create types**

Create `types/news.ts`:
```typescript
export interface PatchNoteDto {
  id: string;
  title: string;
  url: string;
  author: string;
  content: string;
  publishedAt: string;
}

export interface PatchNote {
  id: string;
  title: string;
  url: string;
  author: string;
  content: string;
  publishedAt: string;
}
```

- [ ] **Step 2: Create service and tests**

Create `lib/services/news.ts`:
```typescript
import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { PatchNoteDto } from "@/types/news";

export async function fetchPatchNotes(): Promise<PatchNoteDto[]> {
  const result = await getAPI<PatchNoteDto[]>({
    url: ENDPOINTS.STEAM.url,
    revalidate: ENDPOINTS.STEAM.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch patch notes: ${result.error.message}`);
  }
  if (!Array.isArray(result.data)) {
    throw new Error("Invalid patch notes data: expected array");
  }
  return result.data;
}
```

Create `tests/lib/services/news.test.ts`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { fetchPatchNotes } from "@/lib/services/news";
import { getAPI } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  getAPI: vi.fn(),
}));

describe("fetchPatchNotes", () => {
  it("returns DTOs on success", async () => {
    const mock = [{ id: "1", title: "Patch", url: "http://example.com", author: "Dev", content: "Fixes", publishedAt: "2024-01-01" }];
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: mock });

    const result = await fetchPatchNotes();
    expect(result).toEqual(mock);
  });

  it("throws on API failure", async () => {
    vi.mocked(getAPI).mockResolvedValue({
      success: false,
      error: new Error("fail"),
    });
    await expect(fetchPatchNotes()).rejects.toThrow("Failed to fetch patch notes");
  });

  it("throws on invalid shape", async () => {
    vi.mocked(getAPI).mockResolvedValue({ success: true, data: "not-array" });
    await expect(fetchPatchNotes()).rejects.toThrow("Invalid patch notes data");
  });
});
```

- [ ] **Step 3: Create transformer**

Create `lib/transformers/news.ts`:
```typescript
import type { PatchNoteDto, PatchNote } from "@/types/news";

export function mapPatchNoteDto(dto: PatchNoteDto): PatchNote {
  return { ...dto };
}
```

- [ ] **Step 4: Create data layer and test**

Create `lib/data/news.ts`:
```typescript
import { cache } from "react";
import { fetchPatchNotes } from "@/lib/services/news";
import { mapPatchNoteDto } from "@/lib/transformers/news";
import type { PatchNote } from "@/types/news";

async function _getPatchNotes(): Promise<PatchNote[]> {
  try {
    const dtos = await fetchPatchNotes();
    return dtos.map(mapPatchNoteDto);
  } catch (error) {
    console.error("getPatchNotes failed:", error);
    return [];
  }
}

export const getPatchNotes = cache(_getPatchNotes);
```

Create `tests/lib/data/news.test.ts`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { getPatchNotes } from "@/lib/data/news";
import { fetchPatchNotes } from "@/lib/services/news";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: any[]) => any>(fn: T): T => fn,
  };
});

vi.mock("@/lib/services/news", () => ({
  fetchPatchNotes: vi.fn(),
}));

describe("getPatchNotes", () => {
  it("returns mapped patch notes", async () => {
    const mock = [{ id: "1", title: "Patch", url: "http://example.com", author: "Dev", content: "Fixes", publishedAt: "2024-01-01" }];
    vi.mocked(fetchPatchNotes).mockResolvedValue(mock);

    const result = await getPatchNotes();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Patch");
  });

  it("returns empty array on failure", async () => {
    vi.mocked(fetchPatchNotes).mockRejectedValue(new Error("fail"));
    const result = await getPatchNotes();
    expect(result).toEqual([]);
  });
});
```

- [ ] **Step 5: Run all news tests**

Run: `pnpm test:run tests/lib/services/news.test.ts tests/lib/data/news.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add types/news.ts lib/services/news.ts lib/transformers/news.ts lib/data/news.ts tests/lib/services/news.test.ts tests/lib/data/news.test.ts
git commit -m "feat: add news domain layer with tests"
```

### Task 31: Update newsfeed widget

**Files:**
- Modify: `components/widgets/news/newsfeed.tsx`

- [ ] **Step 1: Update widget**

Replace the complete file:
```typescript
import { getPatchNotes } from "@/lib/data/news";
import PatchNotesList from "@/components/widgets/news/patch-notes-list";

export default async function PatchNotes() {
  const notes = await getPatchNotes();

  const sortedNotes = notes.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return <PatchNotesList notes={sortedNotes} />;
}
```

- [ ] **Step 2: Build check**

Run: `pnpm build`
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add components/widgets/news/newsfeed.tsx
git commit -m "refactor: migrate newsfeed widget to new data layer"
```

---

## Phase 6: Statistics Widget

### Task 32: Update statistics widget

**Files:**
- Modify: `components/widgets/statistics/statistics.tsx`

- [ ] **Step 1: Update widget**

Replace the complete file:
```typescript
import { getWarStats } from "@/lib/data/war";
import { millify } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatisticsCard } from "@/components/widgets/statistics/statistics-card";

export default async function Statistics() {
  const stats = await getWarStats();

  if (stats.playerCount === 0) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Counts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Statistics temporarily unavailable.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Counts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <StatisticsCard title="Patriots in Game">
              {millify(stats.playerCount)}
            </StatisticsCard>
            <StatisticsCard title={`Lawful Victories - Ø ${millify(stats.missionSuccessRate)}%`}>
              {millify(stats.missionsWon)}
            </StatisticsCard>
            <StatisticsCard title="Total Time Invested">
              {millify(stats.missionTime / 60 / 60 / 24 / 365 / 100)} centuries
            </StatisticsCard>
            <StatisticsCard title="Pesty Bugs Killed">
              {millify(stats.terminidKills)}
            </StatisticsCard>
            <StatisticsCard title="Robots Annihilated">
              {millify(stats.automatonKills)}
            </StatisticsCard>
            <StatisticsCard title="Illuminates Killed">
              {millify(stats.illuminateKills)}
            </StatisticsCard>
            <StatisticsCard title="Ammunition Shot">
              {millify(stats.bulletsFired)}
            </StatisticsCard>
            <StatisticsCard title="Fallen Souldiers">
              {millify(stats.deaths)}
            </StatisticsCard>
            <StatisticsCard title="Collateral Friend Kills">
              {millify(stats.friendlies)}
            </StatisticsCard>
            <StatisticsCard title="Missions Lost :(">
              {millify(stats.missionsLost)}
            </StatisticsCard>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Build check**

Run: `pnpm build`
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add components/widgets/statistics/statistics.tsx
git commit -m "refactor: migrate statistics widget to new data layer"
```

---

## Phase 7: Cleanup

### Task 33: Delete legacy files and verify build

**Files:**
- Delete: `lib/get.ts`
- Delete: `lib/get-campaigns.tsx`

- [ ] **Step 1: Delete legacy files**

```bash
rm lib/get.ts lib/get-campaigns.tsx
```

- [ ] **Step 2: Verify no remaining references**

Run: `grep -r "from \"@/lib/get\"" --include="*.ts" --include="*.tsx" .`
Expected: No matches (or only in `.next/` build cache, which is fine)

Run: `grep -r "from \"@/lib/get-campaigns\"" --include="*.ts" --include="*.tsx" .`
Expected: No matches

- [ ] **Step 3: Full build verification**

Run: `pnpm build`
Expected: Build succeeds with zero TypeScript errors.

- [ ] **Step 4: Run full test suite**

Run: `pnpm test:run`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove legacy get.ts and get-campaigns.tsx"
```

---

## Self-Review Checklist

After the plan is fully implemented, verify:

- [ ] **Spec coverage:** Every file in the spec has a corresponding task.
- [ ] **Placeholder scan:** No "TBD", "TODO", "implement later" remain in the plan.
- [ ] **Type consistency:** `mapCampaignDto`, `mapPlanetDto`, `mapAssignmentDto`, `mapSpaceStationDto`, `mapWarStatsDto`, `mapPatchNoteDto` all use consistent naming.
- [ ] **Service isolation:** No service calls transformers. All services return raw DTOs.
- [ ] **Result type:** Client returns `{ success, data } | { success, error }`. No `fallback` parameter in `getAPI`.
- [ ] **cache() usage:** Every `lib/data/` exported function is wrapped in React `cache()`.
- [ ] **Test mocks:** All data layer tests mock `react` module's `cache` to identity function.
- [ ] **Widget import fixes:** All widgets import from `lib/data/` or `lib/transformers/`. None import from deleted `lib/get.ts` or `lib/get-campaigns.tsx`.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-31-data-services-types-refactor.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
