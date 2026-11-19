// Everything the refresh scripts ask of the Helldivers Wiki (https://helldivers.wiki.gg) goes through here, so the
// wiki sees one polite client: one request at a time, a pause between them, `maxlag`, and a back-off when it asks.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import site from "../src/_data/site.json" with { type: "json" };

const API = "https://helldivers.wiki.gg/api.php";
const HEADERS = { "User-Agent": `${site.client} (${site.contact})` };
const PAUSE = 500; // ms between two requests
// Licences under which a file may be shown here; ND, all-rights-reserved, fair use and unlicensed files stay out.
const LICENCES = ["Arrowhead", "Arrowhead Studios", "CC-BY", "CC-BY-SA", "CC-BY-NC", "CC-BY-NC-SA", "CC0", "CC-PD"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let queue = Promise.resolve();

// Queued, so callers may use Promise.all and the wiki still gets one request at a time.
function wikiFetch(url, headers = {}) {
  const run = queue.then(async () => {
    for (let tries = 3; ; tries--) {
      const res = await fetch(url, { headers: { ...HEADERS, ...headers } });
      await sleep(PAUSE);
      if ((res.status === 429 || res.status === 503) && tries > 1) {
        await sleep((Number(res.headers.get("retry-after")) || 30) * 1000);
        continue;
      }
      if (!res.ok) throw new Error(`${res.status} for ${url}`);
      return res;
    }
  });
  queue = run.catch(() => {});
  return run;
}

export async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", formatversion: "2", maxlag: "5", ...params })}`;
  for (let tries = 3; ; tries--) {
    const res = await wikiFetch(url);
    const json = await res.json();
    if (json.error?.code === "maxlag" && tries > 1) {
      await sleep((Number(res.headers.get("retry-after")) || 5) * 1000);
      continue;
    }
    if (json.error) throw new Error(json.error.info);
    return json;
  }
}

// One Cargo table as plain row objects.
export async function cargo(tables, fields) {
  const rows = (await api({ action: "cargoquery", limit: "500", tables, fields })).cargoquery;
  if (!rows?.length) throw new Error(`${tables}: no rows`);
  if (rows.length >= 500) throw new Error(`${tables}: hit the 500-row limit, paginate`);
  return rows.map((r) => r.title);
}

// The images are served from our own origin, where opening one directly runs no CSP, so only plain drawings pass.
export const safeSvg = (svg) =>
  /^\s*(<\?xml[^>]*>\s*)?(<!DOCTYPE[^>[]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(svg) &&
  !/<script|<foreignObject|<!ENTITY|@import|javascript:|\son\w+\s*=|href\s*=\s*(?!["']?#)|url\(\s*(?!["']?#)/i.test(svg);

// The file type from the bytes themselves, so a page that reached us instead of an image is never saved as one.
export function imageType(buf) {
  if (buf.toString("latin1", 0, 4) === "RIFF" && buf.toString("latin1", 8, 12) === "WEBP") return "webp";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (safeSvg(buf.toString("utf8"))) return "svg";
  return null;
}

// wiki.gg sends PNG whenever its cache holds no WebP; cwebp (`brew install webp`) turns those into WebP at a sixth of the size.
// Without cwebp the PNGs stay and the next run with it converts them.
function toWebp(root, entries) {
  const pngs = entries.filter((o) => o.file.endsWith(".png"));
  if (!pngs.length) return;
  try {
    execFileSync("cwebp", ["-version"], { stdio: "ignore" });
  } catch {
    console.warn(`  cwebp not found, ${pngs.length} PNGs kept`);
    return;
  }
  for (const o of pngs) {
    const webp = o.file.replace(/\.png$/, ".webp");
    execFileSync("cwebp", ["-quiet", "-q", "85", fileURLToPath(new URL(o.file, root)), "-o", fileURLToPath(new URL(webp, root))]);
    o.file = webp; // the PNG is no longer listed, so the clean-up below deletes it
  }
}

export const key = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const norm = (name) => name.trim().replace(/_/g, " ");

// Mirrors wiki files into src/img/<dir>/: SVGs as they are, everything else as a WebP thumbnail `width` px wide.
// src/img/<dir>/sources.json records each file's wiki name, uploader, licence and hash; a file whose hash has not
// changed since the last run is not downloaded again. Nothing is written until every download has worked.
// Returns a lookup from wiki file name to { file, user, licence }, and the sorted uploaders.
export async function syncImages(names, dir, width) {
  const root = new URL(`../src/img/${dir}/`, import.meta.url);
  const manifest = new URL("sources.json", root);
  const old = existsSync(manifest) ? JSON.parse(readFileSync(manifest, "utf8")) : {};
  const wanted = [...new Set(names.filter(Boolean).map(norm))];
  const out = {},
    todo = new Map();
  for (let i = 0; i < wanted.length; i += 50) {
    // the API takes 50 titles per query
    const json = await api({
      action: "query",
      prop: "imageinfo|templates",
      iiprop: "url|sha1|user|mime",
      iiurlwidth: String(width),
      tlnamespace: "10",
      tllimit: "max",
      titles: wanted
        .slice(i, i + 50)
        .map((n) => `File:${n}`)
        .join("|"),
    });
    if (json.continue) throw new Error("The template list was cut off; lower the batch size"); // else licences would be missing
    for (const p of json.query.pages) {
      const name = p.title.replace(/^File:/, ""),
        info = p.imageinfo?.[0];
      if (!info) {
        console.warn(`  not on the wiki: ${p.title}`);
        continue;
      }
      const licence = p.templates?.map((t) => t.title.replace("Template:License/", "")).find((l) => LICENCES.includes(l));
      if (!licence) {
        console.warn(`  no reusable licence: ${p.title}`);
        continue;
      }
      const svg = info.mime === "image/svg+xml",
        base = key(name.replace(/\.\w+$/, "")),
        prev = old[name];
      out[name] = { file: prev?.file, user: info.user, licence, sha1: info.sha1, width: svg ? null : width };
      const fresh = prev?.sha1 === info.sha1 && prev.width === out[name].width && prev.file?.startsWith(`${base}.`) && existsSync(new URL(prev.file, root));
      if (!fresh) todo.set(name, { url: svg ? info.url : info.thumburl, base });
    }
  }
  const files = new Map();
  for (const [name, { url, base }] of todo) {
    const res = await wikiFetch(url, { Accept: "image/webp,image/png;q=0.9,image/svg+xml;q=0.8" }); // wiki.gg sends WebP only when its cache has one
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = imageType(buf);
    if (ext) {
      out[name].file = `${base}.${ext}`;
      files.set(name, buf);
    } else {
      console.warn(`  unexpected content, skipped: ${name}`);
      delete out[name];
    }
  }
  mkdirSync(root, { recursive: true });
  for (const [name, buf] of files) writeFileSync(new URL(out[name].file, root), buf);
  toWebp(root, Object.values(out));
  const keep = new Set([...Object.values(out).map((o) => o.file), "sources.json"]);
  for (const f of readdirSync(root)) if (!keep.has(f)) unlinkSync(new URL(f, root));
  writeFileSync(manifest, `${JSON.stringify(out, null, 1)}\n`);
  console.log(`${dir}: ${Object.keys(out).length} images, ${files.size} downloaded`);
  return {
    get: (name) => (name ? out[norm(name)] : undefined),
    artists: [...new Set(Object.values(out).map((o) => o.user))].sort((a, b) => a.localeCompare(b, "en")),
  };
}
