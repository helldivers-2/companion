import labels from "../_data/labels.json" with { type: "json" };
import { fill, lang, t } from "./i18n.js";
export { icon } from "./icon.js";

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const numFmt = new Intl.NumberFormat(lang);
export const num = (n) => numFmt.format(n ?? 0);
const pctFmt = new Intl.NumberFormat(lang, { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const pct = (x) => pctFmt.format(x);
const pct0Fmt = new Intl.NumberFormat(lang, { style: "percent", maximumFractionDigits: 0 });
export const pct0 = (x) => pct0Fmt.format(x);
// Used raw in class and id attributes, so it must only ever emit [a-z0-9-].
export const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-");
// Faction names arrive as API values; translate them only for display.
export const faction = (f) => t.factions[f] ?? f;
export const regionSize = (s) => t.regionSizes[s] ?? s.toLowerCase();
export const titleCase = (s) => String(s).toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

export function bar(ratio, label) {
  const v = Math.max(0, Math.min(1, ratio || 0));
  return `<div class="bar" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${(v * 100).toFixed(1)}"><span style="transform:scaleX(${v})"></span></div>`;
}

// Region system: planet health stays full while a city is being taken, so the furthest-taken region is the progress.
export function leadingRegion(planet) {
  if (planet.event || planet.currentOwner === "Humans" || planet.health < planet.maxHealth) return null;
  const share = (r) => r.health / r.maxHealth;
  // locked regions arrive with health: null, which `<` would read as 0 and show as fully taken
  return (planet.regions ?? []).filter((r) => r.health != null && r.health < r.maxHealth).sort((a, b) => share(a) - share(b))[0] ?? null;
}

// Share of the planet Super Earth holds: defense progress during an event, liberation otherwise.
export function liberation(planet) {
  const e = planet.event;
  if (e) return 1 - e.health / e.maxHealth;
  if (planet.currentOwner === "Humans") return 1;
  const r = leadingRegion(planet) ?? planet;
  return 1 - r.health / r.maxHealth;
}

// Enemy regeneration in share per hour of whatever liberation() measures; 0 during a defense.
export function regen(planet) {
  if (planet.event || planet.currentOwner === "Humans") return 0;
  const r = leadingRegion(planet) ?? planet;
  return r.maxHealth ? ((r.regenPerSecond ?? 0) * 3600) / r.maxHealth : 0;
}

export const held = (p) => p.currentOwner === "Humans" && !p.event;
export const liberationText = (p) => (held(p) ? t.js.held : pct(liberation(p)));
export const ownerBadge = (p) => `<span class="badge ${slug(p.currentOwner)}">${esc(faction(p.currentOwner))}</span>`;
export const STALLED = 0.0005; // under 0.05 %/h is measurement noise over a few minutes
// The API's own regeneration, the best hint until this browser has measured a rate.
export function regainsLine(p) {
  const g = regen(p);
  return g >= STALLED ? `<p class="rate stalled">${fill(t.js.regains, { rate: pct(g) })}</p>` : "";
}

export function enemyOf(planet) {
  return planet.event?.faction ?? planet.currentOwner;
}

function duration(ms) {
  let s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  s %= 60;
  const u = t.units;
  if (d) return `${d}${u.d} ${h}${u.h} ${m}${u.m}`;
  if (h) return `${h}${u.h} ${m}${u.m}`;
  return `${m}${u.m} ${String(s).padStart(2, "0")}${u.s}`;
}

// Every caller wraps this in a sentence ("… left", "ends in …"), so it stops at zero instead of saying "ended".
export const timeLeft = (until, now = Date.now()) => duration(Math.max(0, Date.parse(until) - now) || 0);

// Feeds sorted newest first; one unparseable date would otherwise throw in the date formatter and blank the feed.
export const newestFirst = (list, key) => list.filter((x) => !Number.isNaN(Date.parse(x[key]))).sort((a, b) => Date.parse(b[key]) - Date.parse(a[key]));
export const date = (iso, fmt) => `<time datetime="${esc(iso)}">${fmt.format(new Date(iso))}</time>`;

export const countdown = (iso) => `<time data-until="${esc(iso)}" datetime="${esc(iso)}">${timeLeft(iso)}</time>`;

// Dispatches and station actions use the game's <span data-ah="n"> highlight markup; keep only that, escape everything else.
export const dispatchHtml = (msg) =>
  esc(msg)
    .replace(/&#60;span data-ah=&#34;(\d)&#34;&#62;/g, '<strong class="ah-$1">')
    .replace(/&#60;\/span&#62;(&#62;)?/g, "</strong>") // the game sometimes writes </span>>
    .replace(/&#60;\/?i(=\d)?&#62;/g, "");

const STEAM_TAGS = { h1: "h3", h2: "h3", h3: "h4", b: "strong", i: "em", u: "u", strike: "s", p: "p", list: "ul", olist: "ol", "*": "li" };

// Steam posts are BBCode: escape everything, then turn known tags back into HTML. Only http(s) links survive,
// and images and videos are dropped because the CSP only allows this site's own images.
export function steamHtml(bb) {
  const link = (href, text) => (/^https?:\/\//i.test(href) ? `<a href="${href}">${text}</a>` : text);
  return esc(bb)
    .replace(/\\\[/g, "&#91;") // \[PC] is a literal bracket, not a tag
    .replace(/\\\]/g, "&#93;")
    .replace(/\[(img|previewyoutube)[^\]]*\][\s\S]*?\[\/\1\]/g, "")
    .replace(/\[url=(?:&#34;)?(.*?)(?:&#34;)?\]([\s\S]*?)\[\/url\]/g, (_, href, text) => link(href, text))
    .replace(/\[url\](.*?)\[\/url\]/g, (_, href) => link(href, href))
    .replace(/\[(\/?)(h[123]|b|i|u|strike|p|list|olist|\*)\]/g, (_, close, tag) => `<${close}${STEAM_TAGS[tag]}>`)
    .replace(/\[\/?[a-z0-9]+(=[^\]]*)?\]/g, "")
    .replace(/<p>\s*<\/p>/g, "");
}

const compact = new Intl.NumberFormat(lang, { notation: "compact", maximumFractionDigits: 1 });
const years = new Intl.NumberFormat(lang, { notation: "compact", maximumFractionDigits: 1, style: "unit", unit: "year", unitDisplay: "long" });

// Battle record for the whole war or one planet. Accuracy is left out: the API reports more hits than shots.
export function record(s, byFaction = false) {
  const total = (s.terminidKills ?? 0) + (s.automatonKills ?? 0) + (s.illuminateKills ?? 0);
  const deaths = s.deaths ?? 0;
  const r = t.record;
  const kills = byFaction
    ? [[r.terminids, s.terminidKills], [r.automatons, s.automatonKills], [r.illuminate, s.illuminateKills]]
    : [[r.enemies, total]];
  const rows = [
    [r.missionsWon, s.missionsWon],
    [r.missionsLost, s.missionsLost],
    [r.successRate, pct0((s.missionSuccessRate ?? 0) / 100)],
    ...kills,
    [r.deaths, s.deaths],
    [r.kd, deaths ? compact.format(total / deaths) : "–"],
    [r.friendlies, s.friendlies],
    [r.friendlyShare, deaths ? pct0((s.friendlies ?? 0) / deaths) : "–"],
    [r.bullets, s.bulletsFired],
    [r.time, years.format((s.missionTime ?? 0) / 31_557_600)],
  ];
  return `<dl class="record">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${typeof v === "string" ? v : `<span title="${num(v)}">${compact.format(v ?? 0)}</span>`}</dd></div>`).join("")}</dl>`;
}

// Task semantics are reverse-engineered by the community; unknown types fall back to a raw label.
export function describeTask(task, progress = 0, planets = {}) {
  const vt = labels.valueTypes;
  const val = (t) => {
    const i = task.valueTypes.indexOf(t);
    return i < 0 ? undefined : task.values[i];
  };
  const verb = t.taskTypes[task.type] ?? fill(t.js.taskType, { n: task.type });
  const planetIndex = val(vt.planet);
  const planet = planetIndex ? planets[planetIndex] : undefined; // 0 means "any planet"
  const goal = val(vt.goal) || 1;
  const enemy = labels.factions[val(vt.faction) - 1];
  const ratio = Math.min(1, progress / goal);
  if (planetIndex) {
    return { text: `${verb} ${planet?.name ?? fill(t.js.planetN, { n: planetIndex })}`, planet, ratio, done: progress >= goal, counted: false };
  }
  const unit = enemy ? faction(enemy) : [11, 12, 13, 15].includes(task.type) ? t.js.planetsUnit : "";
  return { text: `${verb} ${num(goal)} ${unit}`.trim(), ratio, done: progress >= goal, counted: goal > 1, progress, goal };
}
