import { leadingRegion, liberation } from "./format.js";
import { lang, t } from "./i18n.js";

const KEY = "hd:history";
const WINDOW = 60 * 60_000;
const MIN_SPAN = 5 * 60_000;
const days = new Intl.NumberFormat(lang, { style: "unit", unit: "day", unitDisplay: "long" });

// Estimates progress per hour from snapshots this browser has seen; the API has no history endpoint.
// shortcut: only measures while a tab is open, so rates appear ~5 min after first visit.
// `now` is when the snapshot was fetched, so a re-rendered cache or a stale fallback is not a new measurement.
export function track(planets, now, store = localStorage) {
  let hist = {};
  try {
    hist = JSON.parse(store.getItem(KEY)) ?? {};
  } catch {}
  const next = {};
  const rates = {};
  for (const p of planets) {
    // a new defense event, or progress moving to another region, starts a fresh series
    const r = leadingRegion(p);
    const id = `${p.index}:${p.event?.id ?? (r ? `r${r.id}` : "lib")}`;
    const lib = liberation(p);
    // a bad stored entry would throw on every load and never get overwritten
    const h = (Array.isArray(hist[id]) ? hist[id] : []).filter((s) => now - s?.[0] < WINDOW);
    if (!h.length || now > h.at(-1)[0]) h.push([now, lib]);
    next[id] = h;
    const [t0, l0] = h[0];
    if (now - t0 >= MIN_SPAN) rates[p.index] = (lib - l0) / ((now - t0) / 3_600_000);
  }
  try {
    store.setItem(KEY, JSON.stringify(next));
  } catch {}
  return rates;
}

// Hours until 100 % at the current rate, or null when not progressing.
export const hoursToWin = (lib, rate) => (rate > 0 ? (1 - lib) / rate : null);

// Coarse on purpose: rates come from minutes of data, so precise long ETAs would mislead.
export function eta(hours) {
  const minutes = Math.round(hours * 60); // round first, or 59.7 min would read "60m"
  if (minutes < 60) return `${Math.max(1, minutes)}${t.units.m}`;
  if (hours < 48) return `${Math.round(hours)}${t.units.h}`;
  return days.format(Math.round(hours / 24));
}
