import test from "node:test";
import assert from "node:assert/strict";
import { describeTask, dispatchHtml, liberation, slug, timeLeft } from "../src/js/format.js";

test("liberation uses event health during a defense", () => {
  assert.equal(liberation({ currentOwner: "Terminids", health: 250, maxHealth: 1000, event: null }), 0.75);
  assert.equal(liberation({ currentOwner: "Humans", health: 1000, maxHealth: 1000, event: null }), 1);
  assert.equal(liberation({ currentOwner: "Humans", event: { health: 600, maxHealth: 1000 } }), 0.4);
});

test("timeLeft formats remaining time", () => {
  const now = Date.parse("2026-01-01T00:00:00Z");
  assert.equal(timeLeft("2026-01-02T03:04:00Z", now), "1d 3h 4m");
  assert.equal(timeLeft("2026-01-01T00:05:09Z", now), "5m 09s");
  assert.equal(timeLeft("2025-12-31T00:00:00Z", now), "ended");
});

test("dispatchHtml keeps highlights and escapes everything else", () => {
  assert.equal(
    dispatchHtml('<span data-ah="3">NEW</span> <img src=x onerror=alert(1)>'),
    '<strong class="ah-3">NEW</strong> &#60;img src=x onerror=alert(1)&#62;',
  );
});

test("slug only emits attribute-safe characters", () => {
  assert.equal(slug("Terminids"), "terminids");
  assert.equal(slug('x" onmouseover="alert(1)'), "x-onmouseover-alert-1-");
});

test("describeTask reads planet and kill tasks", () => {
  const planets = { 129: { index: 129, name: "ACAMAR IV" } };
  const hold = describeTask({ type: 13, values: [1, 1, 129], valueTypes: [3, 11, 12] }, 1, planets);
  assert.equal(hold.text, "Hold ACAMAR IV");
  assert.equal(hold.done, true);
  const kill = describeTask({ type: 3, values: [2, 1000000, 0], valueTypes: [1, 3, 12] }, 250000);
  assert.equal(kill.text, "Eradicate 1,000,000 Terminids");
  assert.equal(kill.ratio, 0.25);
});
