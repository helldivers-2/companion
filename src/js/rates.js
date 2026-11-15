import { liberation } from "./format.js";

const KEY = "hd:history";
const WINDOW = 60 * 60_000;
const MIN_SPAN = 5 * 60_000;
const MIN_GAP = 50_000; // skip repeats of the same cached snapshot

// Estimates progress per hour from snapshots this browser has seen; the API has no history endpoint.
// shortcut: only measures while a tab is open, so rates appear ~5 min after first visit.
export function track(planets, now = Date.now(), store = localStorage) {
  let hist = {};
  try { hist = JSON.parse(store.getItem(KEY)) ?? {}; } catch {}
  const next = {};
  const rates = {};
  for (const p of planets) {
    const id = `${p.index}:${p.event?.id ?? "lib"}`; // a new defense event starts a fresh series
    const lib = liberation(p);
    const h = (hist[id] ?? []).filter(([t]) => now - t < WINDOW);
    if (!h.length || now - h.at(-1)[0] >= MIN_GAP) h.push([now, lib]);
    next[id] = h;
    const [t0, l0] = h[0];
    if (now - t0 >= MIN_SPAN) rates[p.index] = (lib - l0) / ((now - t0) / 3_600_000);
  }
  try { store.setItem(KEY, JSON.stringify(next)); } catch {}
  return rates;
}

// Hours until 100 % at the current rate, or null when not progressing.
export const hoursToWin = (lib, rate) => (rate > 0 ? (1 - lib) / rate : null);

// Coarse on purpose: rates come from minutes of data, so precise long ETAs would mislead.
export function eta(hours) {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
  if (hours < 48) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)} days`;
}
