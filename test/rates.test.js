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

test("hoursToWin", () => {
  assert.equal(hoursToWin(0.5, 0.1), 5);
  assert.equal(hoursToWin(0.5, -0.1), null);
});

test("eta rounds to a useful precision", () => {
  assert.equal(eta(0.25), "15m");
  assert.equal(eta(7.2), "7h");
  assert.equal(eta(185 * 24 + 3), "185 days");
});
