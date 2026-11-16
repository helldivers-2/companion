import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import worker, { LANGS } from "../worker.js";

const env = { API_ORIGIN: "https://origin.test", ACCESS_CLIENT_ID: "id", ACCESS_CLIENT_SECRET: "secret" };
const ctx = { waitUntil() {} };
const call = (path, init) => worker.fetch(new Request(`https://site.test${path}`, init), env, ctx);

function upstream(t, status = 200) {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, init) => {
    calls.push({ url, init });
    return new Response(status === 200 ? '{"ok":1}' : null, { status });
  });
  return calls;
}

test("forwards a known path with the Access token and the language", async (t) => {
  const calls = upstream(t);
  const res = await call("/api/v1/war?lang=de-DE&x=1");
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: 1 });
  assert.equal(calls[0].url, "https://origin.test/api/v1/war");
  assert.equal(calls[0].init.headers["CF-Access-Client-Secret"], "secret");
  assert.equal(calls[0].init.headers["Accept-Language"], "de-DE");
  assert.equal(calls[0].init.redirect, "manual");
});

test("refuses unknown paths, languages and methods without touching the origin", async (t) => {
  const calls = upstream(t);
  for (const [path, init] of [["/api/v1/war?lang=xx"], ["/api/v1/war"], ["/metrics?lang=en-US"], ["/api/v1/war?lang=en-US", { method: "POST" }]]) {
    assert.equal((await call(path, init)).status, 404, path);
  }
  assert.equal(calls.length, 0);
});

test("an origin error or Access redirect becomes a 502", async (t) => {
  for (const status of [302, 403, 530]) {
    upstream(t, status);
    assert.equal((await call("/api/v1/war?lang=en-US")).status, 502);
  }
});

test("every site locale asks for a language the Worker allows", () => {
  for (const f of readdirSync("src/_data/i18n")) {
    assert.ok(LANGS.has(JSON.parse(readFileSync(`src/_data/i18n/${f}`)).api), f);
  }
});
