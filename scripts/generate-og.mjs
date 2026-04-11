import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "fs";

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0a0a09"/>
  <rect x="80" y="280" width="60" height="3" rx="1.5" fill="#c4a35a"/>
  <text x="80" y="350" fill="#faf8f1" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="300" letter-spacing="-2">David Luky</text>
  <text x="80" y="405" fill="#b0a998" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="400">Developer. Gamer. Builder of things.</text>
  <text x="80" y="560" fill="#6a6458" font-family="Consolas, monospace" font-size="18" font-weight="400">davidluky.com</text>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: 1200 },
});
const png = resvg.render();
writeFileSync("public/og-image.png", png.asPng());
console.log("Generated public/og-image.png (1200x630)");
