import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "..", "dist");

const KB = 1024;
const MAX_PAGE_WEIGHT = 50 * KB;
const MAX_CSS = 20 * KB;
const MAX_JS = 10 * KB;

function getSize(filePath) {
  return fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

if (!fs.existsSync(distDir)) {
  console.error(`dist directory not found at ${distDir}. Run "pnpm build" first.`);
  process.exit(1);
}

const indexHtml = path.join(distDir, "index.html");
const writingHtml = path.join(distDir, "writing", "index.html");

const totalHtmlBytes = getSize(indexHtml) + getSize(writingHtml);

let totalCssBytes = 0;
let totalJsBytes = 0;

for (const file of walk(distDir)) {
  if (file.endsWith(".css")) {
    totalCssBytes += getSize(file);
  } else if (file.endsWith(".js")) {
    totalJsBytes += getSize(file);
  }
}

function toKB(bytes) {
  return (bytes / KB).toFixed(2);
}

console.log("Performance budget report:");
console.log(`  HTML total: ${toKB(totalHtmlBytes)} KB (limit ${MAX_PAGE_WEIGHT / KB} KB)`);
console.log(`  CSS total:  ${toKB(totalCssBytes)} KB (limit ${MAX_CSS / KB} KB)`);
console.log(`  JS total:   ${toKB(totalJsBytes)} KB (limit ${MAX_JS / KB} KB)`);

let ok = true;

if (totalHtmlBytes > MAX_PAGE_WEIGHT) {
  console.error("❌ HTML total exceeds budget.");
  ok = false;
}

if (totalCssBytes > MAX_CSS) {
  console.error("❌ CSS total exceeds budget.");
  ok = false;
}

if (totalJsBytes > MAX_JS) {
  console.error("❌ JS total exceeds budget.");
  ok = false;
}

if (!ok) {
  process.exit(1);
} else {
  console.log("✅ All performance budgets are within limits.");
}

