import { get, state } from "../api.js";
import { bar, countdown, describeTask, enemyOf, esc, faction, icon, leadingRegion, liberation, num, pct, record, regen, slug, titleCase } from "../format.js";
import { eta, hoursToWin, track } from "../rates.js";
import { fill, lang, t } from "../i18n.js";

const $ = (id) => document.getElementById(id);
const SHOWN_PER_FRONT = 5;

export default async function overview() {
  const [war, orders, campaigns, planetList, stations] = await Promise.all([
    get("/api/v1/war"),
    get("/api/v1/assignments"),
    get("/api/v1/campaigns"),
    get("/api/v1/planets"),
    get("/api/v2/space-stations", 300),
  ]);
  const planets = Object.fromEntries(planetList.map((p) => [p.index, p]));
  // An old cached snapshot must not enter the history as if it were measured now.
  const store = state.cacheOnly ? { getItem: (k) => localStorage.getItem(k), setItem() {} } : localStorage;
  const rates = track(campaigns.map((c) => c.planet), Date.now(), store);
  const orderPlanets = new Set();

  $("orders").innerHTML = orders.length
    ? orders.map((o) => orderPanel(o, planets, rates, orderPlanets)).join("")
    : `<article class="order"><p>${icon("target")} ${t.js.noOrder}</p></article>`;

  $("dss").innerHTML = stations.map(stationPanel).join("") || `<p class="muted">${t.js.noStation}</p>`;

  $("record").innerHTML = record(war.statistics, true);

  const defenses = campaigns.filter((c) => c.planet.event).length;
  $("online").innerHTML = [
    ["users", t.js.online, num(war.statistics.playerCount)],
    ["sword", t.js.fronts, num(campaigns.length)],
    ["shield-warning", t.js.defenses, num(defenses)],
    war.impactMultiplier ? ["percent", t.js.impact, new Intl.NumberFormat(lang, { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(war.impactMultiplier)] : null,
  ].filter(Boolean).map(([i, label, value]) => `<li>${icon(i)} <span class="muted">${label}</span> <strong>${value}</strong></li>`).join("");

  const groups = {};
  for (const c of campaigns) (groups[enemyOf(c.planet)] ??= []).push(c.planet);
  const players = (list) => list.reduce((n, p) => n + p.statistics.playerCount, 0);
  const rank = (p) => (orderPlanets.has(p.index) ? 2e9 : 0) + (p.event ? 1e9 : 0) + (idle(p) ? 0 : 5e8) + p.statistics.playerCount;
  // Re-rendering every minute would otherwise collapse an opened "Show more" and drop focus from its summary.
  const fronts = $("fronts");
  const open = new Set([...fronts.querySelectorAll("details[open]")].map((d) => d.id));
  const focused = document.activeElement?.closest("#fronts details")?.id;
  fronts.innerHTML = Object.entries(groups)
    .sort(([, a], [, b]) => players(b) - players(a))
    .map(([enemy, list]) => {
      const rows = list.sort((a, b) => rank(b) - rank(a)).map((p) => frontRow(p, rates[p.index], orderPlanets.has(p.index)));
      const rest = rows.splice(SHOWN_PER_FRONT);
      const id = slug(enemy);
      return `<section class="front ${id}" aria-labelledby="front-${id}">
        <h3 id="front-${id}">${esc(faction(enemy))} <span class="muted">${fill(t.js.helldivers, { n: num(players(list)) })}</span></h3>
        <ul class="rows">${rows.join("")}</ul>
        ${rest.length ? `<details id="more-${id}"${open.has(`more-${id}`) ? " open" : ""}><summary>${icon("caret-right")} ${fill(t.js.showMore, { n: rest.length })}</summary><ul class="rows">${rest.join("")}</ul></details>` : ""}
      </section>`;
    }).join("") || `<p class="muted">${icon("sword")} ${t.js.noCampaigns}</p>`;
  if (focused) document.getElementById(focused)?.querySelector("summary").focus({ preventScroll: true });
}

function orderPanel(o, planets, rates, orderPlanets) {
  const described = o.tasks.map((t, i) => describeTask(t, o.progress[i], planets));
  const done = described.filter((d) => d.done).length;
  const tasks = described.map((d) => {
    const p = d.planet;
    if (p) orderPlanets.add(p.index);
    let detail = "";
    if (d.counted) detail = `<div class="meter">${bar(d.ratio, d.text)}<span class="pct">${num(d.progress)} / ${num(d.goal)}</span></div>`;
    else if (p && (p.currentOwner !== "Humans" || p.event)) detail = meter(p, rates[p.index]);
    return `<li class="${d.done ? "done" : ""}">
      <span class="check icon"><span class="visually-hidden">${d.done ? t.js.complete : t.js.open}</span></span>
      <div>
        <p class="task-line">${esc(d.text)}${p ? ` <span class="tag ${slug(p.currentOwner)}">${p.currentOwner === "Humans" ? t.js.held : esc(faction(p.currentOwner))}</span>` : ""}</p>
        ${detail}
      </div>
    </li>`;
  }).join("");
  const rewards = (o.rewards ?? [o.reward]).filter(Boolean)
    .map((r) => `${num(r.amount)} ${t.rewardTypes[r.type] ?? t.js.reward}`).join(", ");
  // The card is already titled "Major Order", so only a different (named) title is worth repeating.
  const title = (o.title ?? "").toLowerCase() === t.overview.order.toLowerCase() ? "" : titleCase(o.title ?? "");
  return `<article class="order">
    <header>
      ${title ? `<h3>${icon("trophy")} ${esc(title)}</h3>` : ""}
      <p class="order-clock">${icon("calendar-blank")} ${fill(t.js.left, { time: `<span class="big">${countdown(o.expiration)}</span>` })}</p>
    </header>
    ${o.briefing ? `<p class="briefing">${esc(o.briefing)}</p>` : ""}
    ${tasks ? `<ul class="tasks">${tasks}</ul>` : ""}
    ${described.length > 1 ? `<p class="muted">${fill(t.js.objectives, { done, total: described.length })}</p>` : ""}
    ${rewards ? `<p class="reward">${icon("medal")} ${fill(t.js.rewardLine, { rewards: esc(rewards) })}</p>` : ""}
  </article>`;
}

// Fronts nobody has taken ground on yet; 34 of 41 at a time is normal, so they get no bar.
const idle = (p) => !p.event && liberation(p) === 0;

function meter(p, rate) {
  const lib = liberation(p);
  const r = leadingRegion(p);
  const where = r ? `${titleCase(r.name)}${r.size ? ` (${r.size.toLowerCase()})` : ""}` : "";
  const label = fill(p.event ? t.js.defense : t.js.liberation, { planet: where ? `${p.name} ${where}` : p.name });
  return `${where ? `<p class="region muted">${icon("map-pin")} ${esc(where)}</p>` : ""}<div class="meter">${bar(lib, label)}<span class="pct">${pct(lib)}</span></div>${rateLine(p, lib, rate)}`;
}

const STALLED = 0.0005; // under 0.05 %/h is measurement noise over a few minutes

export function rateLine(p, lib, rate, now = Date.now()) {
  if (lib >= 1) return ""; // a finished planet would otherwise read "won in ~1m"
  if (rate === undefined) {
    // Until this browser has measured a rate, the API's own regeneration is the best hint.
    const g = regen(p);
    return lib > 0 && g >= STALLED ? `<p class="rate stalled">${fill(t.js.regains, { rate: pct(g) })}</p>` : "";
  }
  if (Math.abs(rate) < STALLED) return lib > 0 ? `<p class="rate stalled">${t.js.noMovement}</p>` : "";
  const speed = `${rate > 0 ? "+" : "−"}${pct(Math.abs(rate))}/h`;
  const h = hoursToWin(lib, rate);
  if (h === null) return `<p class="rate losing">${fill(t.js.losing, { speed })}</p>`;
  const tooSlow = p.event && now + h * 3_600_000 > Date.parse(p.event.endTime);
  return `<p class="rate${tooSlow ? " losing" : ""}">${fill(tooSlow ? t.js.tooSlow : t.js.winIn, { speed, eta: eta(h) })}</p>`;
}

const frontRow = (p, rate, isOrder) => `<li class="row">
  <div class="row-head">
    <h4>${esc(p.name)}</h4>
    <span class="muted sector">${esc(p.sector)}</span>
    ${isOrder ? `<span class="tag mo">${t.overview.order}</span>` : ""}
    ${p.event ? `<span class="tag defense">${fill(t.js.defend, { time: countdown(p.event.endTime) })}</span>` : ""}
    <span class="players" title="${t.js.onPlanet}"><span class="visually-hidden">${t.js.playersLabel} </span>${num(p.statistics.playerCount)}</span>
  </div>
  ${idle(p) ? `<p class="rate stalled">${t.js.idle}</p>` : meter(p, rate)}
</li>`;

const stationPanel = (st) => `<article class="station">
  <header><h3>${fill(t.js.orbiting, { planet: esc(st.planet?.name ?? t.js.unknown) })}</h3><p class="muted">${fill(t.js.vote, { time: countdown(st.electionEnd) })}</p></header>
  <ul class="actions">${(st.tacticalActions ?? []).map((a) => {
    const cost = a.costs?.[0];
    const status = t.tacticalStatus[a.status] ?? t.js.statusUnknown;
    return `<li><p><strong>${esc(a.name)}</strong> <span class="tag">${esc(status)}</span>
      ${a.status !== 1 && a.statusExpire ? `<span class="muted">${fill(t.js.for, { time: countdown(a.statusExpire) })}</span>` : ""}</p>
      ${a.status === 1 && cost ? bar(cost.currentValue / cost.targetValue, fill(t.js.preparation, { name: a.name })) : ""}
      <p class="muted">${esc(a.strategicDescription || a.description)}</p></li>`;
  }).join("")}</ul>
</article>`;
