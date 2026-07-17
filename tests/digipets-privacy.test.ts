import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const policy = readFileSync(
  new URL("../src/pages/privacy/digipets.astro", import.meta.url),
  "utf8",
);

describe("DigiPets privacy disclosure", () => {
  it("describes the optional social data in both languages", () => {
    expect(policy).toContain("shareable friend code");
    expect(policy).toContain("código de amigo compartilhável");
    expect(policy).toContain("friendships, requests, visits");
    expect(policy).toContain("amizades, solicitações, visitas");
  });

  it("does not retain the obsolete progress-only usage claim", () => {
    expect(policy).not.toContain("used solely to save your game progress");
    expect(policy).not.toContain("usados exclusivamente para salvar seu progresso");
  });
});
