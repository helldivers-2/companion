import test from "node:test";
import assert from "node:assert/strict";
import { describeTask, dispatchHtml, leadingRegion, liberation, record, regen, slug, steamHtml, timeLeft } from "../src/js/format.js";

test("liberation uses event health during a defense", () => {
  assert.equal(liberation({ currentOwner: "Terminids", health: 250, maxHealth: 1000, event: null }), 0.75);
  assert.equal(liberation({ currentOwner: "Humans", health: 1000, maxHealth: 1000, event: null }), 1);
  assert.equal(liberation({ currentOwner: "Humans", event: { health: 600, maxHealth: 1000 } }), 0.4);
});

test("liberation falls back to the furthest-taken region while planet health is full", () => {
  const regions = [
    { id: 0, name: "A", health: 100, maxHealth: 100, regenPerSecond: 1 },
    { id: 1, name: "B", health: 40, maxHealth: 100, regenPerSecond: 0.01 },
    { id: 2, name: "C", health: 80, maxHealth: 100 },
  ];
  const p = { currentOwner: "Terminids", health: 1000, maxHealth: 1000, regenPerSecond: 1, event: null, regions };
  assert.equal(leadingRegion(p).name, "B");
  assert.equal(liberation(p), 0.6);
  assert.equal(regen(p), 0.36); // 0.01/s * 3600 / 100
  // planet-level progress wins, and untouched regions leave it at 0
  assert.equal(leadingRegion({ ...p, health: 750 }), null);
  assert.equal(liberation({ ...p, health: 750 }), 0.25);
  assert.equal(liberation({ ...p, regions: [regions[0]] }), 0);
  assert.equal(liberation({ ...p, regions: [{ id: 3, health: null, maxHealth: 100, isAvailable: false }] }), 0); // locked region
  assert.equal(regen({ ...p, regions: [] }), 3.6);
  assert.equal(regen({ ...p, event: { health: 1, maxHealth: 2 } }), 0);
});

test("timeLeft formats remaining time", () => {
  const now = Date.parse("2026-01-01T00:00:00Z");
  assert.equal(timeLeft("2026-01-02T03:04:00Z", now), "1d 3h 4m");
  assert.equal(timeLeft("2026-01-01T00:05:09Z", now), "5m 09s");
  assert.equal(timeLeft("2025-12-31T00:00:00Z", now), "0m 00s");
  assert.equal(timeLeft(undefined, now), "0m 00s");
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

test("steamHtml keeps known BBCode and nothing executable", () => {
  assert.equal(
    steamHtml("[h2][b]Fixes[/b][/h2][list][*][p]\\[PC] Fixed a crash[/p][/*][/list][p]\n[/p]"),
    "<h3><strong>Fixes</strong></h3><ul><li><p>&#91;PC] Fixed a crash</p></li></ul>",
  );
  assert.equal(steamHtml('[url="https://a.example/?x=1&y=2"]Store[/url]'), '<a href="https://a.example/?x=1&#38;y=2">Store</a>');
  assert.equal(steamHtml("[url=javascript:alert(1)]x[/url]"), "x");
  assert.equal(steamHtml('[url=https://a.example/" onclick="x]y[/url]'), '<a href="https://a.example/&#34; onclick=&#34;x">y</a>');
  assert.equal(
    steamHtml("<script>x</script>[img src=x][/img][previewyoutube=abc;full][/previewyoutube][spoiler]s[/spoiler]"),
    "&#60;script&#62;x&#60;/script&#62;s",
  );
});

test("record sums kills per planet and splits them for the war", () => {
  const s = { terminidKills: 1000, automatonKills: 500, illuminateKills: 0, missionSuccessRate: 88, missionTime: 31_557_600 };
  assert.match(record(s), /Enemies killed<\/dt><dd><span title="1,500">1\.5K/);
  assert.match(record(s, true), /Automatons destroyed/);
  assert.match(record(s), /88%.*1 year</);
});
