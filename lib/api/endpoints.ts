export const ENDPOINTS = {
  CAMPAIGNS: { url: "/v1/campaigns", revalidate: 600 },
  WAR: { url: "/v1/war", revalidate: 600 },
  ASSIGNMENTS: { url: "/v1/assignments", revalidate: 900 },
  DISPATCHES: { url: "/v2/dispatches", revalidate: 600 },
  SPACE_STATION: { url: "/v2/space-stations", revalidate: 600 },
  STEAM: { url: "/v1/steam", revalidate: 3600 },
} as const;
