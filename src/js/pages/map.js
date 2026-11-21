import { fetchedAt, get } from "../api.js";
import { bar, countdown, describeTask, enemyOf, esc, faction, held, icon, liberation, liberationText, num, ownerBadge, pct0, slug } from "../format.js";
import { fill, lang, t } from "../i18n.js";
import { track } from "../rates.js";
import { rateLine } from "./overview.js";

const SIZE = 1000; // the viewBox at zoom 1; planet positions span roughly -1..1
const PAD = 50;
const MAX_ZOOM = 12;
const NEAR = 2.5; // from this zoom on, every planet gets its name

// y is flipped: the API's y grows upward, SVG's grows downward.
export const project = ({ x, y }) => [PAD + ((x + 1) / 2) * (SIZE - 2 * PAD), PAD + ((1 - y) / 2) * (SIZE - 2 * PAD)];

export function clampView({ cx, cy, k }) {
  k = Math.min(MAX_ZOOM, Math.max(1, k));
  const half = SIZE / k / 2;
  return { cx: Math.min(SIZE - half, Math.max(half, cx)), cy: Math.min(SIZE - half, Math.max(half, cy)), k };
}

// Arrow-key neighbour: the closest point in that direction, counting sideways drift double so the move stays roughly on its row or column.
export function nearest(points, from, dx, dy) {
  let best = null,
    bestScore = Infinity;
  for (const p of points) {
    const along = (p.x - from.x) * dx + (p.y - from.y) * dy;
    if (p === from || along <= 0) continue;
    const score = along + 2 * Math.abs((p.x - from.x) * dy - (p.y - from.y) * dx);
    if (score < bestScore) [best, bestScore] = [p, score];
  }
  return best;
}

// Places each label right of its planet, else left, else nowhere (it then waits for zoom, like minor names). Items come
// most important first; boxes are {index, x0, y0, x1, y1} to keep clear, apart from a planet's own marker. Labels shrink against the map as it zooms in (see apply),
// so a layout without overlaps at zoom 1 has none at any zoom.
export function placeLabels(items, boxes) {
  const taken = [...boxes],
    sides = {};
  const free = (b) => b.x0 >= 0 && b.x1 <= SIZE && !taken.some((o) => o.index !== b.index && b.x0 < o.x1 && o.x0 < b.x1 && b.y0 < o.y1 && o.y0 < b.y1);
  for (const { index, x, y, w, h, gap } of items) {
    for (const side of ["right", "left"]) {
      const x0 = side === "right" ? x + gap : x - gap - w;
      const b = { index, x0, x1: x0 + w, y0: y - h / 2, y1: y + h / 2 };
      if (free(b)) {
        taken.push(b);
        sides[index] = side;
        break;
      }
    }
  }
  return sides;
}

const $ = (id) => document.getElementById(id);
const ARROWS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
let view = { cx: SIZE / 2, cy: SIZE / 2, k: 1 };
let planets = [];
let selected = null; // planet index
let rover = null; // the one planet in the tab order; arrow keys move it
let bound = false;
let lastPanel = "";
let lastLayer = "";
let lastFronts = "";
let campaign = new Set();
let order = new Set();
let rates = {};
let lastNames = "";
let linked = null; // ?planet=<index>, taken once the planets load

function apply() {
  view = clampView(view);
  const w = SIZE / view.k,
    svg = $("map");
  svg.setAttribute("viewBox", `${view.cx - w / 2} ${view.cy - w / 2} ${w} ${w}`);
  // markers and labels grow far slower than the map, so zooming in spreads a cluster out instead of blowing it up
  svg.style.setProperty("--s", view.k ** -0.85);
  svg.toggleAttribute("data-near", view.k >= NEAR);
}

let flight = 0;
function flyTo({ x, y }, k) {
  const from = { ...view },
    to = clampView({ cx: x, cy: y, k });
  cancelAnimationFrame(flight);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    view = to;
    apply();
    return;
  }
  const start = performance.now();
  const step = (now) => {
    const f = Math.min(1, (now - start) / 400),
      e = 1 - (1 - f) ** 3;
    view = { cx: from.cx + (to.cx - from.cx) * e, cy: from.cy + (to.cy - from.cy) * e, k: from.k + (to.k - from.k) * e };
    apply();
    if (f < 1) flight = requestAnimationFrame(step);
  };
  flight = requestAnimationFrame(step);
}

// fx, fy: the point (as a share of the map's width and height) that stays put while zooming.
function zoomAt(k, fx = 0.5, fy = 0.5) {
  const w = SIZE / view.k,
    w2 = SIZE / Math.min(MAX_ZOOM, Math.max(1, k));
  view = { cx: view.cx - w / 2 + fx * w - fx * w2 + w2 / 2, cy: view.cy - w / 2 + fy * w - fy * w2 + w2 / 2, k };
  apply();
}

function bind() {
  const svg = $("map");
  // The SVG is letterboxed to a square, so screen share maps through its shorter side.
  const frame = () => {
    const r = svg.getBoundingClientRect(),
      s = Math.min(r.width, r.height);
    return { r, s, ox: (r.width - s) / 2, oy: (r.height - s) / 2 };
  };
  const pointers = new Map();
  let moved = false;
  let box; // measured on pointerdown: reading it on every move would force a layout per event
  const spread = () => {
    const [a, b] = [...pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  svg.addEventListener("pointerdown", (e) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY });
    box = frame();
    if (pointers.size === 1) moved = false;
  });
  svg.addEventListener("pointermove", (e) => {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    const { r, s, ox, oy } = box;
    const before = pointers.size === 2 ? spread() : 0;
    const [dx, dy] = [e.clientX - p.x, e.clientY - p.y];
    p.x = e.clientX;
    p.y = e.clientY;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      moved = true;
      zoomAt(view.k * (spread() / (before || 1)), ((a.x + b.x) / 2 - r.left - ox) / s, ((a.y + b.y) / 2 - r.top - oy) / s);
    } else if (moved || Math.hypot(e.clientX - p.x0, e.clientY - p.y0) > 4) {
      if (!moved) svg.setPointerCapture(e.pointerId); // only once it is a drag, so a plain click still reaches the planet
      moved = true;
      view.cx -= (dx / s) * (SIZE / view.k);
      view.cy -= (dy / s) * (SIZE / view.k);
      apply();
    }
  });
  svg.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      cancelAnimationFrame(flight);
      const { r, s, ox, oy } = frame();
      zoomAt(view.k * Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.002)), (e.clientX - r.left - ox) / s, (e.clientY - r.top - oy) / s);
    },
    { passive: false },
  );
  const up = (e) => pointers.delete(e.pointerId);
  svg.addEventListener("pointerup", up);
  svg.addEventListener("pointercancel", up);

  svg.addEventListener("click", (e) => {
    const i = Number(e.target.closest("[data-planet]")?.dataset.planet ?? e.target.dataset.hit);
    if (!moved && !Number.isNaN(i)) select(i);
    moved = false;
  });
  svg.addEventListener("keydown", (e) => {
    const el = e.target.closest("[data-planet]");
    if (!el) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(Number(el.dataset.planet));
    } else if (ARROWS[e.key]) {
      e.preventDefault();
      const from = points.find((p) => p.index === Number(el.dataset.planet));
      const next = nearest(points, from, ...ARROWS[e.key]);
      if (next) focusPlanet(next.index, true);
    }
  });
  document.querySelector(".map-tools").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.zoom) zoomAt(view.k * Number(b.dataset.zoom));
    else flyTo({ x: SIZE / 2, y: SIZE / 2 }, 1);
  });
  // picking a name from the list fills the field with it exactly; typing on stays a search
  $("map-find").addEventListener("input", (e) => {
    const name = e.target.value.trim().toLowerCase();
    const p = planets.find((q) => q.name.toLowerCase() === name);
    if (p) go(p.index);
  });
  $("map-find").addEventListener("keydown", (e) => {
    if (e.key === "Escape") e.target.blur();
  });
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest("input, select, textarea")) return;
    const zoom = { "+": 1.5, "=": 1.5, "-": 0.6667 }[e.key];
    if (e.key === "/") $("map-find").focus();
    else if (zoom) zoomAt(view.k * zoom);
    else if (e.key === "0") flyTo({ x: SIZE / 2, y: SIZE / 2 }, 1);
    else return;
    e.preventDefault();
  });
  $("map-fronts").addEventListener("click", (e) => {
    const i = e.target.closest("[data-go]")?.dataset.go;
    if (i) go(Number(i));
  });
}

function go(index) {
  const p = points.find((q) => q.index === index);
  if (!p) return;
  select(index);
  flyTo(p, Math.max(view.k, 3));
  $("map").scrollIntoView({ block: "nearest", behavior: "smooth" });
}

let points = []; // screen-space positions, for arrow-key navigation

function focusPlanet(index, reveal) {
  rover = index;
  for (const el of document.querySelectorAll("#map-layer [data-planet]")) el.tabIndex = Number(el.dataset.planet) === index ? 0 : -1;
  const el = document.querySelector(`#map-layer [data-planet="${index}"]`);
  el?.focus({ preventScroll: true });
  const p = points.find((q) => q.index === index);
  const w = SIZE / view.k;
  if (reveal && p && (Math.abs(p.x - view.cx) > w / 2 || Math.abs(p.y - view.cy) > w / 2)) {
    view.cx = p.x;
    view.cy = p.y;
    apply();
  }
}

function select(index) {
  selected = index;
  for (const el of document.querySelectorAll("#map-layer [data-planet]")) el.setAttribute("aria-pressed", Number(el.dataset.planet) === index);
  focusPlanet(index);
  const p = planets.find((q) => q.index === index);
  if (p) {
    $("map-announce").textContent = fill(t.map.selected, { name: p.name });
    const u = new URL(location.href);
    u.searchParams.set("planet", index);
    history.replaceState(null, "", u);
  }
  for (const el of document.querySelectorAll("#map-fronts [data-go]")) el.setAttribute("aria-pressed", Number(el.dataset.go) === index);
  drawRoutes();
  renderPanel();
}

// The selected planet's supply lines, drawn bright: where its attacks can come from and go to.
function drawRoutes() {
  const route = $("map-route");
  if (!route) return;
  const at = (i) => points.find((q) => q.index === i);
  const from = at(selected),
    p = planets.find((q) => q.index === selected);
  const ends = from
    ? [...new Set([...(p.waypoints ?? []), ...planets.filter((q) => q.waypoints?.includes(selected)).map((q) => q.index)])].map(at).filter(Boolean)
    : [];
  route.setAttribute("d", ends.map((b) => `M${from.x} ${from.y}L${b.x} ${b.y}`).join(""));
  // outline the selected planet's sector, drawn above its neighbours' borders
  const shape = p && document.querySelector(`#map [data-sector="${CSS.escape(p.sector.toLowerCase())}"]`);
  $("map-sector").setAttribute("d", shape?.getAttribute("d") ?? "");
}

function renderPanel() {
  const panel = $("map-detail");
  const p = planets.find((q) => q.index === selected);
  const html = p
    ? `<h3 translate="no">${esc(p.name)}</h3>
    <dl class="facts">
      <div><dt>${t.map.sector}</dt><dd>${esc(p.sector)}</dd></div>
      <div><dt>${t.map.owner}</dt><dd>${ownerBadge(p)}</dd></div>
      <div><dt>${t.map.liberation}</dt><dd>${liberationText(p)}</dd></div>
      <div><dt>${t.map.players}</dt><dd>${num(p.statistics.playerCount)}</dd></div>
    </dl>
    ${p.event || order.has(p.index) ? `<p class="badges">${order.has(p.index) ? `<span class="badge mo">${t.overview.order}</span> ` : ""}${p.event ? `<span class="badge ${slug(p.event.faction)}">${fill(t.js.defend, { time: countdown(p.event.endTime) })}</span>` : ""}</p>` : ""}
    ${campaign.has(p.index) && !held(p) ? `<div class="meter">${bar(liberation(p), `${t.map.liberation} ${p.name}`)}</div>${rateLine(p, liberation(p), rates[p.index])}` : ""}
    <a href="/${lang}/planets/?open=${p.index}">${icon("arrow-square-out")} ${t.map.open}</a>`
    : `<p class="muted">${t.map.hint}</p>`;
  if (html === lastPanel) return; // the clock ticks the countdown itself; rewriting would drop focus from the link
  const focused = panel.contains(document.activeElement);
  panel.innerHTML = lastPanel = html;
  if (focused) panel.querySelector("a")?.focus({ preventScroll: true });
}

const rank = (p) => (order.has(p.index) ? 2e9 : 0) + (p.event ? 1e9 : 0) + p.statistics.playerCount;

// Every campaign as a button that flies the map there: Major Order first, then defenses, then by Helldivers.
function renderFronts(list) {
  const html =
    [...list]
      .sort((a, b) => rank(b) - rank(a))
      .map((p) => {
        const lib = liberation(p);
        return `<li><button type="button" class="${slug(enemyOf(p))}" data-go="${p.index}" aria-pressed="${p.index === selected}">
      <span class="name" translate="no">${esc(p.name)}</span>
      <span class="pct">${held(p) ? t.js.held : pct0(lib)}</span>
      <span class="players">${icon("users")}<span class="visually-hidden">${t.js.playersLabel} </span>${num(p.statistics.playerCount)}</span>
      <span class="tags"><span class="sector" translate="no">${esc(p.sector)}</span>${order.has(p.index) ? `<span class="badge mo">${t.overview.order}</span>` : ""}${p.event ? `<span class="badge defense">${t.map.defending}</span>` : ""}</span>
      <span class="track" aria-hidden="true"><span style="transform:scaleX(${lib.toFixed(3)})"></span></span>
    </button></li>`;
      })
      .join("") || `<li class="muted">${t.js.noCampaigns}</li>`;
  if (html === lastFronts) return;
  const ul = $("map-fronts"),
    focused = document.activeElement?.closest("#map-fronts [data-go]")?.dataset.go;
  ul.innerHTML = lastFronts = html;
  if (focused) ul.querySelector(`[data-go="${focused}"]`)?.focus({ preventScroll: true });
}

export default async function galaxyMap() {
  if (!bound) {
    bound = true;
    linked = new URLSearchParams(location.search).get("planet");
    bind();
    apply();
  }
  const [list, campaigns, orders] = await Promise.all([
    get("/api/v1/planets", 3600), // 300 KB; campaign planets below overlay it every minute
    get("/api/v1/campaigns"),
    get("/api/v1/assignments"),
  ]);
  const campaignPlanets = campaigns.map((c) => c.planet);
  const byIndex = Object.fromEntries([...list, ...campaignPlanets].map((p) => [p.index, p]));
  campaign = new Set(campaignPlanets.map((p) => p.index));
  rates = track(campaignPlanets, fetchedAt["/api/v1/campaigns"]);
  order = new Set(orders.flatMap((o) => o.tasks.map((task, i) => describeTask(task, o.progress[i], byIndex).planet?.index)));
  // Planets not yet placed (sector "TBD", like WAYWARD) sit at 0,0 on top of Super Earth and would take its clicks.
  planets = Object.values(byIndex).filter((p) => !p.disabled && p.position && (p.index === 0 || p.position.x || p.position.y));
  points = planets.map((p) => {
    const [x, y] = project(p.position);
    return { index: p.index, x, y };
  });
  if (!planets.some((p) => p.index === rover)) rover = (planets.find((p) => campaign.has(p.index)) ?? planets[0])?.index;

  const at = Object.fromEntries(points.map((q) => [q.index, q]));
  const lines = new Set();
  for (const p of planets) for (const w of p.waypoints ?? []) if (at[w]) lines.add(p.index < w ? `${p.index}-${w}` : `${w}-${p.index}`);
  const path = [...lines]
    .map((k) => {
      const [a, b] = k.split("-").map((i) => at[i]);
      return `M${a.x} ${a.y}L${b.x} ${b.y}`;
    })
    .join("");

  // Each planet is a group at its position; .pin inside it carries the zoom-independent size (see apply).
  // All tap areas sit under all dots so a direct hit picks that planet, and campaigns draw last so their labels stay on top.
  const isActive = (p) => p.index === 0 || campaign.has(p.index) || order.has(p.index); // Super Earth (0) anchors the map, so it is always named
  const radius = (p) => (p.index === 0 ? 24 : isActive(p) ? 7 : 4.5);
  // Super Earth's globe sits on its dot in the middle of the map; credited from img/super-earth/sources.json (map.njk),
  // outside img/planets/, whose sync deletes files it did not mirror
  const emblem = `<image class="emblem" href="/img/super-earth/super-earth-planet-icon.webp" x="-22" y="-22" width="44" height="44"/>`;
  // a front's progress under its name, once there is any; untouched fronts read 0 % in the list beside the map
  const subText = (p) => (!campaign.has(p.index) ? "" : held(p) ? t.js.held : liberation(p) >= 0.005 ? pct0(liberation(p)) : "");
  const actives = planets.filter(isActive).sort((a, b) => rank(b) - rank(a));
  // shortcut: label widths are estimated from character counts at 11px and 10px Oxanium; measure with getBBox if they drift
  const sides = placeLabels(
    actives.map((p) => ({
      ...at[p.index],
      w: Math.max(p.name.length * 7.2, subText(p).length * 5.5),
      h: subText(p) ? 26 : 12,
      gap: radius(p) + 9,
    })),
    actives.map((p) => {
      const { x, y } = at[p.index],
        d = radius(p) + (order.has(p.index) ? 12 : 5);
      return { index: p.index, x0: x - d, y0: y - d, x1: x + d, y1: y + d };
    }),
  );
  const hits = [],
    pins = [],
    top = [],
    sectors = {};
  for (const p of planets) {
    const { x, y } = at[p.index];
    (sectors[p.sector] ??= []).push(at[p.index]);
    const active = isActive(p);
    const r = radius(p);
    const lib = liberation(p);
    const states = [];
    let marks = "";
    if (campaign.has(p.index)) {
      states.push(p.event ? t.map.defending : t.map.liberating);
      // ring in the enemy's colour, filled clockwise in Super Earth blue as the planet is taken
      marks += `<circle class="mark ${p.event ? "defending " : ""}${slug(enemyOf(p))}" r="${r + 5}"/>`;
      if (lib > 0) marks += `<circle class="progress" r="${r + 5}" pathLength="100" stroke-dasharray="${(lib * 100).toFixed(1)} 100" transform="rotate(-90)"/>`;
    }
    if (order.has(p.index)) {
      states.push(t.map.order);
      const d = r + 12;
      marks += `<polygon class="mark order" points="0,${-d} ${d},0 0,${d} ${-d},0"/>`;
    }
    const left = sides[p.index] === "left",
      lx = left ? -(r + 9) : r + 9;
    const sub = subText(p) ? `<tspan x="${lx}" dy="1.25em" class="sub">${subText(p)}</tspan>` : "";
    const cls = !active ? "minor" : sides[p.index] ? "" : "crowded";
    const label = `<text class="${cls}"${left ? ' text-anchor="end"' : ""} x="${lx}" y="${sub ? -2 : 4}" aria-hidden="true">${esc(p.name)}${sub}</text>`;
    const name = [p.name, faction(p.currentOwner), ...states].join(", ");
    const g = `<g transform="translate(${x} ${y})">`;
    hits.push(`${g}<circle class="hit pin" data-hit="${p.index}" r="${r}"/></g>`);
    (active ? top : pins).push(
      `${g}<g class="pin">${marks}<circle class="planet ${slug(p.currentOwner)}" data-planet="${p.index}" r="${r}" role="button" tabindex="${p.index === rover ? 0 : -1}" aria-pressed="${p.index === selected}" aria-label="${esc(name)}"/>${p.index === 0 ? emblem : ""}${label}</g></g>`,
    );
  }
  const sectorLabels = Object.entries(sectors).map(([name, ps]) => {
    const x = ps.reduce((n, q) => n + q.x, 0) / ps.length,
      y = ps.reduce((n, q) => n + q.y, 0) / ps.length;
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><text class="pin">${esc(name)}</text></g>`;
  });

  const layer = $("map-layer");
  const html = `<path class="lines" d="${path}"/><path class="route" id="map-route"/><g class="sectors" aria-hidden="true">${sectorLabels.join("")}</g><g aria-hidden="true">${hits.join("")}</g>${pins.join("")}${top.join("")}`;
  if (html !== lastLayer) {
    // the planet list is cached for an hour, so most refreshes draw the same map
    const focused = document.activeElement?.closest("#map-layer [data-planet]")?.dataset.planet;
    layer.innerHTML = lastLayer = html;
    if (focused) layer.querySelector(`[data-planet="${focused}"]`)?.focus({ preventScroll: true });
    drawRoutes();
  }
  // A sector takes the colour of the enemy holding most of its enemy-held planets; Super Earth's own stay clear.
  const enemies = {};
  for (const p of planets) if (p.currentOwner !== "Humans") (enemies[p.sector.toLowerCase()] ??= []).push(p.currentOwner);
  for (const el of document.querySelectorAll("#map [data-sector]")) {
    const owners = enemies[el.dataset.sector] ?? [];
    const top = owners.sort((a, b) => owners.filter((o) => o === b).length - owners.filter((o) => o === a).length)[0];
    if (top) el.setAttribute("class", slug(top));
    else el.removeAttribute("class");
  }
  const names = planets
    .map((p) => p.name)
    .sort(new Intl.Collator(lang).compare)
    .map((n) => `<option value="${esc(n)}">`)
    .join("");
  if (names !== lastNames) $("map-names").innerHTML = lastNames = names;
  renderFronts(campaignPlanets);
  $("map-loading").hidden = true;
  if (linked != null) {
    go(Number(linked));
    linked = null;
  }
  renderPanel();
}
