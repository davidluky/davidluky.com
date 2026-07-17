import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "../src/worker";

const MAX_EBAY_BODY_BYTES = 256 * 1024;

function makeEnv(overrides: Record<string, unknown> = {}) {
  return {
    ASSETS: {
      fetch: async (request: Request) =>
        new Response(`asset:${new URL(request.url).pathname}`, { status: 200 }),
    },
    EBAY_CLIENT_ID: "test-client",
    EBAY_CLIENT_SECRET: "test-secret",
    EBAY_ENVIRONMENT: "sandbox",
    ...overrides,
  } as Parameters<typeof worker.fetch>[1];
}

function encodeBase64(value: string | Uint8Array): string {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function signatureHeader(
  kid: string,
  signature = new Uint8Array(64),
  digest = "SHA256",
): string {
  return encodeBase64(
    JSON.stringify({
      alg: "ECDSA",
      kid,
      signature: encodeBase64(signature),
      digest,
    }),
  );
}

function publicKeyPem(spki: ArrayBuffer): string {
  const encoded = encodeBase64(new Uint8Array(spki));
  const lines = encoded.match(/.{1,64}/g)?.join("\n") || encoded;
  return `-----BEGIN PUBLIC KEY-----\n${lines}\n-----END PUBLIC KEY-----`;
}

const payload = {
  metadata: {
    topic: "MARKETPLACE_ACCOUNT_DELETION",
    schemaVersion: "1.0",
    deprecated: false,
  },
  notification: {
    notificationId: "notification-1",
    eventDate: "2026-07-12T12:00:00.000Z",
    publishDate: "2026-07-12T12:00:01.000Z",
    publishAttemptCount: 1,
    data: {
      username: "example",
      userId: "user-1",
      eiasToken: "token-1",
    },
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("eBay deletion notifications", () => {
  it("verifies a signed payload using bounded, non-redirecting eBay calls", async () => {
    const body = JSON.stringify(payload);
    const keys = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"],
    );
    const signature = new Uint8Array(
      await crypto.subtle.sign(
        { name: "ECDSA", hash: "SHA-256" },
        keys.privateKey,
        new TextEncoder().encode(body),
      ),
    );
    const spki = await crypto.subtle.exportKey("spki", keys.publicKey);
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      expect(init?.redirect).toBe("error");
      expect(init?.signal).toBeInstanceOf(AbortSignal);
      if (url.endsWith("/identity/v1/oauth2/token")) {
        return Response.json({ access_token: "access-token", expires_in: 3600 });
      }
      if (url.endsWith("/commerce/notification/v1/public_key/signed-payload")) {
        return Response.json({
          algorithm: "Elliptic Curve Digital Signature Algorithm (ECDSA)",
          digest: "SHA256",
          key: publicKeyPem(spki),
        });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await worker.fetch(
      new Request("https://davidluky.com/ebay/deletion", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-ebay-signature": signatureHeader("signed-payload", signature),
        },
        body,
      }),
      makeEnv({ EBAY_CLIENT_ID: "signed-payload-client" }),
    );

    expect(response.status).toBe(204);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const tamperedBody = body.replace("user-1", "user-2");
    const tamperedResponse = await worker.fetch(
      new Request("https://davidluky.com/ebay/deletion", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-ebay-signature": signatureHeader("signed-payload", signature),
        },
        body: tamperedBody,
      }),
      makeEnv({ EBAY_CLIENT_ID: "signed-payload-client" }),
    );
    expect(tamperedResponse.status).toBe(412);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("rejects a declared oversized payload before reading or calling eBay", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await worker.fetch(
      new Request("https://davidluky.com/ebay/deletion", {
        method: "POST",
        headers: {
          "content-length": String(MAX_EBAY_BODY_BYTES + 1),
          "content-type": "application/json",
          "x-ebay-signature": signatureHeader("oversized-declared"),
        },
        body: "{}",
      }),
      makeEnv(),
    );

    expect(response.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects an actually oversized streamed payload without a length header", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await worker.fetch(
      new Request("https://davidluky.com/ebay/deletion", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-ebay-signature": signatureHeader("oversized-stream"),
        },
        body: "x".repeat(MAX_EBAY_BODY_BYTES + 1),
      }),
      makeEnv(),
    );

    expect(response.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects unsupported signature digests instead of falling back to SHA-1", async () => {
    const body = JSON.stringify(payload);
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith("/identity/v1/oauth2/token")) {
        return Response.json({ access_token: "access-token", expires_in: 3600 });
      }
      return Response.json({
        algorithm: "ECDSA",
        digest: "SHA512",
        key: "unused because the digest is rejected",
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await worker.fetch(
      new Request("https://davidluky.com/ebay/deletion", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-ebay-signature": signatureHeader("unsupported-digest", undefined, "SHA512"),
        },
        body,
      }),
      makeEnv({ EBAY_CLIENT_ID: "unsupported-digest-client" }),
    );

    expect(response.status).toBe(412);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("advertises the supported methods", async () => {
    const response = await worker.fetch(
      new Request("https://davidluky.com/ebay/deletion", { method: "DELETE" }),
      makeEnv(),
    );
    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET, POST");
  });

  it("rejects content types that merely contain the JSON media type", async () => {
    const response = await worker.fetch(
      new Request("https://davidluky.com/ebay/deletion", {
        method: "POST",
        headers: {
          "content-type": "text/application/json-example",
          "x-ebay-signature": signatureHeader("wrong-media-type"),
        },
        body: JSON.stringify(payload),
      }),
      makeEnv(),
    );
    expect(response.status).toBe(415);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
