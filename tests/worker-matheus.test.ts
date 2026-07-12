import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
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
    // Cast: tests only exercise paths whose required environment fields are supplied.
  } as Parameters<typeof worker.fetch>[1];
}

async function authCookie(): Promise<string> {
  return `${SESSION_COOKIE_NAME}=${await signSession(SECRET, Date.now() + 60_000)}`;
}

describe("matheus gate", () => {
  it("routes every asset path through the hostname-aware Worker", () => {
    const wrangler = readFileSync(new URL("../wrangler.toml", import.meta.url), "utf8");
    expect(wrangler).toMatch(/^run_worker_first\s*=\s*true$/m);
  });

  it("redirects unauthenticated visitors to /entrar/ without caching", async () => {
    const response = await worker.fetch(
      new Request("https://matheus.davidluky.com/"),
      makeEnv(),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://matheus.davidluky.com/entrar/");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
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
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("serves gate assets without a session", async () => {
    const response = await worker.fetch(
      new Request("https://matheus.davidluky.com/gate_assets/capa.jpg"),
      makeEnv(),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, max-age=600");
  });

  it("does not expose the Matheus 404 page without a session", async () => {
    const response = await worker.fetch(
      new Request("https://matheus.davidluky.com/404.html"),
      makeEnv(),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toContain("voltar=%2F404.html");
  });

  it("serves content with a valid session and sets private headers", async () => {
    const response = await worker.fetch(
      new Request("https://matheus.davidluky.com/", { headers: { cookie: await authCookie() } }),
      makeEnv(),
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("asset:/matheus/");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(response.headers.get("cache-control")).toBe("private, max-age=600");
  });

  it("preserves the nearest nested 404 returned by Assets", async () => {
    let assetFetches = 0;
    const response = await worker.fetch(
      new Request("https://matheus.davidluky.com/nao-existe", {
        headers: { cookie: await authCookie() },
      }),
      makeEnv({
        ASSETS: {
          fetch: async (request: Request) => {
            assetFetches += 1;
            const path = new URL(request.url).pathname;
            if (path === "/matheus/nao-existe") {
              return new Response("matheus-404", { status: 404 });
            }
            throw new Error(`Unexpected asset request: ${path}`);
          },
        },
      }),
    );
    expect(response.status).toBe(404);
    expect(await response.text()).toBe("matheus-404");
    expect(assetFetches).toBe(1);
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("gates the local development hostname", async () => {
    const response = await worker.fetch(
      new Request("http://matheus.localhost:8787/"),
      makeEnv(),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("http://matheus.localhost:8787/entrar/");
  });

  it("redirects an authenticated visitor away from /entrar/ without caching", async () => {
    const response = await worker.fetch(
      new Request("https://matheus.davidluky.com/entrar/", {
        headers: { cookie: await authCookie() },
      }),
      makeEnv(),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://matheus.davidluky.com/");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("sets a hardened session cookie on correct password and honors voltar", async () => {
    const response = await worker.fetch(
      new Request("https://matheus.davidluky.com/entrar/?voltar=%2Flivro%2F", {
        method: "POST",
        body: new URLSearchParams({ senha: PASSWORD }),
      }),
      makeEnv(),
    );
    const cookie = response.headers.get("set-cookie");
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/livro/");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(cookie).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(cookie).toContain("Max-Age=2592000");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Lax");
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
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it.each([
    { MATHEUS_PASSWORD: undefined, MATHEUS_SESSION_SECRET: undefined },
    { MATHEUS_PASSWORD: undefined },
    { MATHEUS_SESSION_SECRET: undefined },
  ])("fails closed with 503 when secrets are missing", async (missing) => {
    const response = await worker.fetch(
      new Request("https://matheus.davidluky.com/"),
      makeEnv(missing),
    );
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("redirects the main-host /matheus/* bypass to the HTTPS subdomain", async () => {
    const response = await worker.fetch(
      new Request("http://davidluky.com/matheus/livro/index.html"),
      makeEnv(),
    );
    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(
      "https://matheus.davidluky.com/livro/index.html",
    );
  });

  it("redirects the main-host /matheus root to the subdomain root", async () => {
    const response = await worker.fetch(
      new Request("https://davidluky.com/matheus"),
      makeEnv(),
    );
    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe("https://matheus.davidluky.com/");
  });

  it("leaves other main-host paths untouched", async () => {
    const response = await worker.fetch(
      new Request("https://davidluky.com/projects"),
      makeEnv(),
    );
    expect(await response.text()).toBe("asset:/projects");
  });
});

describe("eBay route regression", () => {
  it("keeps the existing missing-token challenge response", async () => {
    const response = await worker.fetch(
      new Request("https://davidluky.com/ebay/deletion?challenge_code=test"),
      makeEnv({ EBAY_VERIFICATION_TOKEN: undefined }),
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "eBay verification token is not configured.",
    });
  });
});
