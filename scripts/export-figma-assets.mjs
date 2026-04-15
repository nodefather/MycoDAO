/**
 * Export raster previews for Figma nodes (components + explicit export settings).
 * Requires FIGMA_ACCESS_TOKEN (Personal access token) with access to the file.
 * https://www.figma.com/developers/api#access-tokens
 *
 * Usage:
 *   FIGMA_ACCESS_TOKEN=xxx node scripts/export-figma-assets.mjs
 *   node scripts/export-figma-assets.mjs --max-nodes=200
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "assets", "figma", "exports");

const FILE_KEY = "zSDD4EXpcwwS4qWWqmuYA1";
const FIGMA_API = "https://api.figma.com/v1";

function loadEnvFiles() {
  for (const name of [".env.local", ".env"]) {
    const p = path.join(ROOT, name);
    if (!fs.existsSync(p)) continue;
    const text = fs.readFileSync(p, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  let maxNodes = 400;
  let format = "png";
  let scale = 2;
  let delayMs = 3500;
  for (const a of args) {
    if (a.startsWith("--max-nodes=")) maxNodes = parseInt(a.split("=")[1], 10) || maxNodes;
    if (a.startsWith("--format=")) format = a.split("=")[1] || format;
    if (a.startsWith("--scale=")) scale = parseFloat(a.split("=")[1]) || scale;
    if (a.startsWith("--delay-ms=")) delayMs = parseInt(a.split("=")[1], 10) || delayMs;
  }
  return { maxNodes, format, scale, delayMs };
}

function walk(node, acc, seen) {
  if (!node?.id) return;
  if (node.exportSettings?.length && !seen.has(node.id)) {
    seen.add(node.id);
    acc.push({ id: node.id, name: node.name || "export", source: "exportSettings" });
  }
  if (
    (node.type === "COMPONENT" || node.type === "COMPONENT_SET") &&
    !seen.has(node.id)
  ) {
    seen.add(node.id);
    acc.push({ id: node.id, name: node.name || node.type, source: node.type });
  }
  if (node.children) {
    for (const child of node.children) {
      walk(child, acc, seen);
    }
  }
}

function safeFilename(name, id) {
  const base = `${name}_${id.replace(/:/g, "-")}`
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 120);
  return base || `node-${id.replace(/:/g, "-")}`;
}

async function figmaFetch(token, url, attempt = 0) {
  const res = await fetch(url, {
    headers: { "X-Figma-Token": token },
  });
  if (res.status === 429 && attempt < 15) {
    const ra = res.headers.get("Retry-After");
    let waitMs = Math.min(60000, Math.round(2500 * Math.pow(1.6, attempt)));
    if (ra) {
      const sec = parseInt(ra, 10);
      // Retry-After is seconds; ignore absurd values (mis-parsed dates, etc.)
      if (!Number.isNaN(sec) && sec > 0 && sec <= 300) waitMs = sec * 1000;
    }
    console.warn(`Rate limited; waiting ${Math.round(waitMs / 1000)}s then retry (${attempt + 1}/15)...`);
    await new Promise((r) => setTimeout(r, waitMs));
    return figmaFetch(token, url, attempt + 1);
  }
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Figma ${res.status}: ${t.slice(0, 500)}`);
  }
  return res.json();
}

/** Request render URLs; on timeout/400 split batch or lower scale. */
async function fetchImageUrlsRecursive(token, items, format, scale) {
  if (items.length === 0) return {};

  const tryOnce = async (slice, sc) => {
    const u = new URL(`${FIGMA_API}/images/${FILE_KEY}`);
    u.searchParams.set("ids", slice.map((b) => b.id).join(","));
    u.searchParams.set("format", format);
    u.searchParams.set("scale", String(sc));
    const imgJson = await figmaFetch(token, u.toString());
    if (imgJson.err) throw new Error(String(imgJson.err));
    return imgJson.images || {};
  };

  try {
    return await tryOnce(items, scale);
  } catch (e) {
    const msg = String(e);
    const isTimeout =
      msg.includes("400") ||
      msg.includes("timeout") ||
      msg.includes("Render timeout") ||
      msg.includes("fewer");
    if (!isTimeout) throw e;

    if (items.length === 1) {
      if (scale > 1) {
        console.warn(`Retry ${items[0].id} at scale=1`);
        return await tryOnce(items, 1);
      }
      console.warn(`Skip (still failing): ${items[0].id} ${items[0].name}`);
      return {};
    }

    const mid = Math.floor(items.length / 2);
    const a = await fetchImageUrlsRecursive(token, items.slice(0, mid), format, scale);
    await new Promise((r) => setTimeout(r, 400));
    const b = await fetchImageUrlsRecursive(token, items.slice(mid), format, scale);
    return { ...a, ...b };
  }
}

async function main() {
  loadEnvFiles();
  const token =
    process.env.FIGMA_ACCESS_TOKEN ||
    process.env.FIGMA_PERSONAL_ACCESS_TOKEN ||
    process.env.FIGMA_TOKEN;
  const { maxNodes, format, scale, delayMs } = parseArgs();

  if (!token) {
    console.error(`
Missing Figma token. Create a Personal access token at:
  https://www.figma.com/settings

Then add to MYCODAO/.env.local (gitignored):
  FIGMA_ACCESS_TOKEN=figd_xxxxxxxx

Or set the env var for one run:
  $env:FIGMA_ACCESS_TOKEN="figd_..."; node scripts/export-figma-assets.mjs
`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Fetching Figma file ${FILE_KEY} ...`);
  const fileJson = await figmaFetch(token, `${FIGMA_API}/files/${FILE_KEY}`);

  const acc = [];
  const seen = new Set();
  const doc = fileJson.document;
  if (doc?.children) {
    for (const canvas of doc.children) {
      walk(canvas, acc, seen);
    }
  }

  console.log(`Found ${acc.length} nodes (exports + components). Capping at ${maxNodes}.`);
  const list = acc.slice(0, maxNodes);

  console.log(`Waiting 8s before image API (rate limits)...`);
  await new Promise((r) => setTimeout(r, 8000));

  const manifest = {
    fileName: fileJson.name,
    lastModified: fileJson.lastModified,
    fileKey: FILE_KEY,
    exportedAt: new Date().toISOString(),
    count: list.length,
    capped: acc.length > maxNodes,
    totalFound: acc.length,
    items: [],
  };

  // One node per images API call — Figma rate-limits batched renders heavily.
  const batchSize = 1;
  for (let i = 0; i < list.length; i += batchSize) {
    const batch = list.slice(i, i + batchSize);
    const images = await fetchImageUrlsRecursive(token, batch, format, scale);
    for (const item of batch) {
      const fname = `${safeFilename(item.name, item.id)}.${format}`;
      const dest = path.join(OUT_DIR, fname);
      if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
        manifest.items.push({
          id: item.id,
          name: item.name,
          source: item.source,
          file: `assets/figma/exports/${fname}`,
          ok: true,
          skipped: true,
        });
        console.log("Skip existing", fname);
        continue;
      }
      const href = images[item.id];
      if (!href) {
        manifest.items.push({ id: item.id, name: item.name, ok: false, reason: "no_render_url" });
        continue;
      }
      const bin = await fetch(href);
      if (!bin.ok) {
        manifest.items.push({ id: item.id, name: item.name, ok: false, reason: `download_${bin.status}` });
        continue;
      }
      const buf = Buffer.from(await bin.arrayBuffer());
      fs.writeFileSync(dest, buf);
      manifest.items.push({
        id: item.id,
        name: item.name,
        source: item.source,
        file: `assets/figma/exports/${fname}`,
        ok: true,
      });
      console.log("Wrote", fname);
    }
    fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
    await new Promise((r) => setTimeout(r, delayMs));
  }

  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  console.log(`\nDone. Output: ${OUT_DIR}`);
  console.log(`Manifest: public/assets/figma/exports/manifest.json`);
  if (acc.length > maxNodes) {
    console.log(`Note: ${acc.length - maxNodes} nodes were skipped. Re-run with --max-nodes=${acc.length} to export more.`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
