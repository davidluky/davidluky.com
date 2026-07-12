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
