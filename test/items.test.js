import test from "node:test";
import assert from "node:assert/strict";
import { cost, normalise, plain, source } from "../scripts/items.js";
import data from "../src/_data/items.json" with { type: "json" };

const credits = '<span class="Currencyicons"><span style="white-space:nowrap">[[File:Super Credit.svg|link=Super Credits|alt=]] 1,250</span></span>';
const medals = '<span class="Medalicon">[[File:Medal.svg|link=Medal|alt=]]</span> 45 [[Medal]]s';

test("plain strips wiki markup and keeps the line breaks of a cell", () => {
  assert.equal(plain("[[Damage|<span>70 Ballistic</span>]]&nbsp;(4mm)<br>450 (10g)<hr>"), "70 Ballistic (4mm) / 450 (10g)");
  assert.equal(plain("[[Standard_Issue]]"), "Standard Issue");
});

test("source tells warbonds, the Superstore and everything else apart", () => {
  assert.deepEqual(source('[[Cutting Edge Premium Warbond#Page 3|Cutting Edge]] <small><span class="explain " title="Page 3">P3</span></small>'), {
    kind: "warbond",
    name: "Cutting Edge",
    page: 3,
  });
  assert.equal(source('[[Ironclad Democracy Premium Warbond|Ironclad Democracy]]<small><span title="Page 2">P2</span></small>').name, "Ironclad Democracy");
  assert.deepEqual(source("[[Superstore]]"), { kind: "superstore" });
  assert.deepEqual(source("Engineering Bay"), { kind: "other", name: "Engineering Bay" });
  assert.equal(source(""), null);
});

test("cost reads the currency from the icon and ignores dollar prices", () => {
  assert.deepEqual(cost(credits), { currency: "credits", amount: 1250 });
  assert.deepEqual(cost(medals), { currency: "medals", amount: 45 });
  assert.equal(cost('<span title="USD">💲</span>20'), null);
  assert.equal(cost(""), null);
});

test("normalise sorts rows into categories and merges armour sets into their body row", () => {
  const items = normalise({
    weapons: [
      { title: "B", "weapon category": "Throwables", radius: "7", source: "", cost: "" },
      { title: "A", "weapon category": "Throwables", radius: "4m", source: "", cost: "" },
      { title: "Skip", "weapon category": "Vehicles" },
    ],
    armor: [
      { title: "X", type: "Helmet", passive: "[[Standard_Issue]]" },
      {
        title: "X",
        type: "Light",
        image: undefined,
        armor: "50",
        speed: "550",
        "stam regen": "125",
        passive: "Scout",
        source: "[[Superstore]]",
        cost: credits,
      },
    ],
    boosters: [{ title: "Y", description: "Does <b>y</b>.", source: "", cost: "" }],
    passives: [{ title: "Scout", description: "Sees.<br>Far." }],
  });
  assert.deepEqual(
    items.throwable.map((w) => [w.name, w.radius]),
    [
      ["A", "4m"],
      ["B", "7m"],
    ],
  );
  assert.equal(items.armor.length, 1);
  assert.deepEqual(items.armor[0], {
    name: "X",
    image: null,
    class: "light",
    rating: 50,
    speed: 550,
    stamina: 125,
    passive: "Scout",
    passiveText: "Sees. Far.",
    source: { kind: "superstore" },
    cost: { currency: "credits", amount: 1250 },
  });
  assert.equal(items.booster[0].text, "Does y.");
});

test("the committed data has every category and no leftover markup", () => {
  for (const [k, list] of Object.entries(data.items)) assert.ok(list.length > 10, k);
  assert.doesNotMatch(JSON.stringify(data.items), /\[\[|<\w|&\w+;/);
});
