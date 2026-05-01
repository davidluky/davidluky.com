import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceExtensions = new Set([".astro", ".css", ".html", ".js", ".json", ".md", ".mjs", ".svg", ".toml", ".ts", ".txt", ".yml"]);
const ignoredDirectories = new Set([".astro", ".git", ".wrangler", "dist", "node_modules"]);
const mojibakePatterns = [
  new RegExp("\\u00c3."),
  new RegExp("\\u00c2."),
  new RegExp("\\u00e2\\u20ac\\u2122"),
  new RegExp("\\u00e2\\u20ac\\u0153"),
  new RegExp("\\u00e2\\u20ac\\u009d"),
  new RegExp("\\u00e2\\u20ac\\u201d"),
  new RegExp("\\u00e2\\u20ac\\u0094"),
  new RegExp("\\u00e2\\u20ac\\u201c"),
  new RegExp("\\u00e2\\u2020\\u2019"),
];
const failures = [];

function walk(directory, visitor) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;

    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, visitor);
    } else {
      visitor(fullPath);
    }
  }
}

function readText(filePath) {
  return readFileSync(filePath, "utf8");
}

function relative(filePath) {
  return path.relative(root, filePath).replace(/\\/g, "/");
}

walk(root, (filePath) => {
  if (!sourceExtensions.has(path.extname(filePath))) return;

  const text = readText(filePath);
  for (const pattern of mojibakePatterns) {
    if (pattern.test(text)) {
      failures.push(`${relative(filePath)} contains likely mojibake (${pattern}).`);
      break;
    }
  }
});

const workerPath = path.join(root, "src", "worker.ts");
if (existsSync(workerPath)) {
  const worker = readText(workerPath);
  if (/VERIFICATION_TOKEN\s*=\s*["']/.test(worker)) {
    failures.push("src/worker.ts must not hardcode the eBay verification token.");
  }
  if (!worker.includes("env.EBAY_VERIFICATION_TOKEN")) {
    failures.push("src/worker.ts must read the eBay verification token from env.EBAY_VERIFICATION_TOKEN.");
  }
}

const publicHeaders = path.join(root, "public", "_headers");
if (existsSync(publicHeaders)) {
  const headers = readText(publicHeaders);
  for (const requiredDirective of ["frame-ancestors 'none'", "base-uri 'self'", "form-action 'self'"]) {
    if (!headers.includes(requiredDirective)) {
      failures.push(`public/_headers is missing CSP directive: ${requiredDirective}.`);
    }
  }
}

const dist = path.join(root, "dist");
if (existsSync(dist)) {
  const htmlFiles = [];
  walk(dist, (filePath) => {
    if (path.extname(filePath) === ".html") htmlFiles.push(filePath);
  });

  for (const htmlFile of htmlFiles) {
    const html = readText(htmlFile);
    const links = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((match) => match[1]);

    for (const link of links) {
      if (
        link.startsWith("http") ||
        link.startsWith("mailto:") ||
        link.startsWith("tel:") ||
        link.startsWith("#") ||
        link.startsWith("data:")
      ) {
        continue;
      }

      const [pathname] = link.split("#");
      if (!pathname || pathname.startsWith("//")) continue;

      const target = pathname.startsWith("/")
        ? path.join(dist, pathname)
        : path.join(path.dirname(htmlFile), pathname);

      const candidates = [
        target,
        path.join(target, "index.html"),
        `${target}.html`,
      ];

      if (!candidates.some((candidate) => existsSync(candidate) && statSync(candidate).isFile())) {
        failures.push(`${relative(htmlFile)} references missing internal asset/page: ${link}`);
      }
    }

    if (!html.includes('type="application/ld+json"')) {
      failures.push(`${relative(htmlFile)} is missing JSON-LD structured data.`);
    }
  }
}

if (failures.length > 0) {
  console.error("Site validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Site validation passed.");
