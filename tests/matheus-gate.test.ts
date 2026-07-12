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
