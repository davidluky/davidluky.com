import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
  parseCookies,
  safeReturnPath,
  signSession,
  verifyPassword,
  verifySession,
} from "./matheus-gate";

const DEFAULT_EBAY_ENDPOINT_URL = "https://davidluky.com/ebay/deletion";
const EBAY_PRODUCTION_API = "https://api.ebay.com";
const EBAY_SANDBOX_API = "https://api.sandbox.ebay.com";
const EBAY_PRODUCTION_OAUTH = "https://api.ebay.com/identity/v1/oauth2/token";
const EBAY_SANDBOX_OAUTH = "https://api.sandbox.ebay.com/identity/v1/oauth2/token";
const EBAY_SCOPE = "https://api.ebay.com/oauth/api_scope";
const PUBLIC_KEY_CACHE_TTL_MS = 60 * 60 * 1000;
const PUBLIC_KEY_NEGATIVE_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_PUBLIC_KEY_CACHE_ENTRIES = 64;
const MAX_PUBLIC_KEY_LOOKUP_FAILURES = 10;
const PUBLIC_KEY_FAILURE_WINDOW_MS = 60 * 1000;
// eBay key ids are opaque UUID-style tokens. The kid arrives inside an unauthenticated
// header, so anything outside that shape is rejected before it can cost a subrequest.
const EBAY_KID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;
const ACCESS_TOKEN_CACHE_SKEW_MS = 60 * 1000;
const EBAY_FETCH_TIMEOUT_MS = 10 * 1000;
const MAX_EBAY_BODY_BYTES = 256 * 1024;
const MAX_EBAY_CHALLENGE_LENGTH = 512;
const MAX_MATHEUS_LOGIN_BODY_BYTES = 16 * 1024;
const DEFAULT_MATHEUS_SESSION_EPOCH = "1";
const MATHEUS_HOSTS = new Set([
  "matheus.davidluky.com",
  "manual-matheus.davidluky.com",
  "matheus.localhost",
]);
const MATHEUS_ASSET_PREFIX = "/matheus";

// Cloudflare rate-limiting binding, declared as `[[ratelimits]]` in wrangler.toml.
interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface Env {
  ASSETS: { fetch: typeof fetch };
  MATHEUS_PASSWORD?: string;
  MATHEUS_SESSION_SECRET?: string;
  MATHEUS_SESSION_EPOCH?: string;
  MATHEUS_LOGIN_LIMITER?: RateLimiter;
  EBAY_VERIFICATION_TOKEN?: string;
  EBAY_ENDPOINT_URL?: string;
  EBAY_CLIENT_ID?: string;
  EBAY_CLIENT_SECRET?: string;
  EBAY_ENVIRONMENT?: "production" | "sandbox";
}

interface EbaySignatureHeader {
  alg: string;
  kid: string;
  signature: string;
  digest: string;
}

interface EbayPublicKey {
  algorithm: string;
  digest: string;
  key: string;
}

interface EbayDeletionPayload {
  metadata: {
    topic: "MARKETPLACE_ACCOUNT_DELETION";
    schemaVersion: string;
    deprecated?: boolean;
  };
  notification: {
    notificationId: string;
    eventDate: string;
    publishDate: string;
    publishAttemptCount: number;
    data: {
      username?: string;
      userId: string;
      eiasToken: string;
    };
  };
}

let cachedAccessToken: { cacheKey: string; token: string; expiresAt: number } | null = null;
// A null key is a cached failure: it keeps a replayed bad kid from re-hitting eBay.
const publicKeyCache = new Map<string, { key: EbayPublicKey | null; expiresAt: number }>();
let publicKeyLookupFailures = 0;
let publicKeyFailureWindowStartedAt = 0;

function json(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...init?.headers,
    },
  });
}

function getEndpointUrl(env: Env): string {
  return env.EBAY_ENDPOINT_URL || DEFAULT_EBAY_ENDPOINT_URL;
}

async function computeChallengeResponse(challengeCode: string, verificationToken: string, endpointUrl: string): Promise<string> {
  const data = new TextEncoder().encode(challengeCode + verificationToken + endpointUrl);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function decodeBase64UrlOrBase64(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function parseSignatureHeader(header: string | null): EbaySignatureHeader | null {
  if (!header) return null;

  try {
    const decoded = new TextDecoder().decode(decodeBase64UrlOrBase64(header));
    const parsed = JSON.parse(decoded) as Partial<EbaySignatureHeader>;
    if (
      typeof parsed.alg === "string" &&
      typeof parsed.kid === "string" &&
      EBAY_KID_PATTERN.test(parsed.kid) &&
      typeof parsed.signature === "string" &&
      typeof parsed.digest === "string"
    ) {
      return parsed as EbaySignatureHeader;
    }
  } catch {
    return null;
  }

  return null;
}

function getEbayHosts(env: Env): { api: string; oauth: string } {
  return env.EBAY_ENVIRONMENT === "sandbox"
    ? { api: EBAY_SANDBOX_API, oauth: EBAY_SANDBOX_OAUTH }
    : { api: EBAY_PRODUCTION_API, oauth: EBAY_PRODUCTION_OAUTH };
}

function ebayFetch(input: string, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    redirect: "error",
    signal: AbortSignal.timeout(EBAY_FETCH_TIMEOUT_MS),
  });
}

async function readRequestTextWithinLimit(
  request: Request,
  maxBytes: number,
): Promise<{ ok: true; text: string } | { ok: false }> {
  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const declaredBytes = Number(contentLength);
    if (Number.isFinite(declaredBytes) && declaredBytes > maxBytes) return { ok: false };
  }

  if (!request.body) return { ok: true, text: "" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        return { ok: false };
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, text: new TextDecoder().decode(body) };
}

async function getAccessToken(env: Env): Promise<string> {
  const cacheKey = `${env.EBAY_ENVIRONMENT || "production"}:${env.EBAY_CLIENT_ID || ""}`;
  if (
    cachedAccessToken &&
    cachedAccessToken.cacheKey === cacheKey &&
    cachedAccessToken.expiresAt > Date.now()
  ) {
    return cachedAccessToken.token;
  }

  if (!env.EBAY_CLIENT_ID || !env.EBAY_CLIENT_SECRET) {
    throw new Error("EBAY_CLIENT_ID and EBAY_CLIENT_SECRET are required to verify eBay notification signatures.");
  }

  const { oauth } = getEbayHosts(env);
  const credentials = btoa(`${env.EBAY_CLIENT_ID}:${env.EBAY_CLIENT_SECRET}`);
  const response = await ebayFetch(oauth, {
    method: "POST",
    headers: {
      authorization: `Basic ${credentials}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: EBAY_SCOPE,
    }),
  });

  if (!response.ok) {
    throw new Error(`eBay OAuth failed with HTTP ${response.status}.`);
  }

  const token = (await response.json()) as { access_token?: string; expires_in?: number };
  if (
    !token.access_token ||
    typeof token.expires_in !== "number" ||
    !Number.isFinite(token.expires_in) ||
    token.expires_in <= 0
  ) {
    throw new Error("eBay OAuth returned an invalid access token response.");
  }

  cachedAccessToken = {
    cacheKey,
    token: token.access_token,
    expiresAt: Date.now() + token.expires_in * 1000 - ACCESS_TOKEN_CACHE_SKEW_MS,
  };
  return cachedAccessToken.token;
}

function cachePublicKey(cacheKey: string, key: EbayPublicKey | null, ttlMs: number): void {
  if (!publicKeyCache.has(cacheKey) && publicKeyCache.size >= MAX_PUBLIC_KEY_CACHE_ENTRIES) {
    const oldest = publicKeyCache.keys().next().value;
    if (oldest !== undefined) publicKeyCache.delete(oldest);
  }
  publicKeyCache.set(cacheKey, { key, expiresAt: Date.now() + ttlMs });
}

// Forged notifications can carry an unlimited supply of unseen kids, and every miss
// would otherwise become one or two live eBay calls. Cap the failures this isolate is
// willing to pay for per minute so the real compliance endpoint is not rate-limited.
function allowPublicKeyLookup(): boolean {
  const now = Date.now();
  if (now - publicKeyFailureWindowStartedAt > PUBLIC_KEY_FAILURE_WINDOW_MS) {
    publicKeyFailureWindowStartedAt = now;
    publicKeyLookupFailures = 0;
  }
  return publicKeyLookupFailures < MAX_PUBLIC_KEY_LOOKUP_FAILURES;
}

// `unknownKid` separates "eBay says this key id does not exist" from a transient
// failure: only the former is safe to remember, so a real notification retried after
// an eBay outage is not answered from a stale negative cache entry.
class EbayPublicKeyError extends Error {
  readonly unknownKid: boolean;

  constructor(message: string, unknownKid: boolean) {
    super(message);
    this.unknownKid = unknownKid;
  }
}

async function fetchPublicKey(api: string, kid: string, env: Env): Promise<EbayPublicKey> {
  const token = await getAccessToken(env);
  const response = await ebayFetch(`${api}/commerce/notification/v1/public_key/${encodeURIComponent(kid)}`, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new EbayPublicKeyError(
      `eBay public key lookup failed with HTTP ${response.status}.`,
      response.status === 400 || response.status === 404,
    );
  }

  const publicKey = (await response.json()) as EbayPublicKey;
  if (!publicKey.key || !publicKey.algorithm || !publicKey.digest) {
    throw new Error("eBay public key response is missing required fields.");
  }
  return publicKey;
}

async function getPublicKey(kid: string, env: Env): Promise<EbayPublicKey> {
  const { api } = getEbayHosts(env);
  const cacheKey = `${api}:${kid}`;
  const cached = publicKeyCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    if (!cached.key) throw new Error("eBay public key lookup already failed for this kid.");
    return cached.key;
  }

  if (!allowPublicKeyLookup()) {
    throw new Error("Too many failed eBay public key lookups; not calling eBay again yet.");
  }

  let publicKey: EbayPublicKey;
  try {
    publicKey = await fetchPublicKey(api, kid, env);
  } catch (error) {
    publicKeyLookupFailures += 1;
    if (error instanceof EbayPublicKeyError && error.unknownKid) {
      cachePublicKey(cacheKey, null, PUBLIC_KEY_NEGATIVE_CACHE_TTL_MS);
    }
    throw error;
  }

  cachePublicKey(cacheKey, publicKey, PUBLIC_KEY_CACHE_TTL_MS);
  return publicKey;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const body = pem
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s/g, "");
  return toArrayBuffer(decodeBase64UrlOrBase64(body));
}

function derEcdsaSignatureToRaw(signature: Uint8Array): Uint8Array {
  if (signature[0] !== 0x30) return signature;

  let offset = 2;
  if (signature[1] & 0x80) {
    offset = 2 + (signature[1] & 0x7f);
  }

  if (signature[offset] !== 0x02) return signature;
  const rLength = signature[offset + 1];
  const rStart = offset + 2;
  const r = signature.slice(rStart, rStart + rLength);

  const sOffset = rStart + rLength;
  if (signature[sOffset] !== 0x02) return signature;
  const sLength = signature[sOffset + 1];
  const sStart = sOffset + 2;
  const s = signature.slice(sStart, sStart + sLength);

  const raw = new Uint8Array(64);
  raw.set(r.slice(-32), 32 - Math.min(r.length, 32));
  raw.set(s.slice(-32), 64 - Math.min(s.length, 32));
  return raw;
}

function signatureHash(digest: string): "SHA-1" | "SHA-256" | null {
  const normalized = digest.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (normalized === "SHA256") return "SHA-256";
  if (normalized === "SHA1") return "SHA-1";
  return null;
}

function isEcdsaAlgorithm(algorithm: string): boolean {
  const normalized = algorithm.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return (
    normalized === "ECDSA" ||
    normalized === "ELLIPTICCURVEDIGITALSIGNATUREALGORITHM" ||
    normalized === "ELLIPTICCURVEDIGITALSIGNATUREALGORITHMECDSA"
  );
}

async function verifyEbaySignature(signatureHeader: EbaySignatureHeader, body: string, env: Env): Promise<boolean> {
  // Everything the header alone can invalidate is checked before the key lookup, so a
  // forged header never buys an outbound eBay call.
  if (!isEcdsaAlgorithm(signatureHeader.alg)) return false;
  const headerHash = signatureHash(signatureHeader.digest);
  if (!headerHash) return false;

  const publicKey = await getPublicKey(signatureHeader.kid, env);
  if (!isEcdsaAlgorithm(publicKey.algorithm)) return false;
  const publicKeyHash = signatureHash(publicKey.digest);
  if (!publicKeyHash || headerHash !== publicKeyHash) return false;
  const key = await crypto.subtle.importKey(
    "spki",
    pemToArrayBuffer(publicKey.key),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"],
  );
  const signature = derEcdsaSignatureToRaw(decodeBase64UrlOrBase64(signatureHeader.signature));

  return crypto.subtle.verify(
    { name: "ECDSA", hash: headerHash },
    key,
    toArrayBuffer(signature),
    new TextEncoder().encode(body),
  );
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function requestMediaType(request: Request): string {
  return (request.headers.get("content-type") || "")
    .split(";", 1)[0]
    .trim()
    .toLowerCase();
}

function isEbayDeletionPayload(value: unknown): value is EbayDeletionPayload {
  const payload = value as Partial<EbayDeletionPayload>;
  const metadata = payload.metadata;
  const notification = payload.notification;
  const data = notification?.data;

  return (
    metadata?.topic === "MARKETPLACE_ACCOUNT_DELETION" &&
    isString(metadata.schemaVersion) &&
    isString(notification?.notificationId) &&
    isString(notification.eventDate) &&
    isString(notification.publishDate) &&
    typeof notification.publishAttemptCount === "number" &&
    data !== undefined &&
    isString(data.userId) &&
    isString(data.eiasToken)
  );
}

async function handleEbayChallenge(request: Request, env: Env): Promise<Response> {
  const verificationToken = env.EBAY_VERIFICATION_TOKEN;
  if (!verificationToken) {
    return json({ error: "eBay verification token is not configured." }, { status: 503 });
  }

  const url = new URL(request.url);
  const challengeCode = url.searchParams.get("challenge_code");
  if (!challengeCode || challengeCode.length > MAX_EBAY_CHALLENGE_LENGTH) {
    return json({ error: "missing challenge_code" }, { status: 400 });
  }

  const challengeResponse = await computeChallengeResponse(challengeCode, verificationToken, getEndpointUrl(env));
  return json({ challengeResponse });
}

async function handleEbayDeletionNotification(request: Request, env: Env): Promise<Response> {
  const signatureHeader = parseSignatureHeader(request.headers.get("x-ebay-signature"));
  if (!signatureHeader) {
    return json({ error: "missing or invalid x-ebay-signature" }, { status: 412 });
  }

  if (requestMediaType(request) !== "application/json") {
    return json({ error: "content-type must be application/json" }, { status: 415 });
  }

  const limitedBody = await readRequestTextWithinLimit(request, MAX_EBAY_BODY_BYTES);
  if (!limitedBody.ok) {
    return json({ error: "request body too large" }, { status: 413 });
  }
  const body = limitedBody.text;
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return json({ error: "invalid JSON" }, { status: 400 });
  }

  if (!isEbayDeletionPayload(parsed)) {
    return json({ error: "invalid marketplace account deletion payload" }, { status: 400 });
  }

  try {
    const verified = await verifyEbaySignature(signatureHeader, body, env);
    if (!verified) {
      return json({ error: "signature verification failed" }, { status: 412 });
    }
  } catch (error) {
    console.error("[worker] eBay signature verification failed:", (error as Error).message);
    return json({ error: "signature verification unavailable" }, { status: 503 });
  }

  // This website does not persist eBay user account data. A verified notification
  // therefore has no local record to delete; acknowledging it is the complete action.
  return new Response(null, { status: 204 });
}

async function handleEbayDeletion(request: Request, env: Env): Promise<Response> {
  if (request.method === "GET") return handleEbayChallenge(request, env);
  if (request.method === "POST") return handleEbayDeletionNotification(request, env);
  return new Response("Method not allowed", {
    status: 405,
    headers: { allow: "GET, POST" },
  });
}

const GATE_OPEN_PATHS = new Set(["/entrar", "/entrar/", "/entrar/index.html"]);
const GATE_LOGOUT_PATHS = new Set(["/sair", "/sair/"]);
const GATE_OPEN_PREFIXES = ["/gate_assets/"];
const MATHEUS_CACHE_CONTROL = "private, max-age=600";
const MATHEUS_NO_STORE = "private, no-store";

function redirect(location: string, status: number, extraHeaders?: Record<string, string>): Response {
  return new Response(null, { status, headers: { location, ...extraHeaders } });
}

function withMatheusHeaders(
  response: Response,
  cacheControl = MATHEUS_CACHE_CONTROL,
): Response {
  const headers = new Headers(response.headers);
  headers.set("x-robots-tag", "noindex, nofollow");
  headers.set("cache-control", cacheControl);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function matheusSessionEpoch(env: Env): string {
  return env.MATHEUS_SESSION_EPOCH || DEFAULT_MATHEUS_SESSION_EPOCH;
}

function matheusSessionCookie(value: string, maxAgeSeconds: number): string {
  return [
    `${SESSION_COOKIE_NAME}=${value}`,
    `Max-Age=${maxAgeSeconds}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ");
}

// Brute-force brake on the single shared gate password, keyed on the client IP.
// The binding is declared in wrangler.toml. Missing or failing infrastructure is an
// unknown state on a security-critical path, so both cases fail closed.
async function allowLoginAttempt(request: Request, env: Env): Promise<boolean> {
  if (!env.MATHEUS_LOGIN_LIMITER) return false;
  try {
    const { success } = await env.MATHEUS_LOGIN_LIMITER.limit({
      key: request.headers.get("cf-connecting-ip") || "sem-ip",
    });
    return success;
  } catch (error) {
    console.error("[worker] login rate limiter unavailable:", (error as Error).message);
    return false;
  }
}

// Clearing the cookie is idempotent, so /sair/ works with or without a session.
function handleMatheusLogout(): Response {
  return withMatheusHeaders(
    redirect("/entrar/", 303, { "set-cookie": matheusSessionCookie("", 0) }),
    MATHEUS_NO_STORE,
  );
}

async function handleMatheusLogin(request: Request, env: Env, url: URL): Promise<Response> {
  const voltar = safeReturnPath(url.searchParams.get("voltar"));
  if (!(await allowLoginAttempt(request, env))) {
    return withMatheusHeaders(
      new Response("Muitas tentativas. Aguarde um minuto e tente novamente.", {
        status: 429,
        headers: { "content-type": "text/plain; charset=utf-8", "retry-after": "60" },
      }),
      MATHEUS_NO_STORE,
    );
  }
  if (requestMediaType(request) !== "application/x-www-form-urlencoded") {
    return withMatheusHeaders(
      new Response("Tipo de formulario invalido.", { status: 415 }),
      MATHEUS_NO_STORE,
    );
  }
  const limitedBody = await readRequestTextWithinLimit(request, MAX_MATHEUS_LOGIN_BODY_BYTES);
  if (!limitedBody.ok) {
    return withMatheusHeaders(
      new Response("Formulario muito grande.", { status: 413 }),
      MATHEUS_NO_STORE,
    );
  }
  const senha = new URLSearchParams(limitedBody.text).get("senha");

  if (typeof senha === "string" && (await verifyPassword(env.MATHEUS_PASSWORD as string, senha))) {
    const expiresAtMs = Date.now() + SESSION_DURATION_MS;
    const cookie = matheusSessionCookie(
      await signSession(
        env.MATHEUS_SESSION_SECRET as string,
        expiresAtMs,
        matheusSessionEpoch(env),
      ),
      Math.floor(SESSION_DURATION_MS / 1000),
    );
    return withMatheusHeaders(
      redirect(voltar, 303, { "set-cookie": cookie }),
      MATHEUS_NO_STORE,
    );
  }

  return withMatheusHeaders(
    redirect(`/entrar/?erro=1&voltar=${encodeURIComponent(voltar)}`, 303),
    MATHEUS_NO_STORE,
  );
}

async function handleMatheusSite(request: Request, env: Env, url: URL): Promise<Response> {
  if (!env.MATHEUS_PASSWORD || !env.MATHEUS_SESSION_SECRET) {
    // Fail closed: never serve the manual ungated because secrets are missing.
    return withMatheusHeaders(
      new Response("Acesso temporariamente indisponivel.", {
        status: 503,
        headers: { "content-type": "text/plain; charset=utf-8" },
      }),
      MATHEUS_NO_STORE,
    );
  }

  if (request.method === "POST" && GATE_OPEN_PATHS.has(url.pathname)) {
    return handleMatheusLogin(request, env, url);
  }

  if (GATE_LOGOUT_PATHS.has(url.pathname)) {
    if (request.method !== "POST") {
      return withMatheusHeaders(
        new Response("Use POST para sair.", { status: 405, headers: { allow: "POST" } }),
        MATHEUS_NO_STORE,
      );
    }
    return handleMatheusLogout();
  }

  const cookies = parseCookies(request.headers.get("cookie"));
  const authenticated = await verifySession(
    env.MATHEUS_SESSION_SECRET,
    cookies.get(SESSION_COOKIE_NAME),
    Date.now(),
    matheusSessionEpoch(env),
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
    return withMatheusHeaders(redirect(login.toString(), 302), MATHEUS_NO_STORE);
  }

  if (authenticated && GATE_OPEN_PATHS.has(url.pathname)) {
    const home = new URL(request.url);
    home.pathname = "/";
    home.search = "";
    return withMatheusHeaders(redirect(home.toString(), 302), MATHEUS_NO_STORE);
  }

  if (url.pathname === "/livro" || url.pathname === "/revista") {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = `${url.pathname}/`;
    return withMatheusHeaders(redirect(redirectUrl.toString(), 308));
  }

  if (url.pathname === "/fotolivro/" || url.pathname === "/fotolivro.html") {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = "/fotolivro";
    return withMatheusHeaders(redirect(redirectUrl.toString(), 308));
  }

  const assetUrl = new URL(request.url);
  assetUrl.pathname =
    url.pathname === "/" || url.pathname === "/index.html"
      ? `${MATHEUS_ASSET_PREFIX}/`
      : url.pathname === "/fotolivro"
        ? `${MATHEUS_ASSET_PREFIX}/fotolivro.html`
      : `${MATHEUS_ASSET_PREFIX}${url.pathname}`;

  const assetRequest = new Request(assetUrl.toString(), {
    headers: request.headers,
    method: request.method,
  });
  const response = await env.ASSETS.fetch(assetRequest);
  // With `not_found_handling = "404-page"`, Assets already returns the nearest
  // nested 404 page. Preserve that response instead of fetching /404.html again.
  return withMatheusHeaders(response);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (MATHEUS_HOSTS.has(url.hostname)) {
      return handleMatheusSite(request, env, url);
    }

    if (url.pathname === "/matheus" || url.pathname.startsWith("/matheus/")) {
      const target = new URL(request.url);
      target.protocol = "https:";
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
