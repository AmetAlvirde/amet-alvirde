// Sub-app mount contract check (spec #34, section 6).
//
// Requests every row of the contract matrix through the SITE host, follows
// redirects by hand, and fails on any deviation. No dependencies; Node 24+.
//
// Usage:
//   pnpm check:contract --site <url> --prefix <path> --fixture <file.json> [options]
//   node scripts/contract-check.mjs ...   (same flags)
//
// Example, noema through a site preview:
//   pnpm check:contract --site https://<preview-host> --prefix writing/noema \
//     --fixture scripts/contract-fixtures/noema.json
//
// The site host is always explicit; there is no default. The pacing default
// (--delay-ms 500) keeps a run under the Vercel firewall threshold.
//
// Options:
//   --site <url>            site base URL, e.g. https://www.ametalvirde.com
//   --prefix <path>         mount prefix without slashes, e.g. writing/noema
//   --fixture <file>        JSON: { notes, folders, tags, aliases } (see below)
//   --canonical <url>       origin every canonical must point at
//                           (default https://www.ametalvirde.com)
//   --origin-host <host>    the app's own deployment host, e.g.
//                           noema-olive-one.vercel.app: any Location, refresh
//                           target, reference or other body text that names it
//                           fails the row. Other off-site references (a CDN)
//                           stay skipped. Always pass it for real runs.
//   --max-hops <n>          redirect cap per request, integer >= 1 (default 5)
//   --delay-ms <n>          pause between requests, >= 0 (default 500, about
//                           2 req/s)
//   --max-requests <n>      abort past this many requests, integer >= 1
//                           (default 300)
//   --json <file>           write every response chain, with headers, to a file
//   --bypass-env <NAME>     env var holding a Vercel protection-bypass secret
//                           (default VERCEL_AUTOMATION_BYPASS_SECRET); when set,
//                           every request to the site origin carries
//                           x-vercel-protection-bypass; off-site requests never do
//   --origin-direct         --site is the app's own origin, not the site: skip
//                           the site-owned row (/P -> /P/); every other row and
//                           cross-row rule runs unchanged
//   --allow-platform-noindex
//                           for protected Vercel preview hosts only, which stamp
//                           X-Robots-Tag: noindex on every response: a noindex
//                           header no longer fails a row, but every row still
//                           reports it, and the summary line and the JSON state
//                           the waiver. The origin's no-noindex obligation is
//                           proven by the origin-direct run (--origin-direct),
//                           which takes no waiver: combining the two, or
//                           pointing --site at the --canonical origin, is a
//                           usage error.
//
// Fixture, paths relative to the prefix:
//   {
//     "notes":   ["cafe-noetico", "ensayos/sobre-el-metodo"],
//     "folders": ["ensayos", "tags"],
//     "tags":    ["metodo"],
//     "tagsPath": "tags",                      // optional, default "tags"
//     "aliases": [{ "path": "nota-vieja", "target": "nota-con-alias" }]
//   }
// An alias may be a bare string when its target should not be pinned.
//
// Exit codes: 0 all rows pass, 1 any failure, 2 usage error or aborted run.

import fs from "node:fs";
import { parseArgs } from "node:util";

const USAGE =
  "usage: scripts/contract-check.mjs --site <url> --prefix <path> --fixture <file.json> [--canonical <url>] [--origin-host host] [--max-hops n] [--delay-ms n] [--max-requests n] [--json file] [--bypass-env NAME] [--origin-direct] [--allow-platform-noindex]";

function die(msg) {
  console.error(msg);
  process.exit(2);
}

let args;
try {
  args = parseArgs({
    options: {
      site: { type: "string" },
      prefix: { type: "string" },
      fixture: { type: "string" },
      canonical: { type: "string", default: "https://www.ametalvirde.com" },
      "origin-host": { type: "string" },
      "max-hops": { type: "string", default: "5" },
      "delay-ms": { type: "string", default: "500" },
      "max-requests": { type: "string", default: "300" },
      json: { type: "string" },
      "bypass-env": {
        type: "string",
        default: "VERCEL_AUTOMATION_BYPASS_SECRET",
      },
      "origin-direct": { type: "boolean", default: false },
      "allow-platform-noindex": { type: "boolean", default: false },
      help: { type: "boolean", short: "h" },
    },
  }).values;
} catch (e) {
  die(`${e.message}\n${USAGE}`);
}
if (args.help) {
  console.log(USAGE);
  process.exit(0);
}
if (!args.site || !args.prefix || !args.fixture) die(USAGE);

const site = new URL(args.site);
const P = "/" + args.prefix.replace(/^\/+|\/+$/g, "");
const canonicalOrigin = new URL(args.canonical).origin;
// A non-numeric value would turn its guard off (NaN compares false), so
// reject it up front.
function count(name, integer) {
  const n = Number(args[name]);
  if (
    !Number.isFinite(n) ||
    n < 0 ||
    (integer && (!Number.isInteger(n) || n < 1))
  )
    die(
      `--${name} must be ${integer ? "an integer >= 1" : "a number >= 0"}, got ${args[name]}\n${USAGE}`,
    );
  return n;
}
const maxHops = count("max-hops", true);
const delayMs = count("delay-ms", false);
const maxRequests = count("max-requests", true);
const bypass = process.env[args["bypass-env"]];
const originDirect = args["origin-direct"];
const allowPlatformNoindex = args["allow-platform-noindex"];
const originHost = args["origin-host"]?.toLowerCase() || null;
if (allowPlatformNoindex && originDirect)
  die(
    `--allow-platform-noindex cannot be combined with --origin-direct: the origin-direct run proves no-noindex and takes no waiver\n${USAGE}`,
  );
if (allowPlatformNoindex && site.origin === canonicalOrigin)
  die(
    `--allow-platform-noindex cannot be used against the canonical origin ${canonicalOrigin}\n${USAGE}`,
  );

let fixture;
try {
  fixture = JSON.parse(fs.readFileSync(args.fixture, "utf8"));
} catch (e) {
  die(`cannot read fixture ${args.fixture}: ${e.message}`);
}
const list = (k) => (Array.isArray(fixture[k]) ? fixture[k] : []);
const tagsPath = (fixture.tagsPath ?? "tags").replace(/^\/+|\/+$/g, "");
const aliases = list("aliases").map((a) =>
  typeof a === "string" ? { path: a } : a,
);

// ---------------------------------------------------------------- requests

let requestCount = 0;
const log = []; // every response, for --json
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function request(url) {
  if (requestCount >= maxRequests) {
    throw new Error(
      `aborted: more than ${maxRequests} requests (raise --max-requests)`,
    );
  }
  if (requestCount > 0) await sleep(delayMs);
  requestCount++;
  const headers = { "user-agent": "contract-check/1" };
  // The secret is for the site only; never hand it to a host a redirect names.
  if (bypass && url.origin === site.origin)
    headers["x-vercel-protection-bypass"] = bypass;
  const res = await fetch(url, { redirect: "manual", headers });
  const body = await res.text();
  const h = Object.fromEntries(res.headers);
  log.push({ url: url.href, status: res.status, headers: h });
  return { url, status: res.status, headers: h, body };
}

// Follow redirects by hand. Returns { hops: [response...], final, error }.
// Loops are detected by revisiting a URL; the hop cap stops anything else.
async function follow(path) {
  let url = new URL(path, site);
  const seen = new Set();
  const hops = [];
  for (;;) {
    if (seen.has(url.href)) {
      return {
        hops,
        final: null,
        error: `redirect loop: revisits ${url.pathname}${url.search}`,
      };
    }
    seen.add(url.href);
    const r = await request(url);
    hops.push(r);
    if (r.status < 300 || r.status >= 400)
      return { hops, final: r, error: null };
    const loc = r.headers.location;
    if (!loc) return { hops, final: r, error: `${r.status} without Location` };
    if (hops.length > maxHops) {
      return { hops, final: null, error: `more than ${maxHops} redirects` };
    }
    url = new URL(loc, url);
  }
}

const describe = ({ hops }) =>
  hops
    .map((r) =>
      r.headers.location
        ? `${r.status} ${r.url.pathname} -> ${r.headers.location}`
        : `${r.status} ${r.url.pathname}`,
    )
    .join(" | ");

// ---------------------------------------------------------------- HTML

const isHtml = (r) => (r.headers["content-type"] ?? "").includes("text/html");
const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
const attr = (tag, name) => {
  const m = tag.match(
    new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  return m ? decode(m[1] ?? m[2] ?? m[3]) : null;
};
const tags = (html, name) =>
  html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) ?? [];

function canonicalOf(html) {
  for (const t of tags(html, "link")) {
    if ((attr(t, "rel") ?? "").toLowerCase().split(/\s+/).includes("canonical"))
      return attr(t, "href");
  }
  return null;
}

function refreshOf(html) {
  for (const t of tags(html, "meta")) {
    if ((attr(t, "http-equiv") ?? "").toLowerCase() !== "refresh") continue;
    const m = (attr(t, "content") ?? "").match(/url\s*=\s*['"]?([^'"]+)/i);
    if (m) return m[1].trim();
  }
  return null;
}

// Every CSS, script, image, link and refresh target, as written in the page.
function rawReferences(r) {
  const out = [];
  for (const t of tags(r.body, "link")) {
    const rel = (attr(t, "rel") ?? "").toLowerCase();
    if (
      rel.includes("canonical") ||
      rel.includes("preconnect") ||
      rel.includes("dns-prefetch")
    )
      continue;
    const href = attr(t, "href");
    if (href) out.push(href);
  }
  for (const t of tags(r.body, "script")) {
    const src = attr(t, "src");
    if (src) out.push(src);
  }
  for (const t of tags(r.body, "img")) {
    const src = attr(t, "src");
    if (src) out.push(src);
  }
  for (const t of tags(r.body, "a")) {
    const href = attr(t, "href");
    if (
      href &&
      !/^(mailto|tel|javascript):/i.test(href) &&
      !href.startsWith("#")
    )
      out.push(href);
  }
  const refresh = refreshOf(r.body);
  if (refresh) out.push(refresh);
  return out;
}

// The same references, resolved against the page, on the site origin only.
function references(r) {
  const urls = [];
  for (const ref of rawReferences(r)) {
    try {
      const u = new URL(ref, r.url);
      u.hash = "";
      if (u.origin === site.origin) urls.push(u);
    } catch {
      // unparseable reference; not ours to judge
    }
  }
  return urls;
}

// ---------------------------------------------------------------- checks

const results = []; // { row, ok, detail, waived, chain }
const pagesToScan = new Map(); // href -> response, every 200 HTML seen
const subresources = new Map(); // href -> referring page path

const namesOriginHost = (s) => s.toLowerCase().includes(originHost);

// The origin's own host must never surface through a response: not in a
// Location, not in a reference, not anywhere in the body text.
function originHostChecks(r, problems) {
  const loc = r.headers.location;
  if (loc && namesOriginHost(loc))
    problems.push(`Location names origin host ${originHost}: ${loc}`);
  if (!r.body || !namesOriginHost(r.body)) return;
  const refs = isHtml(r) ? rawReferences(r).filter(namesOriginHost) : [];
  if (refs.length)
    problems.push(
      `${r.url.pathname} references origin host ${originHost}: ${refs.join(", ")}`,
    );
  else
    problems.push(
      `${r.url.pathname} body text names origin host ${originHost}`,
    );
}

// waived collects findings that --allow-platform-noindex turns from failures
// into reported notes.
function crossChecks(chain, problems, waived) {
  for (const r of chain.hops) {
    const loc = r.headers.location;
    if (loc && (/^[a-z][a-z0-9+.-]*:/i.test(loc) || loc.startsWith("//"))) {
      problems.push(`Location carries a host: ${loc}`);
    }
    if (originHost) originHostChecks(r, problems);
  }
  const f = chain.final;
  if (!f || f.status !== 200) return;
  const robots = f.headers["x-robots-tag"] ?? "";
  if (/noindex/i.test(robots)) {
    (allowPlatformNoindex ? waived : problems).push(`X-Robots-Tag: ${robots}`);
  }
  if (isHtml(f)) pagesToScan.set(f.url.href, f);
}

function checkCanonical(f, expectedPath, problems) {
  const c = canonicalOf(f.body);
  const want = canonicalOrigin + expectedPath;
  if (!c) problems.push("no rel=canonical");
  else if (!/^https:\/\//.test(c))
    problems.push(`canonical not absolute: ${c}`);
  else if (c !== want) problems.push(`canonical ${c}, want ${want}`);
}

// expect: { hops: exact redirect count, locations: [expected Location per hop],
//           maxHops: upper bound instead of exact, finalPath }
async function row(name, path, expect) {
  const chain = await follow(path);
  const problems = [];
  if (chain.error) problems.push(chain.error);
  const redirects = chain.hops.filter((r) => r.status >= 300 && r.status < 400);
  if (!chain.error) {
    if (chain.final.status !== 200)
      problems.push(`ends at ${chain.final.status}`);
    if (expect.hops !== undefined && redirects.length !== expect.hops) {
      problems.push(`${redirects.length} redirect(s), want ${expect.hops}`);
    }
    if (expect.maxHops !== undefined && redirects.length > expect.maxHops) {
      problems.push(
        `${redirects.length} redirect(s), want at most ${expect.maxHops}`,
      );
    }
    expect.locations?.forEach((want, i) => {
      const r = redirects[i];
      if (r && r.status !== 308)
        problems.push(`hop ${i + 1} is ${r.status}, want 308`);
      if (r && r.headers.location !== want)
        problems.push(
          `hop ${i + 1} Location ${r.headers.location}, want ${want}`,
        );
    });
    const finalPath = chain.final.url.pathname;
    if (expect.finalPath && finalPath !== expect.finalPath)
      problems.push(`ends at ${finalPath}, want ${expect.finalPath}`);
    if (chain.final.status === 200 && isHtml(chain.final)) {
      if (expect.alias) {
        const refresh = refreshOf(chain.final.body);
        if (!refresh) problems.push("alias page has no meta refresh");
        else {
          const target = new URL(refresh, chain.final.url);
          if (
            target.origin !== site.origin ||
            !target.pathname.startsWith(P + "/")
          ) {
            problems.push(`refresh target ${target.href} is not under ${P}/`);
          } else if (
            expect.alias.target &&
            target.pathname !== `${P}/${expect.alias.target}`
          ) {
            problems.push(
              `refresh target ${target.pathname}, want ${P}/${expect.alias.target}`,
            );
          }
          checkCanonical(chain.final, target.pathname, problems);
        }
      } else checkCanonical(chain.final, finalPath, problems);
    }
  }
  const waived = [];
  crossChecks(chain, problems, waived);
  results.push({
    row: `${name}  ${path}`,
    ok: problems.length === 0,
    detail: problems.join("; "),
    waived: waived.join("; "),
    chain: describe(chain),
  });
}

async function main() {
  const fixedRows = [
    // The site owns /P -> /P/; an origin never sees the bare prefix through the site.
    ...(originDirect
      ? []
      : [
          [
            "prefix bare",
            P,
            { hops: 1, locations: [`${P}/`], finalPath: `${P}/` },
          ],
        ]),
    ["prefix root", `${P}/`, { hops: 0 }],
  ];
  for (const [name, path, expect] of fixedRows) await row(name, path, expect);
  for (const n of list("notes")) {
    await row("note", `${P}/${n}`, { hops: 0 });
    await row("note slash", `${P}/${n}/`, {
      hops: 1,
      locations: [`${P}/${n}`],
    });
  }
  for (const f of list("folders")) {
    await row("folder", `${P}/${f}/`, { hops: 0 });
    await row("folder bare", `${P}/${f}`, {
      hops: 1,
      locations: [`${P}/${f}/`],
    });
  }
  for (const t of list("tags")) {
    await row("tag", `${P}/${tagsPath}/${t}`, { hops: 0 });
    await row("tag slash", `${P}/${tagsPath}/${t}/`, {
      hops: 1,
      locations: [`${P}/${tagsPath}/${t}`],
    });
  }
  for (const a of aliases)
    await row("alias", `${P}/${a.path}`, { hops: 0, alias: a });
  await row("index", `${P}/index`, { maxHops: 2, finalPath: `${P}/` });
  await row("index.html", `${P}/index.html`, {
    maxHops: 2,
    finalPath: `${P}/`,
  });

  // Sub-resources of every 200 HTML page reached by a row: 200, as linked.
  for (const page of [...pagesToScan.values()]) {
    for (const u of references(page)) {
      if (!subresources.has(u.href))
        subresources.set(u.href, page.url.pathname);
    }
  }
  const rowPages = new Set(pagesToScan.keys());
  for (const [href, from] of subresources) {
    if (rowPages.has(href)) continue; // a row already saw 200 at this exact URL
    const u = new URL(href);
    const path = u.pathname + u.search;
    const chain = await follow(path);
    const problems = [];
    if (chain.error) problems.push(chain.error);
    else {
      const redirects = chain.hops.length - 1;
      if (chain.final.status !== 200)
        problems.push(`ends at ${chain.final.status}`);
      if (redirects > 0)
        problems.push(`linked form redirects (${redirects} hop(s))`);
      if (
        !rowPages.has(chain.final.url.href) &&
        chain.final.status === 200 &&
        isHtml(chain.final)
      ) {
        checkCanonical(chain.final, chain.final.url.pathname, problems);
      }
    }
    const waived = [];
    crossChecks(chain, problems, waived);
    results.push({
      row: `subresource  ${path}  (from ${from})`,
      ok: problems.length === 0,
      detail: problems.join("; "),
      waived: waived.join("; "),
      chain: describe(chain),
    });
  }
}

let aborted = null;
try {
  await main();
} catch (e) {
  aborted = e;
}

for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.row}`);
  console.log(`      ${r.chain}`);
  if (!r.ok) console.log(`      ! ${r.detail}`);
  if (r.waived) console.log(`      ~ waived: ${r.waived}`);
}
const waivedRows = results.filter((r) => r.waived).length;
const failed = results.filter((r) => !r.ok).length;
console.log(
  `\n${results.length - failed}/${results.length} rows pass, ${requestCount} requests, site ${site.origin}, prefix ${P}${originDirect ? ", origin-direct (site-owned /P row skipped)" : ""}${originHost ? `, origin host ${originHost} checked` : ""}${bypass ? ", bypass header on" : ""}${allowPlatformNoindex ? `, platform noindex WAIVED (seen on ${waivedRows} row(s))` : ""}`,
);
if (args.json) {
  fs.writeFileSync(
    args.json,
    JSON.stringify(
      {
        site: site.origin,
        prefix: P,
        originDirect,
        originHost,
        allowPlatformNoindex,
        waivedRows,
        at: new Date().toISOString(),
        results,
        responses: log,
      },
      null,
      2,
    ),
  );
}
if (aborted) die(`check aborted: ${aborted.message}`);
process.exit(failed ? 1 : 0);
