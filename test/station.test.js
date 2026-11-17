import test from "node:test";
import assert from "node:assert/strict";

const { stationPanel } = await import("../src/js/pages/overview.js");

const soon = (h) => new Date(Date.now() + h * 3_600_000).toISOString();
const action = (name, status, statusExpire, costs = [{ currentValue: 0, targetValue: 86400 }]) =>
  ({ name, status, statusExpire, costs, strategicDescription: `${name} effect` });
const station = (tacticalActions) => ({ planet: { name: "MATAR BAY" }, electionEnd: soon(1), tacticalActions });
const text = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

test("station groups actions with the active one first", () => {
  const html = text(stationPanel(station([
    action("EAGLE STORM", 3, soon(76)),
    action("ORBITAL BLOCKADE", 1, soon(28), [{ currentValue: 8640, targetValue: 86400 }]),
    action("HEAVY ORDNANCE DISTRIBUTION", 2, soon(15)),
  ])));
  assert.match(html, /Active now HEAVY ORDNANCE DISTRIBUTION 1[45]h \d+m left .*Preparing ORBITAL BLOCKADE 10% ready .*On cooldown EAGLE STORM , ready in 3d \d+h/);
});

test("station lists statuses it doesn't know by name, without expired times", () => {
  // The archived state of 29 January 2026: every action at status 0, expiry dates from 2024.
  const html = text(stationPanel(station([
    action("EAGLE STORM", 0, "2024-02-29T05:21:00Z"),
    action("ORBITAL BLOCKADE", 0, "2024-02-29T05:21:20Z"),
  ])));
  assert.match(html, /Status unknown EAGLE STORM ORBITAL BLOCKADE/);
  assert.doesNotMatch(html, /0m 00s|ready in|left/);
});

test("station hides an expired time and measures preparation by the furthest-behind cost", () => {
  const html = text(stationPanel(station([
    action("EAGLE STORM", 2, soon(-0.1)),
    action("ORBITAL BLOCKADE", 1, soon(28), [{ currentValue: 70000, targetValue: 86400 }, { currentValue: 1200, targetValue: 30000 }]),
  ])));
  assert.match(html, /Active now EAGLE STORM EAGLE STORM effect/);
  assert.match(html, /ORBITAL BLOCKADE 4% ready/);
});

test("station without actions says so", () => {
  assert.match(text(stationPanel(station([]))), /No tactical actions right now/);
});
