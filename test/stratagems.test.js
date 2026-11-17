import test from "node:test";
import assert from "node:assert/strict";
import { normalise } from "../scripts/stratagems.js";

const arrows = (...a) => `<div class=stratcode-parent>${a.map((d) => `<span class="stratcode">[[File:Stratagem Arrow ${d}.svg|link=]]</span>`).join("")}</div>`;
const row = (o) => ({ title: "", "permit type": "", "unlock level": "", "unlock cost": "", source: "", "stratagem code": arrows("Up", "Down"), "stratagem type": "", "base cooldown": "", ...o });

test("normalise reads the wiki's markup", () => {
  const [a, b] = normalise([
    row({ title: "Warbond Gun", "permit type": "Supply", "stratagem type": "Support Weapon", "base cooldown": "480s", "stratagem code": arrows("Down", "Left"), "unlock cost": '<span>[[File:Medal.svg|link=Medal|alt=]] 110</span> [[Medal]]s', source: '[[Urban Legends Premium Warbond#Page 2|Urban Legends]] <small><span title="Page 2">P2</span></small>' }),
    row({ title: "Eagle Airstrike", "permit type": "Offense", "stratagem type": "Eagle", "base cooldown": "15s", "unlock level": "5", "unlock cost": "[[Requisition Slips]] 4,000", source: "Hanger" }),
  ], { "EAGLE AIRSTRIKE": { cooldown: 15, uses: 2 } });
  assert.deepEqual(a, { name: "Eagle Airstrike", category: "offensive", kind: "eagle", code: ["up", "down"], cooldown: 15, uses: 2, level: 5, cost: { currency: "slips", amount: 4000 }, source: { name: "Hangar", page: null } });
  assert.deepEqual(b, { name: "Warbond Gun", category: "supply", kind: "supportWeapon", code: ["down", "left"], cooldown: 480, uses: null, level: null, cost: { currency: "medals", amount: 110 }, source: { name: "Urban Legends", page: 2 } });
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
