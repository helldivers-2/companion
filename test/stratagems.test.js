import test from "node:test";
import assert from "node:assert/strict";
import { normalise } from "../scripts/stratagems.js";
import { safeSvg } from "../scripts/wiki.js";

const arrows = (...a) => `<div class=stratcode-parent>${a.map((d) => `<span class="stratcode">[[File:Stratagem Arrow ${d}.svg|link=]]</span>`).join("")}</div>`;
const row = (o) => ({ title: "", image: "", "permit type": "", "unlock level": "", "unlock cost": "", source: "", "stratagem code": arrows("Up", "Down"), "stratagem type": "", "base cooldown": "", ...o });

test("normalise reads the wiki's markup", () => {
  const [a, b] = normalise([
    row({ title: "Warbond Gun", "permit type": "Supply", "stratagem type": "Support Weapon", "base cooldown": "480s", "stratagem code": arrows("Down", "Left"), "unlock cost": '<span>[[File:Medal.svg|link=Medal|alt=]] 110</span> [[Medal]]s', source: '[[Urban Legends Premium Warbond#Page 2|Urban Legends]] <small><span title="Page 2">P2</span></small>' }),
    row({ title: "Eagle Airstrike", "permit type": "Offense", "stratagem type": "Eagle", image: " Eagle Airstrike Stratagem Icon.svg ", "base cooldown": "15s", "unlock level": "5", "unlock cost": "[[Requisition Slips]] 4,000", source: "Hanger" }),
  ], { "EAGLE AIRSTRIKE": { cooldown: 15, uses: 2 } });
  assert.deepEqual(a, { name: "Eagle Airstrike", image: "Eagle Airstrike Stratagem Icon.svg", category: "offensive", kind: "eagle", code: ["up", "down"], cooldown: 15, uses: 2, level: 5, cost: { currency: "slips", amount: 4000 }, source: { name: "Hangar", page: null } });
  assert.deepEqual(b, { name: "Warbond Gun", image: null, category: "supply", kind: "supportWeapon", code: ["down", "left"], cooldown: 480, uses: null, level: null, cost: { currency: "medals", amount: 110 }, source: { name: "Urban Legends", page: 2 } });
});

test("normalise merges duplicates, drops rows without a code and distrusts stale use counts", () => {
  const items = normalise([
    row({ title: "Flag" }),
    row({ title: "Flag", "stratagem type": "Objective", "base cooldown": "N/A" }),
    row({ title: "Broken", "stratagem code": "" }),
    row({ title: "Old Gun", "base cooldown": "480s" }),
  ], { "OLD GUN": { cooldown: 600, uses: 1 } });
  assert.deepEqual(items.map((i) => [i.name, i.kind, i.category, i.cooldown, i.uses]), [["Flag", "objective", "mission", null, null], ["Old Gun", null, "mission", 480, null]]);
});

test("safeSvg lets plain drawings through and nothing that could run or load", () => {
  assert.ok(safeSvg('<?xml version="1.0"?>\n<svg viewBox="0 0 2 2"><clipPath id="a"/><g clip-path="url(#a)"><use href="#a"/></g></svg>'));
  assert.ok(safeSvg('<?xml version="1.0"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "x.dtd">\n<!-- CorelDRAW -->\n<svg></svg>'));
  for (const bad of [
    '<!DOCTYPE svg [<!ENTITY x "y">]><svg></svg>',
    "<html><svg></svg></html>",
    "<svg><script>alert(1)</script></svg>",
    '<svg onload="alert(1)"></svg>',
    '<svg><a href="javascript:alert(1)"/></svg>',
    '<svg><image href="https://x.test/a.png"/></svg>',
    '<svg><rect style="fill:url(https://x.test/a)"/></svg>',
    "<svg><foreignObject/></svg>",
  ]) assert.equal(safeSvg(bad), false, bad);
});

test("the planet page names images the way the refresh script does", async () => {
  const { key } = await import("../scripts/wiki.js");
  const { planetKey } = await import("../src/js/pages/planets.js");
  for (const name of ["WIDOW'S HARBOR", "Widow's Harbor", "Hydrofall Prime", "Ubanea", "Ḩellmire"]) assert.equal(planetKey(name), key(name));
});

test("imageType trusts the bytes, not the name", async () => {
  const { imageType } = await import("../scripts/wiki.js");
  assert.equal(imageType(Buffer.from("RIFF\0\0\0\0WEBPVP8 ", "latin1")), "webp");
  assert.equal(imageType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0])), "png");
  assert.equal(imageType(Buffer.from("<svg></svg>")), "svg");
  assert.equal(imageType(Buffer.from("<!doctype html><html>")), null);
});
