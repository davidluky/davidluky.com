const DEFAULT_EBAY_ENDPOINT_URL = "https://davidluky.com/ebay/deletion";
const EBAY_PRODUCTION_API = "https://api.ebay.com";
const EBAY_SANDBOX_API = "https://api.sandbox.ebay.com";
const EBAY_PRODUCTION_OAUTH = "https://api.ebay.com/identity/v1/oauth2/token";
const EBAY_SANDBOX_OAUTH = "https://api.sandbox.ebay.com/identity/v1/oauth2/token";
const EBAY_SCOPE = "https://api.ebay.com/oauth/api_scope";
const PUBLIC_KEY_CACHE_TTL_MS = 60 * 60 * 1000;
const ACCESS_TOKEN_CACHE_SKEW_MS = 60 * 1000;

interface Env {
  ASSETS: { fetch: typeof fetch };
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

let cachedAccessToken: { token: string; expiresAt: number } | null = null;
const publicKeyCache = new Map<string, { key: EbayPublicKey; expiresAt: number }>();

function json(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
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

async function getAccessToken(env: Env): Promise<string> {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now()) {
    return cachedAccessToken.token;
  }

  if (!env.EBAY_CLIENT_ID || !env.EBAY_CLIENT_SECRET) {
    throw new Error("EBAY_CLIENT_ID and EBAY_CLIENT_SECRET are required to verify eBay notification signatures.");
  }

  const { oauth } = getEbayHosts(env);
  const credentials = btoa(`${env.EBAY_CLIENT_ID}:${env.EBAY_CLIENT_SECRET}`);
  const response = await fetch(oauth, {
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
  if (!token.access_token || !token.expires_in) {
    throw new Error("eBay OAuth returned an invalid access token response.");
  }

  cachedAccessToken = {
    token: token.access_token,
    expiresAt: Date.now() + token.expires_in * 1000 - ACCESS_TOKEN_CACHE_SKEW_MS,
  };
  return cachedAccessToken.token;
}

async function getPublicKey(kid: string, env: Env): Promise<EbayPublicKey> {
  const cached = publicKeyCache.get(kid);
  if (cached && cached.expiresAt > Date.now()) return cached.key;

  const token = await getAccessToken(env);
  const { api } = getEbayHosts(env);
  const response = await fetch(`${api}/commerce/notification/v1/public_key/${encodeURIComponent(kid)}`, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`eBay public key lookup failed with HTTP ${response.status}.`);
  }

  const publicKey = (await response.json()) as EbayPublicKey;
  if (!publicKey.key || !publicKey.algorithm || !publicKey.digest) {
    throw new Error("eBay public key response is missing required fields.");
  }

  publicKeyCache.set(kid, {
    key: publicKey,
    expiresAt: Date.now() + PUBLIC_KEY_CACHE_TTL_MS,
  });
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

function signatureHash(digest: string): "SHA-1" | "SHA-256" {
  return digest.toUpperCase().replace("-", "") === "SHA256" ? "SHA-256" : "SHA-1";
}

async function verifyEbaySignature(signatureHeader: EbaySignatureHeader, body: string, env: Env): Promise<boolean> {
  if (signatureHeader.alg.toUpperCase() !== "ECDSA") return false;

  const publicKey = await getPublicKey(signatureHeader.kid, env);
  const key = await crypto.subtle.importKey(
    "spki",
    pemToArrayBuffer(publicKey.key),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"],
  );
  const signature = derEcdsaSignatureToRaw(decodeBase64UrlOrBase64(signatureHeader.signature));

  return crypto.subtle.verify(
    { name: "ECDSA", hash: signatureHash(signatureHeader.digest || publicKey.digest) },
    key,
    toArrayBuffer(signature),
    new TextEncoder().encode(body),
  );
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
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
  if (!challengeCode) {
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

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json({ error: "content-type must be application/json" }, { status: 415 });
  }

  const body = await request.text();
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/ebay/deletion") {
      return handleEbayDeletion(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
