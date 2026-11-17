import { get } from "../api.js";
import { countdown, describeTask, esc, faction, held, icon, liberation, num, pct, slug } from "../format.js";
import { fill, lang, t } from "../i18n.js";

const SIZE = 1000; // the viewBox at zoom 1; planet positions span roughly -1..1
const PAD = 50;
const MAX_ZOOM = 12;

// y is flipped: the API's y grows upward, SVG's grows downward.
export const project = ({ x, y }) => [PAD + ((x + 1) / 2) * (SIZE - 2 * PAD), PAD + ((1 - y) / 2) * (SIZE - 2 * PAD)];

// Keeps the view inside the map and the zoom inside its limits.
export function clampView({ cx, cy, k }) {
  k = Math.min(MAX_ZOOM, Math.max(1, k));
  const half = SIZE / k / 2;
  return { cx: Math.min(SIZE - half, Math.max(half, cx)), cy: Math.min(SIZE - half, Math.max(half, cy)), k };
}

// Arrow-key neighbour: the closest point in that direction, counting sideways drift double so the move stays roughly on its row or column.
export function nearest(points, from, dx, dy) {
  let best = null, bestScore = Infinity;
  for (const p of points) {
    const along = (p.x - from.x) * dx + (p.y - from.y) * dy;
    if (p === from || along <= 0) continue;
    const score = along + 2 * Math.abs((p.x - from.x) * dy - (p.y - from.y) * dx);
    if (score < bestScore) [best, bestScore] = [p, score];
  }
  return best;
}

const $ = (id) => document.getElementById(id);
const ARROWS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
let view = { cx: SIZE / 2, cy: SIZE / 2, k: 1 };
let planets = [];
let selected = null; // planet index
let rover = null; // the one planet in the tab order; arrow keys move it
let bound = false;
let lastPanel = "";

function apply() {
  view = clampView(view);
  const w = SIZE / view.k;
  $("map").setAttribute("viewBox", `${view.cx - w / 2} ${view.cy - w / 2} ${w} ${w}`);
}

// fx, fy: the point (as a share of the map's width and height) that stays put while zooming.
function zoomAt(k, fx = 0.5, fy = 0.5) {
  const w = SIZE / view.k, w2 = SIZE / Math.min(MAX_ZOOM, Math.max(1, k));
  view = { cx: view.cx - w / 2 + fx * w - fx * w2 + w2 / 2, cy: view.cy - w / 2 + fy * w - fy * w2 + w2 / 2, k };
  apply();
}

function bind() {
  const svg = $("map");
  // The SVG is letterboxed to a square, so screen share maps through its shorter side.
  const frame = () => {
    const r = svg.getBoundingClientRect(), s = Math.min(r.width, r.height);
    return { r, s, ox: (r.width - s) / 2, oy: (r.height - s) / 2 };
  };
  const pointers = new Map();
  let moved = false;
  const spread = () => { const [a, b] = [...pointers.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };

  svg.addEventListener("pointerdown", (e) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY });
    if (pointers.size === 1) moved = false;
  });
  svg.addEventListener("pointermove", (e) => {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    const { r, s, ox, oy } = frame();
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
  const up = (e) => pointers.delete(e.pointerId);
  svg.addEventListener("pointerup", up);
  svg.addEventListener("pointercancel", up);

  svg.addEventListener("click", (e) => {
    const i = Number(e.target.closest("[data-planet]")?.dataset.planet);
    if (!moved && !Number.isNaN(i)) select(i, true);
    moved = false;
  });
  svg.addEventListener("keydown", (e) => {
    const el = e.target.closest("[data-planet]");
    if (!el) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(Number(el.dataset.planet), true);
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
    else { view = { cx: SIZE / 2, cy: SIZE / 2, k: 1 }; apply(); }
  });
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

function select(index, announce) {
  selected = index;
  for (const el of document.querySelectorAll("#map-layer [data-planet]")) el.setAttribute("aria-pressed", Number(el.dataset.planet) === index);
  focusPlanet(index);
  const p = planets.find((q) => q.index === index);
  if (announce && p) $("map-announce").textContent = fill(t.map.selected, { name: p.name });
  renderPanel();
}

function renderPanel() {
  const panel = $("map-detail");
  const p = planets.find((q) => q.index === selected);
  const html = p ? `<h3 translate="no">${esc(p.name)}</h3>
    <dl class="facts">
      <div><dt>${t.map.sector}</dt><dd>${esc(p.sector)}</dd></div>
      <div><dt>${t.map.owner}</dt><dd><span class="tag ${slug(p.currentOwner)}">${esc(faction(p.currentOwner))}</span></dd></div>
      <div><dt>${t.map.liberation}</dt><dd>${held(p) ? t.js.held : pct(liberation(p))}</dd></div>
      <div><dt>${t.map.players}</dt><dd>${num(p.statistics.playerCount)}</dd></div>
    </dl>
    ${p.event ? `<p><span class="tag ${slug(p.event.faction)}">${fill(t.js.defend, { time: countdown(p.event.endTime) })}</span></p>` : ""}
    <a href="/${lang}/planets/?open=${p.index}">${icon("arrow-square-out")} ${t.map.open}</a>`
    : `<p class="muted">${t.map.hint}</p>`;
  if (html === lastPanel) return; // the clock ticks the countdown itself; rewriting would drop focus from the link
  const focused = panel.contains(document.activeElement);
  panel.innerHTML = lastPanel = html;
  if (focused) panel.querySelector("a")?.focus({ preventScroll: true });
}

export default async function galaxyMap() {
  if (!bound) {
    bound = true;
    bind();
  }
  const [list, campaigns, orders] = await Promise.all([
    get("/api/v1/planets", 3600), // 300 KB; campaign planets below overlay it every minute
    get("/api/v1/campaigns"),
    get("/api/v1/assignments"),
  ]);
  const campaignPlanets = campaigns.map((c) => c.planet);
  const byIndex = Object.fromEntries([...list, ...campaignPlanets].map((p) => [p.index, p]));
  const campaign = new Set(campaignPlanets.map((p) => p.index));
  const order = new Set(orders.flatMap((o) => o.tasks.map((task, i) => describeTask(task, o.progress[i], byIndex).planet?.index)));
  planets = Object.values(byIndex).filter((p) => !p.disabled && p.position);
  points = planets.map((p) => { const [x, y] = project(p.position); return { index: p.index, x, y }; });
  if (!planets.some((p) => p.index === rover)) rover = (planets.find((p) => campaign.has(p.index)) ?? planets[0])?.index;

  const at = Object.fromEntries(points.map((q) => [q.index, q]));
  const lines = new Set();
  for (const p of planets) for (const w of p.waypoints ?? []) if (at[w]) lines.add(p.index < w ? `${p.index}-${w}` : `${w}-${p.index}`);
  const path = [...lines].map((k) => { const [a, b] = k.split("-").map((i) => at[i]); return `M${a.x} ${a.y}L${b.x} ${b.y}`; }).join("");

  const marks = [], labels = [], dots = [];
  for (const p of planets) {
    const { x, y } = at[p.index];
    const active = campaign.has(p.index) || order.has(p.index);
    const r = active ? 9 : 6;
    const states = [];
    if (campaign.has(p.index) && !p.event) {
      states.push(t.map.liberating);
      marks.push(`<circle class="mark humans" cx="${x}" cy="${y}" r="${r + 5}"/>`);
    }
    if (p.event) {
      states.push(t.map.defending);
      marks.push(`<circle class="mark defending ${slug(p.event.faction)}" cx="${x}" cy="${y}" r="${r + 5}"/>`);
    }
    if (order.has(p.index)) {
      states.push(t.map.order);
      const d = r + 12;
      marks.push(`<polygon class="mark order" points="${x},${y - d} ${x + d},${y} ${x},${y + d} ${x - d},${y}"/>`);
    }
    if (active) labels.push(`<text x="${x + r + 8}" y="${y + 4}">${esc(p.name)}</text>`);
    const name = [p.name, faction(p.currentOwner), ...states].join(", ");
    dots.push(`<circle class="planet ${slug(p.currentOwner)}" data-planet="${p.index}" cx="${x}" cy="${y}" r="${r}" role="button" tabindex="${p.index === rover ? 0 : -1}" aria-pressed="${p.index === selected}" aria-label="${esc(name)}"/>`);
  }

  const layer = $("map-layer");
  const focused = document.activeElement?.closest("#map-layer [data-planet]")?.dataset.planet; // the 60 s refresh rebuilds the planets
  layer.innerHTML = `<path class="lines" d="${path}"/>${marks.join("")}${dots.join("")}<g class="labels" aria-hidden="true">${labels.join("")}</g>`;
  if (focused) layer.querySelector(`[data-planet="${focused}"]`)?.focus({ preventScroll: true });
  $("map-loading").hidden = true;
  renderPanel();
}
