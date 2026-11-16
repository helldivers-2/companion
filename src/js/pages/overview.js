import labels from "../../_data/labels.json" with { type: "json" };
import { get } from "../api.js";
import { bar, countdown, describeTask, enemyOf, esc, icon, leadingRegion, liberation, num, pct, record, regen, slug, titleCase } from "../format.js";
import { eta, hoursToWin, track } from "../rates.js";

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
  const rates = track(campaigns.map((c) => c.planet));
  const orderPlanets = new Set();

  $("orders").innerHTML = orders.length
    ? orders.map((o) => orderPanel(o, planets, rates, orderPlanets)).join("")
    : `<article class="order"><p>${icon("target")} No Major Order right now. High Command will issue new orders soon.</p></article>`;

  $("dss-section").hidden = !stations.length;
  $("dss").innerHTML = stations.map(stationPanel).join("");

  $("record").innerHTML = record(war.statistics, true);

  const defenses = campaigns.filter((c) => c.planet.event).length;
  $("online").innerHTML = [
    `${icon("users")} ${num(war.statistics.playerCount)} Helldivers online`,
    `${num(campaigns.length)} fronts, ${num(defenses)} ${defenses === 1 ? "defense" : "defenses"}`,
    war.impactMultiplier ? `mission impact ×${war.impactMultiplier.toFixed(4)}` : "",
  ].filter(Boolean).join(" · ");

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
    .map(([faction, list]) => {
      const rows = list.sort((a, b) => rank(b) - rank(a)).map((p) => frontRow(p, rates[p.index], orderPlanets.has(p.index)));
      const rest = rows.splice(SHOWN_PER_FRONT);
      return `<section class="front ${slug(faction)}" aria-labelledby="front-${slug(faction)}">
        <h3 id="front-${slug(faction)}">${esc(faction)} <span class="muted">${num(players(list))} Helldivers</span></h3>
        <ul class="rows">${rows.join("")}</ul>
        ${rest.length ? `<details id="more-${slug(faction)}"${open.has(`more-${slug(faction)}`) ? " open" : ""}><summary>${icon("caret-right")} Show ${rest.length} more</summary><ul class="rows">${rest.join("")}</ul></details>` : ""}
      </section>`;
    }).join("") || `<p class="muted">${icon("sword")} No active campaigns.</p>`;
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
      <span class="check icon"><span class="visually-hidden">${d.done ? "Complete:" : "Open:"}</span></span>
      <div>
        <p class="task-line">${esc(d.text)}${p ? ` <span class="tag ${slug(p.currentOwner)}">${p.currentOwner === "Humans" ? "Held" : esc(p.currentOwner)}</span>` : ""}</p>
        ${detail}
      </div>
    </li>`;
  }).join("");
  const rewards = (o.rewards ?? [o.reward]).filter(Boolean)
    .map((r) => `${num(r.amount)} ${labels.rewardTypes[r.type] ?? "reward"}`).join(", ");
  return `<article class="order">
    <header>
      <h3>${icon("trophy")} ${esc(titleCase(o.title ?? "Major Order"))}</h3>
      <p class="order-clock">${icon("calendar-blank")} <span class="big">${countdown(o.expiration)}</span> left</p>
    </header>
    ${o.briefing ? `<p class="briefing">${esc(o.briefing)}</p>` : ""}
    ${tasks ? `<ul class="tasks">${tasks}</ul>` : ""}
    ${described.length > 1 ? `<p class="muted">${done} of ${described.length} objectives complete</p>` : ""}
    ${rewards ? `<p class="reward">${icon("medal")} Reward: ${esc(rewards)}</p>` : ""}
  </article>`;
}

// Fronts nobody has taken ground on yet; 34 of 41 at a time is normal, so they get no bar.
const idle = (p) => !p.event && liberation(p) === 0;

function meter(p, rate) {
  const lib = liberation(p);
  const r = leadingRegion(p);
  const where = r ? `${titleCase(r.name)}${r.size ? ` (${r.size.toLowerCase()})` : ""}` : "";
  const label = `${p.name} ${where ? `${where} ` : ""}${p.event ? "defense" : "liberation"}`;
  return `${where ? `<p class="region muted">${icon("map-pin")} ${esc(where)}</p>` : ""}<div class="meter">${bar(lib, label)}<span class="pct">${pct(lib)}</span></div>${rateLine(p, lib, rate)}`;
}

const STALLED = 0.0005; // under 0.05 %/h is measurement noise over a few minutes

export function rateLine(p, lib, rate, now = Date.now()) {
  if (lib >= 1) return ""; // a finished planet would otherwise read "won in ~1m"
  if (rate === undefined) {
    // Until this browser has measured a rate, the API's own regeneration is the best hint.
    const g = regen(p);
    return lib > 0 && g >= STALLED ? `<p class="rate stalled">Enemy regains ${(g * 100).toFixed(2)}%/h</p>` : "";
  }
  if (Math.abs(rate) < STALLED) return lib > 0 ? `<p class="rate stalled">No movement</p>` : "";
  const speed = `${rate > 0 ? "+" : "−"}${Math.abs(rate * 100).toFixed(2)}%/h`;
  const h = hoursToWin(lib, rate);
  if (h === null) return `<p class="rate losing">${speed}, losing ground</p>`;
  const tooSlow = p.event && now + h * 3_600_000 > Date.parse(p.event.endTime);
  return `<p class="rate${tooSlow ? " losing" : ""}">${speed}, ${tooSlow ? `needs ~${eta(h)}, too slow to hold` : `won in ~${eta(h)}`}</p>`;
}

const frontRow = (p, rate, isOrder) => `<li class="row">
  <div class="row-head">
    <h4>${esc(p.name)}</h4>
    <span class="muted sector">${esc(p.sector)}</span>
    ${isOrder ? `<span class="tag mo">Major Order</span>` : ""}
    ${p.event ? `<span class="tag defense">Defend, ${countdown(p.event.endTime)} left</span>` : ""}
    <span class="players" title="Helldivers on this planet"><span class="visually-hidden">Helldivers: </span>${num(p.statistics.playerCount)}</span>
  </div>
  ${idle(p) ? `<p class="rate stalled">No ground taken yet</p>` : meter(p, rate)}
</li>`;

const stationPanel = (st) => `<article class="panel">
  <header><h3>Orbiting ${esc(st.planet?.name ?? "unknown")}</h3><p class="muted">Next move vote ends in ${countdown(st.electionEnd)}</p></header>
  <ul class="actions">${(st.tacticalActions ?? []).map((a) => {
    const cost = a.costs?.[0];
    const status = labels.tacticalStatus[a.status] ?? "Unknown";
    return `<li><p><strong>${esc(a.name)}</strong> <span class="tag">${esc(status)}</span>
      ${a.status !== 1 && a.statusExpire ? `<span class="muted">for ${countdown(a.statusExpire)}</span>` : ""}</p>
      ${a.status === 1 && cost ? bar(cost.currentValue / cost.targetValue, `${a.name} preparation`) : ""}
      <p class="muted">${esc(a.strategicDescription || a.description)}</p></li>`;
  }).join("")}</ul>
</article>`;
