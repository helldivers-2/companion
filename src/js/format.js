import labels from "../_data/labels.json" with { type: "json" };

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
export const num = (n) => new Intl.NumberFormat("en").format(n ?? 0);
export const pct = (x) => `${(x * 100).toFixed(2)}%`;
// Used raw in class and id attributes, so it must only ever emit [a-z0-9-].
export const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-");
export const titleCase = (s) => String(s).toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

export function bar(ratio, label) {
  const v = Math.max(0, Math.min(1, ratio || 0));
  return `<div class="bar" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${(v * 100).toFixed(1)}"><span style="width:${v * 100}%"></span></div>`;
}

// Share of the planet Super Earth holds: defense progress during an event, liberation otherwise.
export function liberation(planet) {
  const e = planet.event;
  if (e) return 1 - e.health / e.maxHealth;
  if (planet.currentOwner === "Humans") return 1;
  return 1 - planet.health / planet.maxHealth;
}

export function enemyOf(planet) {
  return planet.event?.faction ?? planet.currentOwner;
}

export function duration(ms) {
  let s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  s %= 60;
  if (d) return `${d}d ${h}h ${m}m`;
  if (h) return `${h}h ${m}m`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

// Every caller wraps this in a sentence ("… left", "ends in …"), so it stops at zero instead of saying "ended".
export const timeLeft = (until, now = Date.now()) => duration(Math.max(0, Date.parse(until) - now) || 0);

export const countdown = (iso) => `<time data-until="${esc(iso)}" datetime="${esc(iso)}">${timeLeft(iso)}</time>`;

// Dispatches use the game's <span data-ah="n"> highlight markup; keep only that, escape everything else.
export const dispatchHtml = (msg) =>
  esc(msg)
    .replace(/&#60;span data-ah=&#34;(\d)&#34;&#62;/g, '<strong class="ah-$1">')
    .replace(/&#60;\/span&#62;/g, "</strong>")
    .replace(/&#60;\/?i(=\d)?&#62;/g, "");

// Task semantics are reverse-engineered by the community; unknown types fall back to a raw label.
export function describeTask(task, progress = 0, planets = {}) {
  const vt = labels.valueTypes;
  const val = (t) => {
    const i = task.valueTypes.indexOf(t);
    return i < 0 ? undefined : task.values[i];
  };
  const verb = labels.taskTypes[task.type] ?? `Task type ${task.type}`;
  const planetIndex = val(vt.planet);
  const planet = planetIndex ? planets[planetIndex] : undefined; // 0 means "any planet"
  const goal = val(vt.goal) || 1;
  const faction = labels.factions[val(vt.faction) - 1];
  const ratio = Math.min(1, progress / goal);
  if (planetIndex) {
    return { text: `${verb} ${planet?.name ?? `planet #${planetIndex}`}`, planet, ratio, done: progress >= goal, counted: false };
  }
  const unit = faction ?? ([11, 12, 13, 15].includes(task.type) ? "planets" : "");
  return { text: `${verb} ${num(goal)} ${unit}`.trim(), ratio, done: progress >= goal, counted: goal > 1, progress, goal };
}
