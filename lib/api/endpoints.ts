export const API_ORIGIN = "https://api.helldivers2.dev";

type Endpoint = { url: string; revalidate: number };

const endpoint = (url: string, revalidate: number): Endpoint => ({
  url,
  revalidate,
});

// Every response the API serves, including the community wrapper (/api/...) and
// the raw ArrowHead passthrough (/raw/...). Revalidation times track how volatile
// each payload is: live war state refreshes every 10 min, the war season id and
// Steam feed almost never change and can sit for an hour or a day.
export const ENDPOINTS = {
  WAR: endpoint("/api/v1/war", 600),
  CAMPAIGNS: endpoint("/api/v1/campaigns", 600),
  ASSIGNMENTS: endpoint("/api/v1/assignments", 900),
  DISPATCHES: endpoint("/api/v2/dispatches", 600),
  PLANETS: endpoint("/api/v1/planets", 600),
  PLANET_EVENTS: endpoint("/api/v1/planet-events", 600),
  SPACE_STATION: endpoint("/api/v2/space-stations", 600),
  STEAM: endpoint("/api/v1/steam", 3600),

  WAR_ID: endpoint("/raw/api/WarSeason/current/WarID", 24 * 3600),

  CAMPAIGN: (index: number | string): Endpoint =>
    endpoint(`/api/v1/campaigns/${index}`, 600),
  PLANET: (index: number | string): Endpoint =>
    endpoint(`/api/v1/planets/${index}`, 600),
  ASSIGNMENT: (index: number | string): Endpoint =>
    endpoint(`/api/v1/assignments/${index}`, 900),
  DISPATCH: (index: number | string): Endpoint =>
    endpoint(`/api/v2/dispatches/${index}`, 600),
  SPACE_STATION_BY_INDEX: (index: number | string): Endpoint =>
    endpoint(`/api/v2/space-stations/${index}`, 600),
  STEAM_ITEM: (gid: string): Endpoint =>
    endpoint(`/api/v1/steam/${gid}`, 3600),

  WAR_INFO: (warId: number | string): Endpoint =>
    endpoint(`/raw/api/WarSeason/${warId}/WarInfo`, 6 * 3600),
  WAR_STATUS: (warId: number | string): Endpoint =>
    endpoint(`/raw/api/WarSeason/${warId}/Status`, 600),
  WAR_SUMMARY: (warId: number | string): Endpoint =>
    endpoint(`/raw/api/Stats/war/${warId}/summary`, 900),
  NEWSFEED: (warId: number | string): Endpoint =>
    endpoint(`/raw/api/NewsFeed/${warId}`, 600),
} as const;
