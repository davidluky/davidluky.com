# Matheus Photobook + Password Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Password-protect `matheus.davidluky.com` server-side in the Cloudflare Worker and rebuild its landing experience as a photography-book edition, plus a time-boxed quick-wins audit of the other sites.

**Architecture:** A new pure module `src/matheus-gate.ts` handles signed-cookie sessions and constant-time password checks; `src/worker.ts` gates every matheus-host request and closes the `davidluky.com/matheus/*` bypass. The photobook is a hand-authored static page at `public/matheus/index.html` with responsive AVIF/WebP derivatives generated once by a sharp script. The old `/livro/` and `/revista/` editions stay byte-identical.

**Tech Stack:** Cloudflare Workers (existing), TypeScript, vitest (new devDependency), sharp (new devDependency), @fontsource/fraunces (new devDependency), plain HTML/CSS/JS for the static pages.

**Spec:** `docs/superpowers/specs/2026-07-11-matheus-photobook-design.md`

## Execution outcome — 2026-07-12

Tasks 1–8 and Task 9's automated, HTTP, and deployment gates were completed. The planned interactive
desktop/mobile/lightbox browser pass was blocked by the available browser environment and remains a
documented visual-QA gap. The optional Task 10 cross-site audit was completed in a separate time-boxed
pass later on 2026-07-12. The historical Task 1–9 checkboxes below were not maintained while the task
commits landed; do not interpret those unchecked boxes as instructions to re-run the plan.

Two post-plan corrections define current behavior:

- Production routing uses `[assets] run_worker_first = true`, not a selective path list. This ensures
  unknown and future Matheus paths cannot bypass the hostname-aware Worker gate.
- After launch feedback, `/` was restored as a three-edition selector. The byte-preserved photobook now
  lives at `public/matheus/fotolivro.html` and is served at canonical `/fotolivro`; `/livro/` and
  `/revista/` remain unchanged.

Use `docs/FLIGHT-DECK.md` for current operating procedure and `docs/RETRO-2026-07-12.md` for the
implementation learnings and deviations.

Task 10 outcome:

- `davidluky.com`: refreshed the 1200×750 WebP Matheus project preview to show all three editions
  (`35d36dc`).
- `alisson.davidluky.com`: install, full verification, metadata, fragment links, and 375px live layout
  passed; no change required.
- `tibia-services`: full quality/package checks, internal links, live routes, metadata, and 375px live
  layout passed; no change required.
- `franks-stories`: added route-specific story metadata and mobile card/reader improvements
  (`fef5004`).
- `the-room-web`: lint, types, 890 tests, build, and 375px live login passed. A generated path change
  depended on uncommitted sibling-native tournament work, so it was not committed alone; the
  coordinated follow-up and non-blocking warnings are logged in `docs/task-10-audit-2026-07-12.md`
  (`4781ea1`).
- `matematica-davidluky`: 320-page build, links, metadata, and 375px live layout passed; added the
  missing `/us` landing page to the sitemap (`5165558`).

All Task 10 commits remain local pending explicit per-repository production-push approval.

## Global Constraints

- The repo `davidluky/davidluky.com` is **public**. The literal password must never appear in any committed file, code, commit message, or CI log. Its value lives only in `docs/superpowers/LOCAL-ONLY-SECRETS.md` (untracked) and in Cloudflare Worker secrets.
- All Matheus-facing UI copy is pt-BR.
- Do not write all-caps accented words (e.g. write "Não", never the all-caps form) — `scripts/validate-site.mjs` flags the uppercase A-tilde character as mojibake.
- New npm packages are devDependencies only; the static pages use vanilla JS with zero runtime dependencies.
- Node >= 24 (`engines` in package.json).
- `public/matheus/livro/` and `public/matheus/revista/` must remain byte-identical.
- The eBay routes in `src/worker.ts` must keep working unchanged.
- **Superseded:** the original per-path `run_worker_first` rule was insufficient. Keep
  `[assets] run_worker_first = true` so every Matheus-host path reaches the gate.
- `npm run verify` must pass before every commit.
- Never push to `main` (= production deploy) without David's explicit approval. Local commits are fine and expected per task.

---

### Task 1: Gate session module (`src/matheus-gate.ts`)

**Files:**
- Create: `src/matheus-gate.ts`
- Create: `tests/matheus-gate.test.ts`
- Modify: `package.json` (add vitest, add `test` script, extend `verify`)

**Interfaces:**
- Produces (used by Task 3):
  - `SESSION_COOKIE_NAME: string` (value `"matheus_sessao"`)
  - `SESSION_DURATION_MS: number` (30 days)
  - `signSession(secret: string, expiresAtMs: number): Promise<string>`
  - `verifySession(secret: string, cookieValue: string | undefined, nowMs: number): Promise<boolean>`
  - `verifyPassword(expectedPassword: string, providedPassword: string): Promise<boolean>`
  - `parseCookies(header: string | null): Map<string, string>`
  - `safeReturnPath(raw: string | null): string`

- [ ] **Step 1: Install vitest and wire scripts**

```powershell
npm install -D vitest
```

Then in `package.json` `scripts`, add `"test": "vitest run"` and change `verify` to:

```json
"verify": "npm run check && npm run test && npm run build && npm run validate:site && npm run audit:high"
```

- [ ] **Step 2: Write the failing tests**

Create `tests/matheus-gate.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  parseCookies,
  safeReturnPath,
  signSession,
  verifyPassword,
  verifySession,
} from "../src/matheus-gate";

describe("signSession / verifySession", () => {
  it("accepts a valid unexpired session", async () => {
    const value = await signSession("secret", 2_000_000);
    expect(await verifySession("secret", value, 1_000_000)).toBe(true);
  });

  it("rejects an expired session", async () => {
    const value = await signSession("secret", 2_000_000);
    expect(await verifySession("secret", value, 3_000_000)).toBe(false);
  });

  it("rejects a tampered expiry", async () => {
    const value = await signSession("secret", 2_000_000);
    const tampered = `9999999999999.${value.split(".")[1]}`;
    expect(await verifySession("secret", tampered, 1_000_000)).toBe(false);
  });

  it("rejects a cookie signed with another secret", async () => {
    const value = await signSession("other-secret", 2_000_000);
    expect(await verifySession("secret", value, 1_000_000)).toBe(false);
  });

  it("rejects undefined and malformed values", async () => {
    expect(await verifySession("secret", undefined, 0)).toBe(false);
    expect(await verifySession("secret", "", 0)).toBe(false);
    expect(await verifySession("secret", "no-separator", 0)).toBe(false);
    expect(await verifySession("secret", ".only-mac", 0)).toBe(false);
  });
});

describe("verifyPassword", () => {
  it("accepts the exact password", async () => {
    expect(await verifyPassword("abc123", "abc123")).toBe(true);
  });

  it("rejects a wrong password", async () => {
    expect(await verifyPassword("abc123", "abc124")).toBe(false);
  });

  it("rejects an empty password", async () => {
    expect(await verifyPassword("abc123", "")).toBe(false);
  });
});

describe("parseCookies", () => {
  it("parses multiple cookies", () => {
    const cookies = parseCookies("a=1; matheus_sessao=xyz; b=2");
    expect(cookies.get("matheus_sessao")).toBe("xyz");
    expect(cookies.get("a")).toBe("1");
  });

  it("returns an empty map for a null header", () => {
    expect(parseCookies(null).size).toBe(0);
  });
});

describe("safeReturnPath", () => {
  it("defaults to / for null or unsafe values", () => {
    expect(safeReturnPath(null)).toBe("/");
    expect(safeReturnPath("//evil.example")).toBe("/");
    expect(safeReturnPath("https://evil.example/")).toBe("/");
    expect(safeReturnPath("/x\\y")).toBe("/");
  });

  it("keeps a normal local path", () => {
    expect(safeReturnPath("/livro/")).toBe("/livro/");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — cannot resolve `../src/matheus-gate`.

- [ ] **Step 4: Implement `src/matheus-gate.ts`**

```ts
// Session and password primitives for the Matheus manual gate.
// Pure functions over WebCrypto so they run in Workers and in vitest (Node 24).

const encoder = new TextEncoder();

export const SESSION_COOKIE_NAME = "matheus_sessao";
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

async function hmacSha256(secret: string, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function signSession(secret: string, expiresAtMs: number): Promise<string> {
  const mac = await hmacSha256(secret, String(expiresAtMs));
  return `${expiresAtMs}.${toBase64Url(mac)}`;
}

export async function verifySession(
  secret: string,
  cookieValue: string | undefined,
  nowMs: number,
): Promise<boolean> {
  if (!cookieValue) return false;
  const separator = cookieValue.indexOf(".");
  if (separator <= 0) return false;
  const expiresAtMs = Number(cookieValue.slice(0, separator));
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= nowMs) return false;
  const expected = await signSession(secret, expiresAtMs);
  return constantTimeEqual(encoder.encode(expected), encoder.encode(cookieValue));
}

export async function verifyPassword(
  expectedPassword: string,
  providedPassword: string,
): Promise<boolean> {
  const [expectedHash, providedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(expectedPassword)),
    crypto.subtle.digest("SHA-256", encoder.encode(providedPassword)),
  ]);
  return constantTimeEqual(new Uint8Array(expectedHash), new Uint8Array(providedHash));
}

export function parseCookies(header: string | null): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!header) return cookies;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    cookies.set(part.slice(0, eq).trim(), part.slice(eq + 1).trim());
  }
  return cookies;
}

export function safeReturnPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return "/";
  return raw;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS (all suites).

- [ ] **Step 6: Commit**

```powershell
git add src/matheus-gate.ts tests/matheus-gate.test.ts package.json package-lock.json
git commit -m "feat: add session/password primitives for Matheus gate"
```

---

### Task 2: Login page ("the book cover")

**Files:**
- Create: `public/matheus/entrar/index.html`
- Create: `public/matheus/gate_assets/capa.jpg` (file copy)

**Interfaces:**
- Consumes: nothing from other tasks (pure static page).
- Produces: form that POSTs field `senha` to `/entrar/` preserving the query string; error UI when `?erro=1`. Task 3's Worker depends on exactly this contract.

- [ ] **Step 1: Copy the cover image into the ungated assets folder**

```powershell
New-Item -ItemType Directory -Force public\matheus\gate_assets
Copy-Item public\matheus\html_preview_assets\images\cover-matheus-peixaria.jpg public\matheus\gate_assets\capa.jpg
```

- [ ] **Step 2: Create `public/matheus/entrar/index.html`**

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Know-How: Manipulação de Pescados</title>
  <style>
    :root {
      --tinta: #10100e;
      --papel: #f5f1e6;
      --dourado: #c8a35a;
      --erro: #f3b6c5;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      color: var(--papel);
      background:
        linear-gradient(180deg, rgba(8, 12, 12, .55), rgba(8, 12, 12, .82)),
        url("../gate_assets/capa.jpg") center / cover no-repeat fixed,
        #0b100f;
      font-family: Georgia, "Times New Roman", serif;
    }
    main {
      width: min(560px, calc(100% - 40px));
      padding: clamp(28px, 6vw, 56px);
      text-align: center;
      border: 1px solid rgba(245, 241, 230, .28);
      outline: 1px solid rgba(245, 241, 230, .10);
      outline-offset: 6px;
      background: rgba(10, 14, 13, .38);
      backdrop-filter: blur(2px);
    }
    .kicker {
      margin: 0 0 14px;
      color: var(--dourado);
      font-family: system-ui, "Segoe UI", sans-serif;
      font-size: .74rem;
      font-weight: 700;
      letter-spacing: .22em;
      text-transform: uppercase;
    }
    h1 {
      margin: 0;
      font-size: clamp(1.9rem, 5.5vw, 3rem);
      font-weight: 500;
      line-height: 1.12;
      text-wrap: balance;
    }
    .credito {
      margin: 14px 0 0;
      color: rgba(245, 241, 230, .78);
      font-size: .95rem;
      font-style: italic;
    }
    form { margin-top: clamp(24px, 5vw, 40px); }
    label {
      display: block;
      margin-bottom: 10px;
      font-family: system-ui, "Segoe UI", sans-serif;
      font-size: .8rem;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: rgba(245, 241, 230, .82);
    }
    .campo { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    input[type="password"] {
      flex: 1 1 220px;
      padding: 13px 16px;
      color: var(--papel);
      background: rgba(0, 0, 0, .35);
      border: 1px solid rgba(245, 241, 230, .45);
      border-radius: 2px;
      font-size: 1.05rem;
      letter-spacing: .08em;
    }
    input[type="password"]:focus-visible {
      outline: 2px solid var(--dourado);
      outline-offset: 2px;
    }
    button {
      padding: 13px 22px;
      color: var(--tinta);
      background: var(--papel);
      border: 0;
      border-radius: 2px;
      font-family: system-ui, "Segoe UI", sans-serif;
      font-size: .86rem;
      font-weight: 700;
      letter-spacing: .1em;
      text-transform: uppercase;
      cursor: pointer;
    }
    button:hover { background: #fffdf5; }
    button:focus-visible { outline: 2px solid var(--dourado); outline-offset: 2px; }
    .erro {
      display: none;
      margin: 16px 0 0;
      color: var(--erro);
      font-family: system-ui, "Segoe UI", sans-serif;
      font-size: .92rem;
    }
    .erro.visivel { display: block; }
    .rodape {
      margin-top: clamp(28px, 6vw, 44px);
      color: rgba(245, 241, 230, .6);
      font-family: system-ui, "Segoe UI", sans-serif;
      font-size: .78rem;
      letter-spacing: .06em;
    }
  </style>
</head>
<body>
  <main>
    <p class="kicker">Edição fotográfica reservada</p>
    <h1>Know-How: Manipulação de Pescados</h1>
    <p class="credito">Texto e fotografia de Matheus Felipe Silverio</p>
    <form method="post" action="/entrar/">
      <label for="senha">Senha de acesso</label>
      <div class="campo">
        <input id="senha" name="senha" type="password" autocomplete="current-password" required autofocus>
        <button type="submit">Abrir o livro</button>
      </div>
      <p class="erro" id="mensagem-erro" role="alert">Senha incorreta. Tente novamente.</p>
    </form>
    <p class="rodape">Acesso restrito a convidados. Publicado por davidluky.com.</p>
  </main>
  <script>
    (function () {
      var params = new URLSearchParams(location.search);
      if (params.get("erro") === "1") {
        document.getElementById("mensagem-erro").classList.add("visivel");
      }
      // Preserva ?voltar= no destino do POST para o Worker redirecionar de volta.
      document.querySelector("form").action = "/entrar/" + location.search;
    })();
  </script>
</body>
</html>
```

- [ ] **Step 3: Verify the page renders standalone**

Run: `npx astro build` then open `dist/matheus/entrar/index.html` in a browser (or `Start-Process` it). Expected: dark cover screen, centered card, password field; no console errors. (The background image resolves relative to the page, so it also works from `dist`.)

- [ ] **Step 4: Commit**

```powershell
git add public/matheus/entrar/ public/matheus/gate_assets/
git commit -m "feat: add Matheus login cover page"
```

---

### Task 3: Worker gate wiring

**Files:**
- Modify: `src/worker.ts` (imports at top; `Env` interface ~line 15; `MATHEUS_HOSTS` ~line 9; replace `handleMatheusSite` ~lines 332-362; `fetch` ~lines 364-378)
- Modify: `wrangler.toml` (`run_worker_first`, lines 19-28)
- Create: `tests/worker-matheus.test.ts`

**Interfaces:**
- Consumes from Task 1: `SESSION_COOKIE_NAME`, `SESSION_DURATION_MS`, `signSession`, `verifySession`, `verifyPassword`, `parseCookies`, `safeReturnPath`.
- Consumes from Task 2: login page at `/entrar/` posting field `senha`, reading `?erro=1` and `?voltar=`.
- Produces: gated matheus hosts; `davidluky.com/matheus/*` 301s to the subdomain.

- [ ] **Step 1: Write the failing Worker tests**

Create `tests/worker-matheus.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import worker from "../src/worker";
import { SESSION_COOKIE_NAME, signSession } from "../src/matheus-gate";

const SECRET = "test-session-secret";
const PASSWORD = "test-password";

function makeEnv(overrides: Record<string, unknown> = {}) {
  return {
    ASSETS: {
      fetch: async (request: Request) =>
        new Response(`asset:${new URL(request.url).pathname}`, { status: 200 }),
    },
    MATHEUS_PASSWORD: PASSWORD,
    MATHEUS_SESSION_SECRET: SECRET,
    ...overrides,
    // Cast: tests only exercise the Matheus paths, eBay env vars are unused.
  } as Parameters<typeof worker.fetch>[1];
}

async function authCookie(): Promise<string> {
  return `${SESSION_COOKIE_NAME}=${await signSession(SECRET, Date.now() + 60_000)}`;
}

describe("matheus gate", () => {
  it("redirects unauthenticated visitors to /entrar/", async () => {
    const response = await worker.fetch(
      new Request("https://matheus.davidluky.com/"),
      makeEnv(),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://matheus.davidluky.com/entrar/");
  });

  it("keeps the requested path in ?voltar=", async () => {
    const response = await worker.fetch(
      new Request("https://matheus.davidluky.com/livro/"),
      makeEnv(),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toContain("voltar=%2Flivro%2F");
  });

  it("serves the login page without a session", async () => {
    const response = await worker.fetch(
      new Request("https://matheus.davidluky.com/entrar/"),
      makeEnv(),
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("asset:/matheus/entrar/");
  });

  it("serves gate assets without a session", async () => {
    const response = await worker.fetch(
      new Request("https://matheus.davidluky.com/gate_assets/capa.jpg"),
      makeEnv(),
    );
    expect(response.status).toBe(200);
  });

  it("serves content with a valid session and sets noindex", async () => {
    const response = await worker.fetch(
      new Request("https://matheus.davidluky.com/", { headers: { cookie: await authCookie() } }),
      makeEnv(),
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("asset:/matheus/");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(response.headers.get("cache-control")).toBe("private, max-age=600");
  });

  it("redirects an authenticated visitor away from /entrar/", async () => {
    const response = await worker.fetch(
      new Request("https://matheus.davidluky.com/entrar/", {
        headers: { cookie: await authCookie() },
      }),
      makeEnv(),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://matheus.davidluky.com/");
  });

  it("sets a session cookie on correct password and honors voltar", async () => {
    const response = await worker.fetch(
      new Request("https://matheus.davidluky.com/entrar/?voltar=%2Flivro%2F", {
        method: "POST",
        body: new URLSearchParams({ senha: PASSWORD }),
      }),
      makeEnv(),
    );
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/livro/");
    expect(response.headers.get("set-cookie")).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
  });

  it("bounces back with erro=1 on wrong password, no cookie", async () => {
    const response = await worker.fetch(
      new Request("https://matheus.davidluky.com/entrar/", {
        method: "POST",
        body: new URLSearchParams({ senha: "wrong" }),
      }),
      makeEnv(),
    );
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("erro=1");
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("fails closed with 503 when secrets are missing", async () => {
    const response = await worker.fetch(
      new Request("https://matheus.davidluky.com/"),
      makeEnv({ MATHEUS_PASSWORD: undefined, MATHEUS_SESSION_SECRET: undefined }),
    );
    expect(response.status).toBe(503);
  });

  it("redirects the main-host /matheus/* bypass to the subdomain", async () => {
    const response = await worker.fetch(
      new Request("https://davidluky.com/matheus/livro/index.html"),
      makeEnv(),
    );
    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(
      "https://matheus.davidluky.com/livro/index.html",
    );
  });

  it("leaves other main-host paths untouched", async () => {
    const response = await worker.fetch(
      new Request("https://davidluky.com/projects"),
      makeEnv(),
    );
    expect(await response.text()).toBe("asset:/projects");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: `tests/matheus-gate.test.ts` PASS, `tests/worker-matheus.test.ts` FAIL (no gate behavior yet).

- [ ] **Step 3: Implement the Worker changes**

In `src/worker.ts`:

3a. Add the import at the top of the file:

```ts
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
  parseCookies,
  safeReturnPath,
  signSession,
  verifyPassword,
  verifySession,
} from "./matheus-gate";
```

3b. Extend `MATHEUS_HOSTS` (around line 9) with the local-dev host:

```ts
const MATHEUS_HOSTS = new Set([
  "matheus.davidluky.com",
  "manual-matheus.davidluky.com",
  "matheus.localhost",
]);
```

3c. Add to the `Env` interface:

```ts
  MATHEUS_PASSWORD?: string;
  MATHEUS_SESSION_SECRET?: string;
```

3d. Add these helpers next to `handleMatheusSite`:

```ts
const GATE_OPEN_PATHS = new Set(["/entrar", "/entrar/", "/entrar/index.html"]);
const GATE_OPEN_PREFIXES = ["/gate_assets/"];

function redirect(location: string, status: number, extraHeaders?: Record<string, string>): Response {
  return new Response(null, { status, headers: { location, ...extraHeaders } });
}

function withMatheusHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("x-robots-tag", "noindex, nofollow");
  headers.set("cache-control", "private, max-age=600");
  return new Response(response.body, { status: response.status, headers });
}

async function handleMatheusLogin(request: Request, env: Env, url: URL): Promise<Response> {
  const voltar = safeReturnPath(url.searchParams.get("voltar"));
  const form = await request.formData().catch(() => null);
  const senha = form?.get("senha");

  if (typeof senha === "string" && (await verifyPassword(env.MATHEUS_PASSWORD as string, senha))) {
    const expiresAtMs = Date.now() + SESSION_DURATION_MS;
    const cookie = [
      `${SESSION_COOKIE_NAME}=${await signSession(env.MATHEUS_SESSION_SECRET as string, expiresAtMs)}`,
      `Max-Age=${Math.floor(SESSION_DURATION_MS / 1000)}`,
      "Path=/",
      "HttpOnly",
      "Secure",
      "SameSite=Lax",
    ].join("; ");
    return withMatheusHeaders(redirect(voltar, 303, { "set-cookie": cookie }));
  }

  return withMatheusHeaders(
    redirect(`/entrar/?erro=1&voltar=${encodeURIComponent(voltar)}`, 303),
  );
}
```

3e. Replace the whole existing `handleMatheusSite` function with:

```ts
async function handleMatheusSite(request: Request, env: Env, url: URL): Promise<Response> {
  if (!env.MATHEUS_PASSWORD || !env.MATHEUS_SESSION_SECRET) {
    // Fail closed: never serve the manual ungated because secrets are missing.
    return new Response("Acesso temporariamente indisponivel.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (request.method === "POST" && GATE_OPEN_PATHS.has(url.pathname)) {
    return handleMatheusLogin(request, env, url);
  }

  const cookies = parseCookies(request.headers.get("cookie"));
  const authenticated = await verifySession(
    env.MATHEUS_SESSION_SECRET,
    cookies.get(SESSION_COOKIE_NAME),
    Date.now(),
  );
  const isOpenPath =
    GATE_OPEN_PATHS.has(url.pathname) ||
    GATE_OPEN_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));

  if (!authenticated && !isOpenPath) {
    const login = new URL(request.url);
    login.pathname = "/entrar/";
    login.search =
      url.pathname === "/" || url.pathname === "/index.html"
        ? ""
        : `?voltar=${encodeURIComponent(url.pathname)}`;
    return withMatheusHeaders(redirect(login.toString(), 302));
  }

  if (authenticated && GATE_OPEN_PATHS.has(url.pathname)) {
    const home = new URL(request.url);
    home.pathname = "/";
    home.search = "";
    return withMatheusHeaders(redirect(home.toString(), 302));
  }

  if (url.pathname === "/livro" || url.pathname === "/revista") {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = `${url.pathname}/`;
    return withMatheusHeaders(redirect(redirectUrl.toString(), 308));
  }

  const assetUrl = new URL(request.url);
  assetUrl.pathname =
    url.pathname === "/" || url.pathname === "/index.html"
      ? `${MATHEUS_ASSET_PREFIX}/`
      : `${MATHEUS_ASSET_PREFIX}${url.pathname}`;

  const assetRequest = new Request(assetUrl.toString(), {
    headers: request.headers,
    method: request.method,
  });
  const response = await env.ASSETS.fetch(assetRequest);

  if (response.status !== 404 || url.pathname === "/404.html") {
    return withMatheusHeaders(response);
  }

  const notFoundUrl = new URL(request.url);
  notFoundUrl.pathname = `${MATHEUS_ASSET_PREFIX}/404.html`;
  const notFound = await env.ASSETS.fetch(
    new Request(notFoundUrl.toString(), { headers: request.headers }),
  );
  return withMatheusHeaders(
    new Response(notFound.body, { status: 404, headers: notFound.headers }),
  );
}
```

3f. In the `fetch` handler, add the main-host bypass redirect before the eBay check:

```ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (MATHEUS_HOSTS.has(url.hostname)) {
      return handleMatheusSite(request, env, url);
    }

    if (url.pathname === "/matheus" || url.pathname.startsWith("/matheus/")) {
      const target = new URL(request.url);
      target.hostname = "matheus.davidluky.com";
      target.port = "";
      target.pathname = url.pathname.slice("/matheus".length) || "/";
      return redirect(target.toString(), 301);
    }

    if (url.pathname === "/ebay/deletion") {
      return handleEbayDeletion(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
```

- [ ] **Step 4: Update `wrangler.toml`**

Replace the `run_worker_first` list with:

```toml
run_worker_first = [
  "/",
  "/index.html",
  "/livro",
  "/livro/*",
  "/revista",
  "/revista/*",
  "/html_preview_assets/*",
  "/magazine_assets/*",
  "/matheus",
  "/matheus/*",
  "/entrar",
  "/entrar/*",
  "/gate_assets/*",
  "/book_assets/*"
]
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS (both test files).

- [ ] **Step 6: Run the full verify chain**

Run: `npm run verify`
Expected: PASS. If `astro check` complains about `Parameters<typeof worker.fetch>[1]` in the test, replace `makeEnv`'s cast with a plain interface literal matching the Worker's `Env` (copy the two Matheus fields plus `ASSETS`).

- [ ] **Step 7: Commit**

```powershell
git add src/worker.ts wrangler.toml tests/worker-matheus.test.ts
git commit -m "feat: gate Matheus manual behind server-side password check"
```

---

### Task 4: Secrets, local dev, and CI

**Files:**
- Create: `.dev.vars` (gitignored — verify `.gitignore` already has `.dev.vars*` and `*LOCAL-ONLY*`; if missing, add both under "Secrets & certificates")
- Read: `docs/superpowers/LOCAL-ONLY-SECRETS.md` (untracked; holds the real values)
- Read/possibly modify: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: the deployed Worker behavior from Task 3.
- Produces: working local dev at `http://matheus.localhost:8787`; production secrets configured.

- [ ] **Step 1: Create `.dev.vars` at the repo root**

Copy the two values from `docs/superpowers/LOCAL-ONLY-SECRETS.md`:

```text
MATHEUS_PASSWORD=<value from LOCAL-ONLY-SECRETS.md>
MATHEUS_SESSION_SECRET=<any long random string for dev>
```

Confirm `git status` does NOT list `.dev.vars`. If it does, stop and fix `.gitignore` first.

- [ ] **Step 2: Smoke test locally with wrangler dev**

Run `npx wrangler dev` in one terminal, then (the `--resolve` flag makes curl resolve the dev host without touching the hosts file):

```powershell
# unauthenticated root redirects to the cover page
curl.exe -s -o NUL -w "%{http_code} %{redirect_url}`n" --resolve matheus.localhost:8787:127.0.0.1 http://matheus.localhost:8787/
# expected: 302 http://matheus.localhost:8787/entrar/

# login page is reachable
curl.exe -s -o NUL -w "%{http_code}`n" --resolve matheus.localhost:8787:127.0.0.1 http://matheus.localhost:8787/entrar/
# expected: 200

# wrong password bounces with erro=1
curl.exe -s -o NUL -w "%{http_code} %{redirect_url}`n" --resolve matheus.localhost:8787:127.0.0.1 -X POST -d "senha=nope" http://matheus.localhost:8787/entrar/
# expected: 303 ...erro=1...

# correct password sets a cookie (use the real value from LOCAL-ONLY-SECRETS.md)
curl.exe -s -D - -o NUL --resolve matheus.localhost:8787:127.0.0.1 -X POST -d "senha=<value>" http://matheus.localhost:8787/entrar/
# expected: HTTP 303, set-cookie: matheus_sessao=...

# cookie grants access
curl.exe -s -o NUL -w "%{http_code}`n" --resolve matheus.localhost:8787:127.0.0.1 -H "Cookie: matheus_sessao=<value printed above>" http://matheus.localhost:8787/
# expected: 200
```

Also open `http://matheus.localhost:8787/` in a real browser and log in end-to-end (browsers resolve `*.localhost` natively).

- [ ] **Step 3: Set production secrets**

Follow `docs/superpowers/LOCAL-ONLY-SECRETS.md`: `npx wrangler secret put MATHEUS_PASSWORD` and `npx wrangler secret put MATHEUS_SESSION_SECRET` (or the Cloudflare dashboard if wrangler is not authenticated). **This must happen before the gate code is ever deployed** — the Worker fails closed (503) without them.

- [ ] **Step 4: Check CI runs the new tests**

Read `.github/workflows/deploy.yml`. If the quality job runs `npm run verify`, nothing to change (verify now includes `npm run test`). If it lists individual commands instead, add a `npm run test` step right after the check step, then commit:

```powershell
git add .github/workflows/deploy.yml
git commit -m "ci: run vitest in quality job"
```

---

### Task 5: Image derivatives and fonts

**Files:**
- Create: `scripts/optimize-matheus-images.mjs`
- Create: `public/matheus/book_assets/img/` (generated output, committed)
- Create: `public/matheus/book_assets/fonts/` (copied woff2, committed)
- Modify: `package.json` (sharp + @fontsource/fraunces devDependencies, `images:matheus` script)

**Interfaces:**
- Produces: derivatives named `book_assets/img/<basename>-{480,960,1600}.{avif,webp}` for every JPEG/PNG under the three source folders; fonts at `book_assets/fonts/*.woff2`. Task 6's markup depends on exactly this naming.

- [ ] **Step 1: Install devDependencies**

```powershell
npm install -D sharp @fontsource/fraunces
```

(`allowScripts` already whitelists `sharp@0.34.5`; if npm blocks the install script, align the version pin in `allowScripts` with the installed version.)

- [ ] **Step 2: Create `scripts/optimize-matheus-images.mjs`**

```js
// One-time generator for responsive AVIF/WebP derivatives of the Matheus photos.
// Output naming (<basename>-<width>.<ext>) is a contract with public/matheus/index.html.
import { mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sources = [
  "public/matheus/html_preview_assets/images",
  "public/matheus/html_preview_assets/contact_sheets",
  "public/matheus/magazine_assets/images",
];
const outDir = path.join(root, "public/matheus/book_assets/img");
const widths = [480, 960, 1600];

mkdirSync(outDir, { recursive: true });

const seen = new Set();
let count = 0;
for (const source of sources) {
  const dir = path.join(root, source);
  for (const file of readdirSync(dir)) {
    if (!/\.(jpe?g|png)$/i.test(file)) continue;
    const base = path.parse(file).name;
    if (seen.has(base)) continue; // first source folder wins on duplicate names
    seen.add(base);
    const input = path.join(dir, file);
    for (const width of widths) {
      const resized = sharp(input).resize({ width, withoutEnlargement: true });
      await resized.clone().avif({ quality: 55 }).toFile(path.join(outDir, `${base}-${width}.avif`));
      await resized.clone().webp({ quality: 78 }).toFile(path.join(outDir, `${base}-${width}.webp`));
    }
    count += 1;
  }
}
console.log(`ok: ${count} imagens processadas para ${outDir}`);
```

Add to `package.json` scripts: `"images:matheus": "node scripts/optimize-matheus-images.mjs"`.

- [ ] **Step 3: Run it and sanity-check output**

Run: `npm run images:matheus`
Expected: `ok: ~95 imagens processadas ...`. Spot-check: `Get-ChildItem public\matheus\book_assets\img | Measure-Object` gives roughly 95 x 6 files, and a 960w AVIF is well under 350 KB.

- [ ] **Step 4: Copy fonts**

```powershell
New-Item -ItemType Directory -Force public\matheus\book_assets\fonts
Copy-Item node_modules\@fontsource\fraunces\files\fraunces-latin-400-normal.woff2 public\matheus\book_assets\fonts\
Copy-Item node_modules\@fontsource\fraunces\files\fraunces-latin-400-italic.woff2 public\matheus\book_assets\fonts\
Copy-Item node_modules\@fontsource\fraunces\files\fraunces-latin-600-normal.woff2 public\matheus\book_assets\fonts\
Copy-Item node_modules\@fontsource\fraunces\files\fraunces-latin-900-normal.woff2 public\matheus\book_assets\fonts\
Copy-Item node_modules\@fontsource\inter\files\inter-latin-400-normal.woff2 public\matheus\book_assets\fonts\
Copy-Item node_modules\@fontsource\inter\files\inter-latin-600-normal.woff2 public\matheus\book_assets\fonts\
```

(If a filename differs, list `node_modules\@fontsource\fraunces\files\` and pick the matching `latin-<weight>-normal` file.)

- [ ] **Step 5: Verify and commit**

Run: `npm run verify` — expected PASS.

```powershell
git add scripts/optimize-matheus-images.mjs package.json package-lock.json public/matheus/book_assets/
git commit -m "feat: add responsive image derivatives and fonts for Matheus photobook"
```

Note: this commit is large (image derivatives). That is expected and accepted — the repo already carries the 33 MB originals.

---

### Task 6: Photobook shell (`public/matheus/index.html`)

**Files:**
- Modify: `public/matheus/index.html` (full replacement of the style selector)

**Interfaces:**
- Consumes from Task 5: `book_assets/img/<basename>-<width>.{avif,webp}`, `book_assets/fonts/*.woff2`.
- Produces: the page skeleton, design system, and interaction layer that Task 7 fills with chapters. Layout classes: `capa`, `sumario`, `capitulo`, `abertura`, `pagina-texto`, `prancha`, `prancha--cheia`, `prancha--dupla`, `folha-contato`, `colofao`, plus `data-spread` sections and `revela` reveal class.

- [ ] **Step 1: Replace `public/matheus/index.html` with the photobook shell**

The file below is complete and must render as-is with the cover, sumário, one placeholder-free front-matter section (Apresentação, with the real text from the livro edition), and the colophon. Chapters are added by Task 7 between the `<!-- CAPITULOS -->` markers.

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Know-How: Manipulação de Pescados — Edição Fotográfica</title>
  <meta name="description" content="Edição fotográfica do manual de manipulação de pescados e frutos do mar de Matheus Felipe Silverio.">
  <style>
    @font-face {
      font-family: "Fraunces";
      src: url("book_assets/fonts/fraunces-latin-400-normal.woff2") format("woff2");
      font-weight: 400; font-style: normal; font-display: swap;
    }
    @font-face {
      font-family: "Fraunces";
      src: url("book_assets/fonts/fraunces-latin-400-italic.woff2") format("woff2");
      font-weight: 400; font-style: italic; font-display: swap;
    }
    @font-face {
      font-family: "Fraunces";
      src: url("book_assets/fonts/fraunces-latin-600-normal.woff2") format("woff2");
      font-weight: 600; font-style: normal; font-display: swap;
    }
    @font-face {
      font-family: "Fraunces";
      src: url("book_assets/fonts/fraunces-latin-900-normal.woff2") format("woff2");
      font-weight: 900; font-style: normal; font-display: swap;
    }
    @font-face {
      font-family: "Inter";
      src: url("book_assets/fonts/inter-latin-400-normal.woff2") format("woff2");
      font-weight: 400; font-style: normal; font-display: swap;
    }
    @font-face {
      font-family: "Inter";
      src: url("book_assets/fonts/inter-latin-600-normal.woff2") format("woff2");
      font-weight: 600; font-style: normal; font-display: swap;
    }

    :root {
      --papel: #f5f1e6;
      --papel-escuro: #ece6d6;
      --tinta: #181f1e;
      --tinta-suave: #5d6864;
      --fio: #d8d0bf;
      --acento: #0f6866;
      --vinho: #a43754;
      --serif: "Fraunces", Georgia, "Times New Roman", serif;
      --sans: "Inter", system-ui, "Segoe UI", sans-serif;
      --medida: 34em;
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }

    body {
      margin: 0;
      background: var(--papel);
      color: var(--tinta);
      font-family: var(--serif);
      font-size: 1.06rem;
      line-height: 1.7;
    }

    .pular {
      position: absolute; left: -9999px; top: 0;
      padding: 10px 16px; background: var(--tinta); color: var(--papel);
      font-family: var(--sans); z-index: 10;
    }
    .pular:focus { left: 12px; top: 12px; }

    /* ---------- capa ---------- */
    .capa {
      min-height: 100vh;
      display: grid;
      align-items: end;
      position: relative;
      color: var(--papel);
      isolation: isolate;
      overflow: hidden;
    }
    .capa img.fundo {
      position: absolute; inset: 0; z-index: -2;
      width: 100%; height: 100%; object-fit: cover;
    }
    .capa::after {
      content: ""; position: absolute; inset: 0; z-index: -1;
      background: linear-gradient(180deg, rgba(10, 14, 13, .18), rgba(10, 14, 13, .78));
    }
    .capa-conteudo { padding: clamp(28px, 6vw, 88px); max-width: 900px; }
    .kicker {
      margin: 0 0 16px;
      font-family: var(--sans);
      font-size: .74rem; font-weight: 600;
      letter-spacing: .24em; text-transform: uppercase;
      color: #d9c08a;
    }
    .capa h1 {
      margin: 0;
      font-size: clamp(2.6rem, 7.5vw, 6rem);
      font-weight: 900; line-height: .98; letter-spacing: -.01em;
      text-wrap: balance;
    }
    .capa .credito {
      margin: 20px 0 0; font-style: italic;
      color: rgba(245, 241, 230, .85);
      font-size: clamp(1rem, 2vw, 1.2rem);
    }
    .capa .dica {
      margin: 34px 0 0; font-family: var(--sans);
      font-size: .78rem; letter-spacing: .08em;
      color: rgba(245, 241, 230, .62);
    }

    /* ---------- estrutura de páginas ---------- */
    .pagina { padding: clamp(48px, 9vw, 120px) clamp(20px, 6vw, 72px); }
    .miolo { width: min(1180px, 100%); margin: 0 auto; }

    .rotulo {
      display: flex; align-items: center; gap: 14px;
      margin: 0 0 28px;
      font-family: var(--sans);
      font-size: .72rem; font-weight: 600;
      letter-spacing: .2em; text-transform: uppercase;
      color: var(--tinta-suave);
    }
    .rotulo::after { content: ""; flex: 1; height: 1px; background: var(--fio); }

    /* ---------- sumário ---------- */
    .sumario ol {
      margin: 0; padding: 0; list-style: none;
      max-width: 720px;
      counter-reset: cap;
    }
    .sumario li { counter-increment: cap; border-bottom: 1px solid var(--fio); }
    .sumario a {
      display: flex; align-items: baseline; gap: 18px;
      padding: 16px 4px;
      color: inherit; text-decoration: none;
    }
    .sumario a:hover .titulo, .sumario a:focus-visible .titulo { color: var(--acento); }
    .sumario .num {
      font-family: var(--sans); font-weight: 600; font-size: .8rem;
      color: var(--vinho); min-width: 2.2em;
    }
    .sumario .num::before { content: counter(cap, decimal-leading-zero); }
    .sumario .titulo { font-size: clamp(1.15rem, 2.6vw, 1.6rem); font-weight: 600; }
    .sumario .fio { flex: 1; border-bottom: 1px dotted var(--fio); transform: translateY(-4px); }

    /* ---------- abertura de capítulo ---------- */
    .abertura {
      position: relative;
      min-height: 92vh;
      display: grid; align-items: end;
      color: var(--papel);
      isolation: isolate; overflow: hidden;
    }
    .abertura picture, .abertura img.fundo {
      position: absolute; inset: 0; z-index: -2;
      width: 100%; height: 100%;
    }
    .abertura img { width: 100%; height: 100%; object-fit: cover; }
    .abertura::after {
      content: ""; position: absolute; inset: 0; z-index: -1;
      background: linear-gradient(180deg, rgba(10, 14, 13, .05), rgba(10, 14, 13, .72));
    }
    .abertura .numeral {
      position: absolute; top: clamp(8px, 3vw, 36px); right: clamp(16px, 4vw, 48px);
      font-family: var(--serif); font-weight: 900;
      font-size: clamp(5rem, 18vw, 15rem); line-height: 1;
      color: transparent;
      -webkit-text-stroke: 2px rgba(245, 241, 230, .5);
    }
    .abertura-conteudo { padding: clamp(28px, 6vw, 72px); max-width: 820px; }
    .abertura h2 {
      margin: 0;
      font-size: clamp(2.2rem, 6vw, 4.4rem);
      font-weight: 900; line-height: 1.02; text-wrap: balance;
    }
    .abertura .legenda {
      margin: 16px 0 0; font-family: var(--sans);
      font-size: .92rem; color: rgba(245, 241, 230, .82);
      max-width: 520px;
    }

    /* ---------- texto ---------- */
    .pagina-texto .miolo { max-width: calc(var(--medida) + 2 * 72px); }
    .pagina-texto p, .pagina-texto ul { max-width: var(--medida); }
    .pagina-texto p { margin: 0 0 1.1em; }
    .pagina-texto p:first-of-type::first-letter {
      float: left;
      font-weight: 900; font-size: 3.2em; line-height: .9;
      padding: .04em .12em 0 0;
      color: var(--acento);
    }
    .pagina-texto h3 {
      margin: 1.8em 0 .6em;
      font-size: 1.35rem; font-weight: 600; color: var(--acento);
    }
    .pagina-texto ul { padding-left: 1.2em; }
    .pagina-texto li { margin-bottom: .4em; }

    /* ---------- pranchas ---------- */
    .prancha { margin: 0; }
    .prancha img {
      display: block; width: 100%; height: auto;
      background: var(--papel-escuro);
      cursor: zoom-in;
    }
    .prancha figcaption {
      display: flex; gap: 12px; align-items: baseline;
      padding: 12px 2px 0;
      font-family: var(--sans); font-size: .82rem;
      color: var(--tinta-suave);
      border-top: 1px solid var(--fio);
      margin-top: 12px;
    }
    .prancha .num-prancha {
      font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
      font-size: .72rem; color: var(--vinho); white-space: nowrap;
    }
    .prancha--cheia { padding: 0; }
    .prancha--cheia img { max-height: 96vh; object-fit: cover; }
    .prancha--cheia figcaption { padding: 12px clamp(20px, 6vw, 72px) 0; border-top: 0; }
    .pranchas-duplas {
      display: grid; gap: clamp(16px, 3vw, 32px);
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }

    /* ---------- folha de contato ---------- */
    .folha-contato {
      display: grid; gap: 10px;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      background: #141a19; padding: clamp(14px, 2.5vw, 26px);
    }
    .folha-contato img {
      width: 100%; aspect-ratio: 1; object-fit: cover;
      display: block; cursor: zoom-in;
      filter: saturate(.92);
    }
    .folha-contato img:hover, .folha-contato img:focus-visible { outline: 2px solid #d9c08a; }

    /* ---------- colofão ---------- */
    .colofao {
      background: var(--tinta); color: var(--papel);
      text-align: center;
    }
    .colofao .miolo { max-width: 640px; }
    .colofao h2 { font-weight: 600; font-size: 1.5rem; margin: 0 0 12px; }
    .colofao p { color: rgba(245, 241, 230, .78); font-family: var(--sans); font-size: .95rem; }
    .colofao a { color: #d9c08a; }
    .edicoes {
      display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
      margin-top: 28px; font-family: var(--sans); font-size: .86rem;
    }
    .edicoes a {
      padding: 10px 18px;
      border: 1px solid rgba(245, 241, 230, .4);
      border-radius: 2px;
      color: var(--papel); text-decoration: none;
      letter-spacing: .08em; text-transform: uppercase;
    }
    .edicoes a:hover, .edicoes a:focus-visible { border-color: #d9c08a; color: #d9c08a; }

    /* ---------- revelação ---------- */
    .revela { opacity: 0; transform: translateY(18px); transition: opacity .7s ease, transform .7s ease; }
    .revela.visivel { opacity: 1; transform: none; }
    @media (prefers-reduced-motion: reduce) {
      .revela { opacity: 1; transform: none; transition: none; }
    }

    /* ---------- visor (lightbox) ---------- */
    dialog.visor {
      width: 100vw; height: 100vh; max-width: none; max-height: none;
      margin: 0; padding: 0; border: 0;
      background: rgba(8, 11, 11, .96); color: var(--papel);
    }
    dialog.visor::backdrop { background: rgba(8, 11, 11, .96); }
    .visor-conteudo {
      width: 100%; height: 100%;
      display: grid; grid-template-rows: 1fr auto;
      place-items: center; gap: 8px; padding: 20px;
    }
    .visor-conteudo img { max-width: 100%; max-height: calc(100vh - 110px); object-fit: contain; }
    .visor-legenda { font-family: var(--sans); font-size: .85rem; color: rgba(245, 241, 230, .8); text-align: center; }
    .visor-fechar {
      position: fixed; top: 14px; right: 16px;
      background: none; border: 1px solid rgba(245, 241, 230, .4);
      color: var(--papel); font-family: var(--sans); font-size: .8rem;
      padding: 8px 14px; cursor: pointer; letter-spacing: .1em; text-transform: uppercase;
    }
    .visor-nav {
      position: fixed; top: 50%; transform: translateY(-50%);
      background: none; border: 0; color: rgba(245, 241, 230, .75);
      font-size: 2.4rem; cursor: pointer; padding: 18px 12px; line-height: 1;
    }
    .visor-nav:hover, .visor-nav:focus-visible { color: #d9c08a; }
    .visor-ant { left: 6px; }
    .visor-prox { right: 6px; }
  </style>
</head>
<body>
  <a class="pular" href="#sumario">Pular para o sumário</a>

  <header class="capa" data-spread>
    <picture>
      <source type="image/avif" srcset="book_assets/img/cover-matheus-peixaria-480.avif 480w, book_assets/img/cover-matheus-peixaria-960.avif 960w, book_assets/img/cover-matheus-peixaria-1600.avif 1600w" sizes="100vw">
      <source type="image/webp" srcset="book_assets/img/cover-matheus-peixaria-480.webp 480w, book_assets/img/cover-matheus-peixaria-960.webp 960w, book_assets/img/cover-matheus-peixaria-1600.webp 1600w" sizes="100vw">
      <img class="fundo" src="html_preview_assets/images/cover-matheus-peixaria.jpg" alt="" fetchpriority="high">
    </picture>
    <div class="capa-conteudo">
      <p class="kicker">Edição fotográfica</p>
      <h1>Know-How: Manipulação de Pescados</h1>
      <p class="credito">Texto e fotografia de Matheus Felipe Silverio</p>
      <p class="dica">Role para folhear · setas do teclado navegam · clique nas fotos para ampliar</p>
    </div>
  </header>

  <section class="pagina pagina-texto revela" id="apresentacao" data-spread aria-labelledby="titulo-apresentacao">
    <div class="miolo">
      <p class="rotulo" id="titulo-apresentacao">Apresentação</p>
      <p>Aqui mostro o básico, sem enrolação. O objetivo não é executar nem montar o prato — é manipular o pescado e os frutos do mar para entregar o melhor insumo para os processos seguintes. Vamos aprender a &quot;fazer um trabalho dificil&quot; com classe.</p>
      <p>Meu nome é Matheus Felipe Silverio, tenho 13 ano de experiencia em restaurantes mediterrâneos, orientais e frutos do mar, 30 anos de idade, trabalho com manipulação de pescados e frutos do mar em Itajai-SC, sou responsável da setor “peixaria” no aspas restaurante na praia brava, estou á 3 anos junto com o chefe Gabriel Aguilar, na qual a proposta é a entrega desde o recebimento, manipulação ao porcionamento final dos pescados e fruto do mar, junto com maturação e defumação, aonde priorizo o cuidado com o melhor insumo que nossa costa nos proporciona.</p>
      <p>Nesses 3 anos de trabalho intenso, desde toneladas de pescados e frutos do mar até cerimônia kaitai (atum de 100 kg direto da espanha), peixes inimagináveis de diferentes qualidades, diferentes espécies, fora as diversas adaptações e mudanças na forma de trabalhar, hoje trago a conjuntura de 13 anos de anotações e reflexões e 3 anos de intenso trabalho numa peixaria de um chefe que me possibilita sempre mudar e aprimorar. Esse documento é a forma que trabalho e como lido com um insumo tão precioso.</p>
    </div>
  </section>

  <section class="pagina sumario revela" id="sumario" data-spread aria-labelledby="titulo-sumario">
    <div class="miolo">
      <p class="rotulo" id="titulo-sumario">Sumário</p>
      <ol>
        <li><a href="#cap-01"><span class="num"></span><span class="titulo">Fundamentos da Manipulação</span><span class="fio"></span></a></li>
        <li><a href="#cap-02"><span class="num"></span><span class="titulo">Água, Higiene e Armazenamento</span><span class="fio"></span></a></li>
        <li><a href="#cap-03"><span class="num"></span><span class="titulo">Lula</span><span class="fio"></span></a></li>
        <li><a href="#cap-04"><span class="num"></span><span class="titulo">Polvo</span><span class="fio"></span></a></li>
        <li><a href="#cap-05"><span class="num"></span><span class="titulo">Camarão Rosa</span><span class="fio"></span></a></li>
        <li><a href="#cap-06"><span class="num"></span><span class="titulo">Mexilhão</span><span class="fio"></span></a></li>
        <li><a href="#cap-07"><span class="num"></span><span class="titulo">Peixes</span><span class="fio"></span></a></li>
        <li><a href="#cap-08"><span class="num"></span><span class="titulo">Setorização de Filés Grandes</span><span class="fio"></span></a></li>
      </ol>
    </div>
  </section>

  <!-- CAPITULOS: inicio (Task 7 insere os capítulos aqui) -->
  <!-- CAPITULOS: fim -->

  <footer class="pagina colofao" data-spread>
    <div class="miolo">
      <h2>Colofão</h2>
      <p>Texto-base e fotografias de Matheus Felipe Silverio. Edição fotográfica composta em Fraunces e Inter sobre papel digital. Publicado por <a href="https://davidluky.com/">davidluky.com</a>.</p>
      <div class="edicoes">
        <a href="livro/">Edição manual</a>
        <a href="revista/">Edição revista</a>
      </div>
    </div>
  </footer>

  <dialog class="visor" id="visor" aria-label="Visualizador de fotografias">
    <div class="visor-conteudo">
      <img id="visor-imagem" src="" alt="">
      <p class="visor-legenda" id="visor-legenda"></p>
    </div>
    <button class="visor-nav visor-ant" id="visor-ant" aria-label="Fotografia anterior">&#8249;</button>
    <button class="visor-nav visor-prox" id="visor-prox" aria-label="Próxima fotografia">&#8250;</button>
    <button class="visor-fechar" id="visor-fechar">Fechar</button>
  </dialog>

  <script>
    (function () {
      "use strict";

      // Revelação suave ao rolar
      var motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (motionOk && "IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("visivel");
              io.unobserve(entry.target);
            }
          });
        }, { rootMargin: "0px 0px -8% 0px" });
        document.querySelectorAll(".revela").forEach(function (el) { io.observe(el); });
      } else {
        document.querySelectorAll(".revela").forEach(function (el) { el.classList.add("visivel"); });
      }

      // Visor (lightbox)
      var visor = document.getElementById("visor");
      var visorImagem = document.getElementById("visor-imagem");
      var visorLegenda = document.getElementById("visor-legenda");
      var fotos = Array.prototype.slice.call(
        document.querySelectorAll(".prancha img, .folha-contato img")
      );
      var atual = -1;

      function legendaDe(img) {
        var figura = img.closest("figure");
        var legenda = figura ? figura.querySelector("figcaption") : null;
        return legenda ? legenda.textContent.trim() : (img.alt || "");
      }

      function mostrar(indice) {
        if (indice < 0 || indice >= fotos.length) return;
        atual = indice;
        var img = fotos[indice];
        visorImagem.src = img.currentSrc || img.src;
        visorImagem.alt = img.alt || "";
        visorLegenda.textContent = legendaDe(img);
        if (!visor.open) visor.showModal();
      }

      fotos.forEach(function (img, indice) {
        img.tabIndex = 0;
        img.addEventListener("click", function () { mostrar(indice); });
        img.addEventListener("keydown", function (evento) {
          if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            mostrar(indice);
          }
        });
      });

      document.getElementById("visor-fechar").addEventListener("click", function () { visor.close(); });
      document.getElementById("visor-ant").addEventListener("click", function () { mostrar(atual - 1); });
      document.getElementById("visor-prox").addEventListener("click", function () { mostrar(atual + 1); });
      visor.addEventListener("click", function (evento) {
        if (evento.target === visor) visor.close();
      });

      // Navegação por teclado: no visor navega fotos; fora dele navega spreads
      var spreads = Array.prototype.slice.call(document.querySelectorAll("[data-spread]"));
      function spreadAtual() {
        var meio = window.scrollY + window.innerHeight / 2;
        for (var i = spreads.length - 1; i >= 0; i -= 1) {
          if (spreads[i].offsetTop <= meio) return i;
        }
        return 0;
      }
      document.addEventListener("keydown", function (evento) {
        if (visor.open) {
          if (evento.key === "ArrowRight") mostrar(atual + 1);
          if (evento.key === "ArrowLeft") mostrar(atual - 1);
          return;
        }
        if (evento.target !== document.body) return;
        if (evento.key === "ArrowRight") {
          evento.preventDefault();
          var proximo = Math.min(spreadAtual() + 1, spreads.length - 1);
          spreads[proximo].scrollIntoView({ behavior: motionOk ? "smooth" : "auto" });
        }
        if (evento.key === "ArrowLeft") {
          evento.preventDefault();
          var anterior = Math.max(spreadAtual() - 1, 0);
          spreads[anterior].scrollIntoView({ behavior: motionOk ? "smooth" : "auto" });
        }
      });
    })();
  </script>
</body>
</html>
```

- [ ] **Step 2: Build and eyeball**

Run: `npx astro build`, then `npx wrangler dev` and open `http://matheus.localhost:8787/` in a browser (log in first). Expected: cover with the peixaria photo, Apresentação with drop cap, sumário listing 8 chapters (links dead until Task 7), colophon. Arrow keys jump between sections. No console errors.

- [ ] **Step 3: Run verify and commit**

Run: `npm run verify` — expected PASS (note: `validate-site.mjs` checks links in `dist`; the `#cap-NN` anchors do not exist yet — if the validator flags them, do Task 7 before committing, otherwise commit now).

```powershell
git add public/matheus/index.html
git commit -m "feat: replace Matheus selector with photobook edition shell"
```

---

### Task 7: Chapter content build-out

**Files:**
- Modify: `public/matheus/index.html` (fill between `<!-- CAPITULOS: inicio -->` and `<!-- CAPITULOS: fim -->`)
- Read-only source: `public/matheus/livro/index.html` (canonical text; do not modify)

**Interfaces:**
- Consumes from Task 6: layout classes `abertura`, `pagina-texto`, `prancha`, `prancha--cheia`, `pranchas-duplas`, `folha-contato`, `revela`, `data-spread`; derivative naming from Task 5.
- Produces: chapters `cap-01` … `cap-08` matching the sumário anchors.

**Source map.** In `public/matheus/livro/index.html` each chapter starts at a `chapter-opener` section whose kicker text is `Capítulo NN` (search for that marker). Chapter order and titles:

| Anchor | Título | Search marker in livro |
|--------|--------|------------------------|
| `cap-01` | Fundamentos da Manipulação | `Capítulo 01` |
| `cap-02` | Água, Higiene e Armazenamento | `Capítulo 02` |
| `cap-03` | Lula | `Capítulo 03` |
| `cap-04` | Polvo | `Capítulo 04` |
| `cap-05` | Camarão Rosa | `Capítulo 05` |
| `cap-06` | Mexilhão | `Capítulo 06` |
| `cap-07` | Peixes | `Capítulo 07` |
| `cap-08` | Setorização de Filés Grandes | `Capítulo 08` |

**Conversion rules** (mechanical, apply to every chapter):

1. The livro `chapter-opener` becomes an `abertura`: its `<img>` becomes the background `<picture>` (derivative naming: strip the extension from the livro image filename, then `book_assets/img/<basename>-{480,960,1600}.{avif,webp}`, fallback `html_preview_assets/images/<basename>.jpg` — note the livro references images as `../html_preview_assets/...`, the photobook drops the `../`). The `chapter-caption` text becomes `.legenda`.
2. Consecutive livro `text-page` sections merge into one `pagina-texto` per run of text; keep `<p>`, `<ul class="compact-list">` becomes plain `<ul>`, `<h3>` stays `<h3>`. Copy the text **verbatim** — no rewriting, it is Matheus's voice.
3. Each livro `manual-figure` becomes a `prancha` (single image) or a `pranchas-duplas` grid of two `prancha`s (when the livro used `figure-grid count-2`). Number pranchas sequentially per chapter (`Prancha 1`, `Prancha 2`, …) in the `num-prancha` span; the livro `figcaption` text becomes the caption body. Keep the livro `alt` text verbatim.
4. Livro `visual-plate` sections (e.g. "Gordura, fibra e corte") become `prancha--cheia` full-bleed figures; their `<h2 class="added">` title goes into the caption as `<strong>Título.</strong> ` before the caption text.
5. Where the livro shows series of similar shots (the contact-sheet folders `atum_*.jpg`, `camarao_*.jpg` under `html_preview_assets/contact_sheets/`), add one `folha-contato` grid at the end of the matching chapter (atum → cap-08, camarão → cap-05) listing every image in the folder as a bare `<img>` with `loading="lazy"` and the livro-style alt text pattern "Folha de contato: <espécie>, quadro NN".
6. Every new `<section>` gets `class="... revela"` and `data-spread`; every `<img>` outside the abertura gets `loading="lazy" decoding="async"`.

**Fully worked example — Capítulo 01 opener + first spreads** (this exact markup goes in first; continue the same pattern for the rest of the chapter and the remaining chapters):

```html
<section class="abertura revela" id="cap-01" data-spread aria-labelledby="titulo-cap-01">
  <span class="numeral" aria-hidden="true">01</span>
  <picture>
    <source type="image/avif" srcset="book_assets/img/hero-fundamentos-da-manipulacao-480.avif 480w, book_assets/img/hero-fundamentos-da-manipulacao-960.avif 960w, book_assets/img/hero-fundamentos-da-manipulacao-1600.avif 1600w" sizes="100vw">
    <source type="image/webp" srcset="book_assets/img/hero-fundamentos-da-manipulacao-480.webp 480w, book_assets/img/hero-fundamentos-da-manipulacao-960.webp 960w, book_assets/img/hero-fundamentos-da-manipulacao-1600.webp 1600w" sizes="100vw">
    <img class="fundo" src="html_preview_assets/images/hero-fundamentos-da-manipulacao.jpg" alt="Destaque do capítulo: limpeza fria e manipulação inicial do pescado." loading="lazy" decoding="async">
  </picture>
  <div class="abertura-conteudo">
    <h2 id="titulo-cap-01">Fundamentos da Manipulação</h2>
    <p class="legenda">Limpeza fria e manipulação inicial do pescado.</p>
  </div>
</section>

<section class="pagina pagina-texto revela" data-spread>
  <div class="miolo">
    <p class="rotulo">Capítulo 01 · Fundamentos</p>
    <p>Vou falar sobre osmose e as formas de usar o sal como realçador e conservador, com as devidas cautelas</p>
    <p>O que é osmose simplificadamente, é a troca natural de água entre o alimente e o ambiente</p>
    <p>Quando aplicamos sal em um peixe, o sal começa a puxar parte da água presente na carne para fora, mas a o mesmo tempo o sal vai penetrando no alimento, ajudando a firmar a carne, concentrando sabores e conservando o produto.</p>
    <ul>
      <li>Solução para limpeza : água, sal e muito gelo</li>
      <li>Brine: cura submersa por liquido, que evita a contração das fibras e tempera o file por inteiro</li>
      <li>Shiojime: cura seca, realçadora e superficial nos files do pescado.</li>
    </ul>
  </div>
</section>

<section class="pagina revela" data-spread>
  <div class="miolo">
    <div class="pranchas-duplas">
      <figure class="prancha">
        <img src="html_preview_assets/images/fig-01-limpeza-inicial-em-gelo-reforcando-a-ideia-de.jpg" srcset="book_assets/img/fig-01-limpeza-inicial-em-gelo-reforcando-a-ideia-de-480.webp 480w, book_assets/img/fig-01-limpeza-inicial-em-gelo-reforcando-a-ideia-de-960.webp 960w" sizes="(min-width: 700px) 48vw, 100vw" alt="Limpeza inicial em gelo, reforçando a ideia de baixa temperatura e controle de água residual." loading="lazy" decoding="async">
        <figcaption><span class="num-prancha">Prancha 1</span> Limpeza inicial em gelo: baixa temperatura e controle de água residual.</figcaption>
      </figure>
      <figure class="prancha">
        <img src="html_preview_assets/images/fig-02-limpeza-inicial-em-gelo-reforcando-a-ideia-de.jpg" srcset="book_assets/img/fig-02-limpeza-inicial-em-gelo-reforcando-a-ideia-de-480.webp 480w, book_assets/img/fig-02-limpeza-inicial-em-gelo-reforcando-a-ideia-de-960.webp 960w" sizes="(min-width: 700px) 48vw, 100vw" alt="Limpeza inicial em gelo, reforçando a ideia de baixa temperatura e controle de água residual." loading="lazy" decoding="async">
        <figcaption><span class="num-prancha">Prancha 2</span> O mesmo processo visto de outro ângulo.</figcaption>
      </figure>
    </div>
  </div>
</section>
```

(For simple `<img>` in text-adjacent pranchas the `srcset` may use only the WebP derivatives as above; the full `<picture>` with AVIF is required for aberturas and `prancha--cheia`, which are the largest images.)

- [ ] **Step 1: Build chapters 01 and 02** following the rules and example above. Run `npx astro build` and view in the browser via `npx wrangler dev`. Expected: sumário links 01-02 work; images load; lightbox opens the new pranchas.
- [ ] **Step 2: Commit** — `git add public/matheus/index.html` / `git commit -m "feat: photobook chapters 01-02"`.
- [ ] **Step 3: Build chapters 03-06** (Lula, Polvo, Camarão Rosa + camarão contact sheet, Mexilhão). Build, view, commit: `git commit -m "feat: photobook chapters 03-06"`.
- [ ] **Step 4: Build chapters 07-08** (Peixes — the largest chapter; Setorização de Filés Grandes + atum contact sheet). Build, view, commit: `git commit -m "feat: photobook chapters 07-08"`.
- [ ] **Step 5: Full pass** — read the whole page top to bottom in the browser at desktop and mobile widths (devtools). Checklist: every sumário link lands on its chapter; every image has alt text; keyboard-only navigation works (tab to a photo, Enter opens visor, Esc closes); no horizontal scrollbar at 375px.
- [ ] **Step 6: Run `npm run verify`** — expected PASS. Commit any fixes.

---

### Task 8: Integration polish

**Files:**
- Modify: `public/matheus/404.html`
- Modify: `src/data/projects.ts` (entry `matheus-manual-pescados`, ~line 398)
- Modify: `docs/matheus-manual-deployment-2026-06-26.md` (update note)

**Interfaces:**
- Consumes: the shipped photobook and gate.

- [ ] **Step 1: Restyle `public/matheus/404.html`** to match the photobook: reuse the login page's palette and fonts (Georgia fallback is fine), dark background, message "Página não encontrada" and a link "Voltar ao livro" pointing to `/`. Keep it a small self-contained file with inline CSS like the login page.

- [ ] **Step 2: Update the project card** in `src/data/projects.ts` (`id: "matheus-manual-pescados"`):
  - `description`: `"Password-protected photography-book edition of a seafood handling manual, served by the site Worker with a signed-cookie gate, responsive AVIF/WebP plates, and the original manual and magazine layouts as alternate editions."`
  - `descriptionPt`: `"Edição fotográfica protegida por senha de um manual de manipulação de pescados, servida pelo Worker do site com sessão assinada por cookie, pranchas responsivas em AVIF/WebP e as diagramações originais de manual e revista como edições alternativas."`
  - `metrics`: `["Password gate", "8 photo chapters", "AVIF/WebP plates"]`
  - `metricsPt`: `["Acesso com senha", "8 capítulos fotográficos", "Pranchas AVIF/WebP"]`
  - Leave `status`, `visibility`, `liveUrl`, `image` unchanged (open question D10 for David; the screenshot refresh happens in Task 10).

- [ ] **Step 3: Append an update note** to `docs/matheus-manual-deployment-2026-06-26.md` under a new `## Update 2026-07 — Photobook + gate` heading: the site is now gated by the Worker (`src/matheus-gate.ts`, secrets `MATHEUS_PASSWORD` / `MATHEUS_SESSION_SECRET`), `/` is the photobook edition, the selector page is gone, livro/revista unchanged, and the "Update Procedure" section's step 2 no longer replaces `public/matheus/index.html` (it is now hand-authored like the old selector).

- [ ] **Step 4: Verify and commit**

Run: `npm run verify` — expected PASS.

```powershell
git add public/matheus/404.html src/data/projects.ts docs/matheus-manual-deployment-2026-06-26.md
git commit -m "feat: align 404, project card, and docs with gated photobook"
```

---

### Task 9: Final verification and deploy runbook

**Files:** none created; this is the release gate.

- [ ] **Step 1: Full local verification**

```powershell
npm run verify
npx wrangler deploy --dry-run
```

Expected: both PASS.

- [ ] **Step 2: Full manual smoke via `npx wrangler dev`** (browser at `http://matheus.localhost:8787`): fresh profile/incognito → cover/login page → wrong password shows "Senha incorreta" → right password opens the photobook → `/livro/` and `/revista/` still render → arrow keys, lightbox, mobile width all behave.

- [ ] **Step 3: Confirm production secrets exist** (Task 4 Step 3). Without them the deploy will 503 the manual.

- [ ] **Step 4: STOP — ask David for approval to push.** Pushing to `main` deploys to production. Show him the summary of commits and wait for an explicit yes.

- [ ] **Step 5: After approved push, smoke test production**

```powershell
curl.exe -s -o NUL -w "%{http_code} %{redirect_url}`n" https://matheus.davidluky.com/
# expected: 302 https://matheus.davidluky.com/entrar/
curl.exe -s -o NUL -w "%{http_code}`n" https://matheus.davidluky.com/entrar/
# expected: 200
curl.exe -s -o NUL -w "%{http_code}`n" https://matheus.davidluky.com/html_preview_assets/images/cover-matheus-peixaria.jpg
# expected: 302 (gated!)
curl.exe -s -o NUL -w "%{http_code} %{redirect_url}`n" https://davidluky.com/matheus/livro/index.html
# expected: 301 https://matheus.davidluky.com/livro/index.html
curl.exe -s -o NUL -w "%{http_code}`n" https://davidluky.com/
# expected: 200 (main site untouched)
```

Then log in via a real browser and click through the book.

---

### Task 10: Quick wins on the other sites (time-boxed, optional)

**Files:** varies per site; keep every change small and committed separately per repo.

Time-box: at most ~30 minutes per site. Skip anything that turns into a project; log it in that repo's docs instead.

- [x] **davidluky.com** — refresh the Matheus card screenshot from the final authenticated three-edition selector (an intentional deviation from the original login-cover capture), save as `public/projects/matheus-manual-pescados.webp` in the same 1200×750 WebP format, rebuild, verify, commit.
- [x] **alisson.davidluky.com** (Astro) — `npm install && npm run build`; fix any build warnings; check `<title>`/description/OG tags on the home page; verify mobile nav at 375px.
- [x] **tibia-services** (Next.js) — `npm install && npm run build`; check for broken internal links and missing OG/meta on the main pages.
- [x] **franks-stories** (Next.js) — `npm install && npm run build`; same meta/link check; confirm the story reader renders on mobile width.
- [x] **the-room-web** (Vite/React) — `npm install && npm run test && npm run build`; fix only trivial breakage.
- [x] **matematica-davidluky** — `npm install && npm run build` (or open the static entry point if there is no build); check links and meta.
- [x] For each site: if anything nontrivial surfaces, write it down in that repo (README or docs/) rather than fixing it now.

---

## Self-review notes

- Spec coverage: D1-D9 → Tasks 1-4; photobook (goals 2, D7-D8) → Tasks 5-7; D10 + docs → Task 8; rollout → Task 9; quick wins → Task 10. Open questions from the spec stay open for David; none block Tasks 1-8.
- Type consistency: gate exports used in Task 3 match Task 1's signatures; derivative naming in Tasks 6-7 matches Task 5's script output; login form contract (field `senha`, `?erro=1`, `?voltar=`) matches between Tasks 2 and 3.
- Known judgment calls the executor may hit: `astro check` type coverage of `tests/` (Task 3 Step 6 has the fallback), `validate-site.mjs` link checking of in-page anchors (Task 6 Step 3 has the ordering note), fontsource file names (Task 5 Step 4 has the fallback).
