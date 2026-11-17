import { test } from "node:test";
import assert from "node:assert/strict";
import { margins } from "../src/js/drops.js";

test("pods only land in margins wide enough, inset from both edges", () => {
  assert.deepEqual(margins(1600, 192, 1408), [[24, 168], [1432, 1576]]);
  assert.deepEqual(margins(1300, 42, 1258), []);
});
