import test from "node:test";
import assert from "node:assert/strict";
import { fetchedAt, get, state } from "../src/js/api.js";
import { memory } from "./helpers.js";

// Fake clock plus a fetch that answers after `latency` ms with the queued responses.
function setup(t, responses, latency = 500) {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"] });
  globalThis.localStorage = memory();
  const calls = [];
  t.mock.method(globalThis, "fetch", () => {
    calls.push(Date.now());
    const r = responses.shift();
    return new Promise((ok, fail) => setTimeout(() => (r instanceof Error ? fail(r) : ok(r)), latency));
  });
  const settle = async (p, ms) => {
    t.mock.timers.tick(ms);
    return p;
  };
  return { calls, settle };
}
const json = (data, status = 200) => new Response(JSON.stringify(data), { status });

test("the refresh tick one TTL later fetches fresh data despite a slow response", async (t) => {
  const { calls, settle } = setup(t, [json(1), json(2)]);
  assert.equal(await settle(get("/x", 60), 500), 1);
  t.mock.timers.tick(59_500); // main.js ticks every TTL, measured from when the first request started
  assert.equal(await settle(get("/x", 60), 500), 2);
  assert.equal(calls.length, 2);
});

test("a refresh tick that runs a few ms early relative to the last one still fetches", async (t) => {
  const { calls, settle } = setup(t, [json(1), json(2)]);
  t.mock.timers.tick(4); // the previous tick fired late
  assert.equal(await settle(get("/x", 60), 500), 1);
  t.mock.timers.tick(59_497); // this one fires on schedule
  assert.equal(await settle(get("/x", 60), 500), 2);
  assert.equal(calls.length, 2);
});

test("within the TTL the cache answers, after it a failed fetch falls back to stale data", async (t) => {
  const { calls, settle } = setup(t, [json(1), new Error("offline")]);
  state.stale = false;
  await settle(get("/x", 60), 500);
  t.mock.timers.tick(30_000);
  assert.equal(await get("/x", 60), 1);
  assert.equal(calls.length, 1);
  t.mock.timers.tick(30_000);
  assert.equal(await settle(get("/x", 60), 500), 1);
  assert.equal(state.stale, true);
  assert.equal(fetchedAt["/x"], 0); // the stale answer keeps its original fetch time
});

test("without a cache a failed fetch rejects", async (t) => {
  const { settle } = setup(t, [json(null, 503)]);
  await assert.rejects(settle(get("/x"), 500), /API returned 503/);
});

test("a 429 waits out the 10 s window and retries once", async (t) => {
  const { calls, settle } = setup(t, [json(null, 429), json(1)]);
  const flush = () => new Promise(setImmediate); // let get() reach its next timer
  const p = get("/x");
  t.mock.timers.tick(500);
  await flush();
  t.mock.timers.tick(9_999);
  await flush();
  assert.equal(calls.length, 1);
  t.mock.timers.tick(1);
  await flush();
  assert.equal(await settle(p, 500), 1);
  assert.deepEqual(calls, [0, 10_500]);
});

test("cacheOnly answers from a cache of any age and never fetches", async (t) => {
  const { calls, settle } = setup(t, [json(1)]);
  await settle(get("/x", 60), 500);
  t.mock.timers.tick(3_600_000);
  state.cacheOnly = true;
  try {
    assert.equal(await get("/x", 60), 1);
    await assert.rejects(get("/y"), /not cached/);
  } finally {
    state.cacheOnly = false;
  }
  assert.equal(calls.length, 1);
});
