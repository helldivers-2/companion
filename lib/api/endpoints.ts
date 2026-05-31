export const ENDPOINTS = {
  CAMPAIGNS: { url: "/v1/campaigns", revalidate: 3600 },
  WAR: { url: "/v1/war", revalidate: 1800 },
  ASSIGNMENTS: { url: "/v1/assignments", revalidate: 900 },
  DISPATCHES: { url: "/v2/dispatches", revalidate: 600 },
  SPACE_STATION: { url: "/v2/space-stations", revalidate: 3600 },
  STEAM: { url: "/v1/steam", revalidate: 300 },
} as const;
