// Hellpods dropping from ships out of view into the empty margins beside the page column.
const NS = "http://www.w3.org/2000/svg";
const MIN = 72; // narrowest margin a pod fits into without touching the content
const LIFE = 9000; // ms from launch until a pod and its crater are gone

const rand = (a, b) => a + Math.random() * (b - a);

// The x ranges a pod may land in, given the viewport width and the page column's edges.
export function margins(width, left, right) {
  return [[0, left], [right, width]].filter(([a, b]) => b - a >= MIN).map(([a, b]) => [a + 24, b - 24]);
}

function el(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  for (const k in attrs) node.setAttribute(k, attrs[k]);
  parent?.append(node);
  return node;
}

const play = (node, frames, duration, delay = 0, easing = "linear", iterations = 1) =>
  node.animate(frames, { duration, delay, easing, iterations, fill: "forwards" }); // forwards only: delayed effects stay hidden until their moment

function gradient(defs, tag, attrs, stops) {
  const g = el(tag, attrs, defs);
  for (const [offset, color, opacity = 1] of stops) el("stop", { offset, "stop-color": color, "stop-opacity": opacity }, g);
}

function layer() {
  const svg = el("svg", { class: "hellpods", "aria-hidden": "true" }, document.body);
  const defs = el("defs", {}, svg);
  // Colours read on both themes: smoke and fire, no pure white that vanishes on the light ground.
  gradient(defs, "linearGradient", { id: "hp-smoke", x2: 0, y2: 1 }, [[0, "#8a847c", 0], [0.6, "#8a847c", 0.25], [1, "#8a847c", 0.6]]);
  gradient(defs, "linearGradient", { id: "hp-hot", x2: 0, y2: 1 }, [[0, "#ff7a1a", 0], [0.7, "#ff7a1a", 0], [0.93, "#ffa640", 0.85], [1, "#fff2c2"]]);
  el("feGaussianBlur", { stdDeviation: 2.5 }, el("filter", { id: "hp-blur", x: -1, width: 3 }, defs));
  gradient(defs, "radialGradient", { id: "hp-fire" }, [[0, "#fff6d0"], [0.35, "#ffc24a"], [0.7, "#ff6a1a", 0.55], [1, "#ff3d00", 0]]);
  gradient(defs, "radialGradient", { id: "hp-dust" }, [[0, "#8f877c", 0.7], [1, "#8f877c", 0]]);
  gradient(defs, "radialGradient", { id: "hp-scorch" }, [[0, "#1a1612", 0.6], [1, "#1a1612", 0]]);
  return svg;
}

function pod(parent) {
  const g = el("g", {}, parent);
  const fire = el("ellipse", { cy: -14, rx: 15, ry: 30, fill: "url(#hp-fire)" }, g); // plasma sheath trailing the nose
  el("image", { href: "/img/hellpod.png", x: -11, y: -42, width: 22, height: 44.7 }, g); // upright, nose at the bottom
  const glow = el("ellipse", { cy: -1, rx: 8, ry: 6, fill: "url(#hp-fire)" }, g); // hot nose, cools after impact
  const beacon = el("g", { opacity: 0 }, g);
  el("circle", { cy: -43, r: 6, fill: "#ff3b30", "fill-opacity": 0.3 }, beacon);
  el("circle", { cy: -43, r: 1.8, fill: "#ff6b5e" }, beacon);
  return { g, fire, glow, beacon };
}

function drop(svg, x, y, lo, hi) {
  // y counts up from the bottom edge (the layer's origin), so landed pods stay on it when the window resizes.
  const H = innerHeight + 140 + y; // height above the landing spot where the pod comes into view
  const fall = 450 + H * 0.45;
  const f = fall / LIFE;
  const ease = "cubic-bezier(.5,0,1,1)"; // still accelerating at impact; pod and trail share it so they stay joined
  // Tilt so the trail's top stays inside the margin: rotate(a) puts it at x + H·sin(a).
  const s = Math.max(-0.24, (lo - x) / H), t = Math.min(0.24, (hi - x) / H);
  const tilt = (Math.asin(rand(s, t)) * 180) / Math.PI;

  const root = el("g", { transform: `translate(${x} ${y})` }, svg);
  const scorch = el("ellipse", { rx: 24, ry: 8, fill: "url(#hp-scorch)" }, root);
  play(scorch, [{ opacity: 0 }, { opacity: 0, offset: f }, { opacity: 1, offset: f + 0.01 }, { opacity: 1, offset: 0.85 }, { opacity: 0 }], LIFE);

  const tilted = el("g", { transform: `rotate(${tilt})` }, root);
  // Smoke lingers and spreads; the glowing streak inside it cools within a moment of impact.
  const smoke = el("rect", { x: -4, y: -H, width: 8, height: H, fill: "url(#hp-smoke)", filter: "url(#hp-blur)" }, tilted);
  const hot = el("rect", { x: -1.25, y: -H, width: 2.5, height: H, fill: "url(#hp-hot)" }, tilted);
  const span = (w, h) => `translate(0px,${-H}px) scale(${w},${h}) translate(0px,${H}px)`; // grows down from the top
  play(smoke, [
    { transform: span(1, 0), easing: ease },
    { transform: span(1, 1), opacity: 1, offset: f },
    { transform: span(5, 1), opacity: 0, offset: 0.55 },
    { transform: span(5, 1), opacity: 0 },
  ], LIFE);
  play(hot, [
    { transform: span(1, 0), easing: ease },
    { transform: span(1, 1), opacity: 1, offset: f },
    { transform: span(1, 1), opacity: 0, offset: f + 0.04 },
    { transform: span(1, 1), opacity: 0 },
  ], LIFE);

  const p = pod(tilted);
  play(p.g, [
    { transform: `translate(0px,${-H}px) scale(.45)`, easing: ease }, // far away, so smaller
    { transform: "translate(0px,0px) scale(1)", offset: f, easing: "ease-out" },
    { transform: "translate(0px,3px) scale(1)", offset: f + 0.01 }, // digs in
    { transform: "translate(0px,3px) scale(1)", opacity: 1, offset: 0.9 },
    { transform: "translate(0px,3px) scale(1)", opacity: 0 },
  ], LIFE);
  play(p.fire, [{ opacity: 0.9 }, { opacity: 0.9, offset: f }, { opacity: 0, offset: f + 0.015 }, { opacity: 0 }], LIFE);
  play(p.fire, [{ transform: "scale(1,1)" }, { transform: "scale(.82,1.18)" }], 70, 0, "linear", Math.ceil(fall / 70));
  play(p.glow, [{ opacity: 1 }, { opacity: 1, offset: f }, { opacity: 0, offset: f + 0.3 }, { opacity: 0 }], LIFE);
  play(p.beacon, [{ opacity: 0 }, { opacity: 1, offset: 0.08 }, { opacity: 0, offset: 0.3 }, { opacity: 0 }], 1100, fall + 500, "linear", Math.floor((LIFE * 0.88 - fall - 500) / 1100));

  const flash = el("circle", { r: 1, fill: "url(#hp-fire)", opacity: 0 }, root);
  play(flash, [{ transform: "scale(12)", opacity: 1 }, { transform: "scale(75)", opacity: 0 }], 380, fall, "ease-out");
  const ring = el("ellipse", { rx: 1, ry: 0.35, fill: "none", stroke: "#c9a46a", "stroke-width": 2, "vector-effect": "non-scaling-stroke", opacity: 0 }, root);
  play(ring, [{ transform: "scale(6)", opacity: 0.9 }, { transform: "scale(110)", opacity: 0 }], 650, fall, "cubic-bezier(.2,.7,.3,1)");

  for (let i = 0; i < 8; i++) {
    const puff = el("circle", { r: 1, fill: "url(#hp-dust)", opacity: 0 }, root);
    const dx = rand(-45, 45), dy = rand(-8, 8), size = rand(18, 34);
    play(puff, [
      { transform: `translate(${dx * 0.2}px,${dy * 0.2}px) scale(${size * 0.3})`, opacity: 0.9 },
      { transform: `translate(${dx}px,${dy - rand(10, 35)}px) scale(${size})`, opacity: 0 },
    ], rand(2400, 4200), fall, "cubic-bezier(.1,.6,.3,1)");
  }

  // Debris and sparks thrown out on ballistic arcs, sampled into keyframes.
  for (let i = 0; i < 12; i++) {
    const spark = i % 3 === 0;
    const bit = el(spark ? "circle" : "rect", spark ? { r: 1, fill: "#ffd27a" } : { x: -1, y: -1, width: 2.2, height: 2.2, fill: "#3a342c" }, root);
    bit.setAttribute("opacity", 0);
    const vx = rand(-160, 160), vy = rand(-260, -90), g = 900;
    const time = (-2 * vy) / g + rand(0, 0.08);
    const frames = Array.from({ length: 9 }, (_, k) => {
      const s = (time * k) / 8;
      return { transform: `translate(${vx * s}px,${vy * s + (g * s * s) / 2}px)`, opacity: spark ? 1 - k / 8 : k < 7 ? 1 : 0 };
    });
    play(bit, frames, time * 1000, fall);
  }

  setTimeout(() => root.remove(), LIFE + 100);
}

export default function hellpods() {
  const motion = matchMedia("(prefers-reduced-motion: no-preference)");
  const main = document.getElementById("main");
  let svg;
  function squad() {
    const r = main.getBoundingClientRect();
    const sides = margins(innerWidth, r.left, r.right);
    if (motion.matches && !document.hidden && sides.length) {
      svg ??= layer();
      const n = 1 + Math.floor(Math.random() * 4); // a squad is one to four Helldivers
      const taken = [];
      for (let i = 0, at = 0; i < n; i++, at += rand(250, 900)) {
        // Anywhere in either margin, but apart from the rest of the squad; a narrow margin may still have to double up.
        let lo, hi, x;
        for (let tries = 0; tries < 12; tries++) {
          [lo, hi] = sides[Math.floor(Math.random() * sides.length)];
          x = rand(lo, hi);
          if (taken.every((t) => Math.abs(t - x) > 40)) break;
        }
        taken.push(x);
        setTimeout(() => drop(svg, x, -rand(4, 20), lo, hi), at);
      }
    }
    setTimeout(squad, rand(6000, 15000));
  }
  setTimeout(squad, 1500);
}
