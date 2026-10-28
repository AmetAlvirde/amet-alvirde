// Offline tests for scripts/contract-check.mjs. No dependencies; Node 24+.
//
// Two local HTTP servers stand in for the site and for a foreign origin. Each
// test sets the site's mode, runs the check as a child process, and asserts
// its exit code and output.
//
// Usage: pnpm test:contract   (node --test scripts/contract-check.test.mjs)

import { execFile } from "node:child_process";
import http from "node:http";
import path from "node:path";
import { after, before, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";

const SCRIPT = path.join(import.meta.dirname, "contract-check.mjs");
const P = "/writing/noema";
const SECRET = "test-bypass-secret";

let mode = "clean";
let foreignSeen = []; // { url, headers } per request the foreign server got
let siteSeen = [];
let siteServer;
let foreignServer;
let SITE;
let FOREIGN;
let fixture;
let tmp;

const page = (p, extra = "") =>
  `<!doctype html><html><head><link rel="canonical" href="https://www.ametalvirde.com${p}">${extra}</head><body>hi</body></html>`;

function siteHandler(req, res) {
  siteSeen.push({ url: req.url, headers: req.headers });
  const u = req.url;
  const h = { "content-type": "text/html" };
  if (mode === "noindex") h["x-robots-tag"] = "noindex";
  const redir = (loc) => {
    res.writeHead(308, { location: loc });
    res.end();
  };
  const foreignBase = `http://127.0.0.1:${FOREIGN}`;
  if (u === P) return redir(`${P}/`);
  if (u === `${P}/`) {
    const extra =
      mode === "foreign-link"
        ? `<a href="${foreignBase}${P}/a">x</a>`
        : mode === "offsite-link"
          ? `<script src="https://cdn.jsdelivr.net/npm/x@1/x.js"></script>`
          : "";
    res.writeHead(200, h);
    return res.end(page(`${P}/`, extra));
  }
  if (u === `${P}/a`) {
    res.writeHead(200, h);
    return res.end(page(`${P}/a`));
  }
  if (u === `${P}/a/`)
    return redir(
      mode === "foreign-redirect" ? `${foreignBase}${P}/a` : `${P}/a`,
    );
  if (u === `${P}/index` || u === `${P}/index.html`) return redir(`${P}/`);
  res.writeHead(404);
  res.end();
}

function foreignHandler(req, res) {
  foreignSeen.push({ url: req.url, headers: req.headers });
  res.writeHead(200, { "content-type": "text/html" });
  res.end(page(`${P}/a`));
}

const listen = (handler) =>
  new Promise((resolve) => {
    const s = http.createServer(handler);
    s.listen(0, "127.0.0.1", () => resolve(s));
  });

before(async () => {
  siteServer = await listen(siteHandler);
  foreignServer = await listen(foreignHandler);
  SITE = siteServer.address().port;
  FOREIGN = foreignServer.address().port;
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "contract-check-"));
  fixture = path.join(tmp, "fx.json");
  fs.writeFileSync(
    fixture,
    JSON.stringify({ notes: ["a"], folders: [], tags: [], aliases: [] }),
  );
});

after(() => {
  siteServer.close();
  foreignServer.close();
  fs.rmSync(tmp, { recursive: true, force: true });
});

beforeEach(() => {
  mode = "clean";
  foreignSeen = [];
  siteSeen = [];
});

// Runs the check against the local site. Resolves { code, out } and never
// rejects on a non-zero exit.
function run(extra = [], env = {}) {
  const argv = [
    SCRIPT,
    "--site",
    `http://127.0.0.1:${SITE}`,
    "--prefix",
    "writing/noema",
    "--fixture",
    fixture,
    "--delay-ms",
    "0",
    ...extra,
  ];
  const childEnv = { ...process.env, ...env };
  if (!("VERCEL_AUTOMATION_BYPASS_SECRET" in env))
    delete childEnv.VERCEL_AUTOMATION_BYPASS_SECRET;
  return new Promise((resolve) => {
    execFile(process.execPath, argv, { env: childEnv }, (err, stdout, stderr) =>
      resolve({ code: err ? err.code : 0, out: stdout + stderr }),
    );
  });
}

test("baseline: a clean site passes", async () => {
  const { code, out } = await run();
  assert.equal(code, 0, out);
});

// Finding 1: the origin host is never checked.
test("--origin-host fails a page that links the origin host", async () => {
  mode = "foreign-link";
  const { code, out } = await run(["--origin-host", `127.0.0.1:${FOREIGN}`]);
  assert.equal(code, 1, out);
  assert.match(out, new RegExp(`origin host 127\\.0\\.0\\.1:${FOREIGN}`));
});

test("--origin-host fails a Location that carries the origin host", async () => {
  mode = "foreign-redirect";
  const { code, out } = await run(["--origin-host", `127.0.0.1:${FOREIGN}`]);
  assert.equal(code, 1, out);
  assert.match(out, /Location .*origin host/);
});

test("without --origin-host an off-site link is skipped as before", async () => {
  mode = "foreign-link";
  const { code, out } = await run();
  assert.equal(code, 0, out);
  assert.equal(foreignSeen.length, 0);
});

test("--origin-host still skips legitimate off-site references", async () => {
  mode = "offsite-link";
  const { code, out } = await run(["--origin-host", `127.0.0.1:${FOREIGN}`]);
  assert.equal(code, 0, out);
});

// Finding 2: the noindex waiver works where it must not.
test("--allow-platform-noindex with --origin-direct is a usage error", async () => {
  mode = "noindex";
  const { code, out } = await run([
    "--allow-platform-noindex",
    "--origin-direct",
  ]);
  assert.equal(code, 2, out);
  assert.match(out, /--allow-platform-noindex/);
  assert.equal(siteSeen.length, 0);
});

test("--allow-platform-noindex against the canonical origin is a usage error", async () => {
  mode = "noindex";
  const { code, out } = await run([
    "--allow-platform-noindex",
    "--canonical",
    `http://127.0.0.1:${SITE}`,
  ]);
  assert.equal(code, 2, out);
  assert.match(out, /--allow-platform-noindex/);
  assert.equal(siteSeen.length, 0);
});

test("--allow-platform-noindex still waives on a non-canonical site host", async () => {
  mode = "noindex";
  const { code, out } = await run(["--allow-platform-noindex"]);
  assert.equal(code, 0, out);
  assert.match(out, /platform noindex WAIVED/);
});

// Finding 3: the bypass secret leaks off-site.
test("the bypass header never reaches a foreign origin", async () => {
  mode = "foreign-redirect";
  const { out } = await run([], { VERCEL_AUTOMATION_BYPASS_SECRET: SECRET });
  assert.ok(foreignSeen.length > 0, `foreign server got no request\n${out}`);
  for (const r of foreignSeen)
    assert.equal(r.headers["x-vercel-protection-bypass"], undefined, r.url);
  assert.ok(
    siteSeen.every((r) => r.headers["x-vercel-protection-bypass"] === SECRET),
    "site requests must still carry the bypass header",
  );
});

// Finding 4: a non-numeric option disables its guard.
for (const [flag, value] of [
  ["--delay-ms", "abc"],
  ["--delay-ms", "-1"],
  ["--max-hops", "abc"],
  ["--max-hops", "0"],
  ["--max-hops", "1.5"],
  ["--max-requests", "abc"],
  ["--max-requests", "0"],
  ["--max-requests", "Infinity"],
]) {
  test(`${flag} ${value} is a usage error`, async () => {
    const { code, out } = await run([flag, value]);
    assert.equal(code, 2, out);
    assert.match(out, new RegExp(flag));
    assert.equal(siteSeen.length, 0);
  });
}
