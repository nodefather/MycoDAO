#!/usr/bin/env node
/**
 * Smoke-check MAS / MINDEX / NatureOS reachability for MYCODAO Pulse integration.
 * Usage: node scripts/check-pulse-backends.mjs
 * Loads MYCODAO/.env.local via dotenv if present (optional); else uses process env only.
 */
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envLocal = join(root, ".env.local");
if (existsSync(envLocal)) {
  for (const line of readFileSync(envLocal, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

async function check(name, url) {
  if (!url) {
    console.log(`[skip] ${name}: no URL in env`);
    return;
  }
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 8000);
    const res = await fetch(url, { signal: c.signal });
    clearTimeout(t);
    const ok = res.ok;
    let body = "";
    try {
      body = (await res.text()).slice(0, 120);
    } catch {
      body = "";
    }
    console.log(`${ok ? "OK" : "FAIL"} ${name} ${res.status} ${url}`);
    if (!ok || process.env.VERBOSE) console.log(`   ${body.replace(/\s+/g, " ")}`);
  } catch (e) {
    console.log(`FAIL ${name} ${url} — ${e?.message || e}`);
  }
}

const mas = process.env.MAS_API_URL?.replace(/\/$/, "");
const mindex = process.env.MINDEX_API_URL?.replace(/\/$/, "");
const nature = process.env.NATUREOS_API_URL?.replace(/\/$/, "");

console.log("Pulse backend health (Apr 2026)\n");
await check("MAS", mas ? `${mas}/health` : "");
await check("MINDEX", mindex ? `${mindex}/health` : "");
await check("NatureOS", nature ? `${nature}/health` : nature ? `${nature}/api/health` : "");
