import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://davidluky.com",
  output: "static",
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    // better-sqlite3 is an optional, build-time-only data source loaded via a
    // dynamic import that is guarded by the GAME_LIBRARY_DB env var (see
    // src/data/gaming.ts). Keep it external so the static build never tries to
    // bundle the native module — builds stay green even when the optional
    // dependency is absent (e.g. CI/dev without the local Game Library DB).
    ssr: {
      external: ["better-sqlite3"],
    },
    build: {
      rollupOptions: {
        external: ["better-sqlite3"],
      },
    },
  },
});
