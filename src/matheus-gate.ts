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
