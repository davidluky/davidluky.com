import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const selector = readFileSync(new URL("../public/matheus/index.html", import.meta.url), "utf8");
const photobook = readFileSync(
  new URL("../public/matheus/fotolivro.html", import.meta.url),
  "utf8",
);

describe("Matheus edition selector", () => {
  it("offers the manual, magazine, and photography editions", () => {
    const editionLinks = Array.from(
      selector.matchAll(/<a\s+[^>]*class="choice[^"]*"[^>]*href="([^"]+)"/g),
      (match) => match[1],
    );

    expect(editionLinks).toEqual(["livro/", "revista/", "fotolivro"]);
    expect(selector).toContain("Livro manual");
    expect(selector).toContain("Revista");
    expect(selector).toContain("Livro fotográfico");
  });

  it("keeps the complete photography edition available", () => {
    expect(photobook.match(/<section class="abertura/g)).toHaveLength(8);
    expect(photobook.match(/<img(?:\s|>)/g)).toHaveLength(102);
    expect(photobook).toContain('href="livro/"');
    expect(photobook).toContain('href="revista/"');
  });
});
