import test from "node:test";
import assert from "node:assert/strict";
import { eta, hoursToWin, track } from "../src/js/rates.js";

const memory = () => { const m = {}; return { getItem: (k) => m[k] ?? null, setItem: (k, v) => { m[k] = v; } }; };
const planet = (health) => ({ index: 7, currentOwner: "Terminids", health, maxHealth: 1000, event: null });

test("track reports %/h once enough time has passed", () => {
  const store = memory();
  assert.deepEqual(track([planet(1000)], 0, store), {});
  assert.deepEqual(track([planet(990)], 60_000, store), {}); // under 5 min of history
  const rates = track([planet(900)], 6 * 60_000, store); // 10 % in 6 min
  assert.ok(Math.abs(rates[7] - 1) < 1e-9);
});

test("track ignores repeated cached snapshots", () => {
  const store = memory();
  track([planet(1000)], 0, store);
  track([planet(1000)], 10_000, store);
  assert.equal(JSON.parse(store.getItem("hd:history"))["7:lib"].length, 1);
});

test("track starts over instead of throwing on malformed stored history", () => {
  for (const bad of ['{"7:lib":5}', '{"7:lib":{"t":0}}', '{"7:lib":[null,5]}']) {
    const store = memory();
    store.setItem("hd:history", bad);
    assert.deepEqual(track([planet(500)], 60_000, store), {});
    assert.deepEqual(JSON.parse(store.getItem("hd:history"))["7:lib"], [[60_000, 0.5]]);
  }
});

test("hoursToWin", () => {
  assert.equal(hoursToWin(0.5, 0.1), 5);
  assert.equal(hoursToWin(0.5, -0.1), null);
});

test("eta rounds to a useful precision", () => {
  assert.equal(eta(0.25), "15m");
  assert.equal(eta(0.999), "1h");
  assert.equal(eta(7.2), "7h");
  assert.equal(eta(185 * 24 + 3), "185 days");
});

test("rateLine covers finished, stalled, losing and too-slow planets", async () => {
  const { rateLine } = await import("../src/js/pages/overview.js");
  const now = Date.parse("2026-01-01T00:00:00Z");
  const lib = { name: "X" };
  const defense = { name: "Y", event: { endTime: "2026-01-01T02:00:00Z" } };
  assert.equal(rateLine(lib, 1, 0.5, now), "");
  assert.equal(rateLine(lib, 0.5, undefined, now), "");
  assert.match(rateLine(lib, 0.5, 0.0001, now), /No movement/);
  assert.equal(rateLine(lib, 0, 0.0001, now), "");
  assert.match(rateLine(lib, 0.5, -0.01, now), /losing ground/);
  assert.match(rateLine(lib, 0.5, 0.1, now), /won in ~5h/);
  assert.match(rateLine(defense, 0.5, 0.1, now), /class="rate losing".*too slow to hold/);
  assert.match(rateLine(defense, 0.9, 0.1, now), /won in ~1h/);
});
