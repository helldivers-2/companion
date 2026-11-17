import test from "node:test";
import assert from "node:assert/strict";
import { clampView, nearest, project } from "../src/js/pages/map.js";

test("project puts the centre in the middle and flips y", () => {
  assert.deepEqual(project({ x: 0, y: 0 }), [500, 500]);
  const [, top] = project({ x: 0, y: 1 });
  const [left] = project({ x: -1, y: 0 });
  assert.equal(top, 50);
  assert.equal(left, 50);
});

test("clampView limits the zoom and keeps the view on the map", () => {
  assert.deepEqual(clampView({ cx: 0, cy: 2000, k: 1 }), { cx: 500, cy: 500, k: 1 });
  assert.equal(clampView({ cx: 500, cy: 500, k: 99 }).k, 12);
  assert.equal(clampView({ cx: 500, cy: 500, k: 0.1 }).k, 1);
  const v = clampView({ cx: 0, cy: 0, k: 4 });
  assert.deepEqual([v.cx, v.cy], [125, 125]);
});

test("nearest moves to the closest planet in the arrow's direction", () => {
  const a = { index: 0, x: 100, y: 100 };
  const right = { index: 1, x: 200, y: 110 };
  const farRight = { index: 2, x: 400, y: 100 };
  const below = { index: 3, x: 100, y: 180 };
  const all = [a, right, farRight, below];
  assert.equal(nearest(all, a, 1, 0), right);
  assert.equal(nearest(all, right, 1, 0), farRight);
  assert.equal(nearest(all, a, 0, 1), below);
  assert.equal(nearest(all, a, -1, 0), null);
});
