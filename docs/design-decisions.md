# Design Decisions

Architectural and design choices for davidluky.com, with rationale.

---

## DD-001: Astro over Next.js / SvelteKit

**Decision**: Use Astro as the static site generator.

**Rationale**: The site is entirely static content — no dynamic data, no auth, no server-side rendering needed. Astro ships zero JavaScript by default, which is ideal for a personal portfolio. Next.js would add unnecessary client-side hydration overhead. SvelteKit was considered but Astro's component island model and file-based routing are simpler for this use case.

**Trade-offs**: No client-side routing (full page loads on navigation), but for a 5-page site this is imperceptible.

---

## DD-002: Warm Dark Color Palette

**Decision**: Custom dark theme with warm tones instead of cold blue-gray.

**Colors**:
- Background: `#0a0a09` (near-black with warm undertone)
- Text: `#faf8f1` (warm white)
- Accent: `#c4a35a` (gold)
- Card: `#1a1917` (warm dark gray)
- Border: `#2a2924` (warm border)

**Rationale**: Cold dark themes (pure black + blue) feel corporate. The warm palette with gold accents creates a distinctive, personal feel that stands out from generic developer portfolios. The gold accent ties into the blackletter brand font, evoking a medieval/gaming aesthetic that reflects the gaming-focused content.

---

## DD-003: Blackletter Brand Font with Scroll Morph

**Decision**: Use UnifrakturMaguntia (blackletter/gothic) for the "David Luky" brand mark, with a CSS-only animation that morphs "David Luky" → "DL" on scroll.

**Rationale**: The blackletter font is unexpected for a developer portfolio and creates instant visual identity. The scroll morph is a technical flex that demonstrates CSS animation capabilities without JavaScript. The "DL" collapsed state keeps the brand visible without occupying too much header space.

**Implementation**: The morph works by animating `font-size: 0` on the middle letters ("avid" and "uky") while keeping the anchor letters ("D" and "L") visible. A gap element between them collapses from `0.35em` to `0.06em`. The anchor letters gain a gold color and text-shadow glow in the scrolled state.

**Trade-off**: The font is ~30KB loaded from Google Fonts. Acceptable since it's a single decorative font with only one weight.

---

## DD-004: Client-Side i18n via localStorage

**Decision**: Implement bilingual support (EN/PT-BR) entirely client-side using `data-i18n` attributes and localStorage.

**Rationale**: Server-side i18n would require either SSR (negating Astro's static benefits) or generating duplicate pages (doubling build output and URLs). Client-side translation with `display=swap` on fonts means there's a brief flash of English before Portuguese loads, but this is acceptable for a personal site.

**Implementation**:
- Shared strings in `src/i18n/shared.ts` (nav, footer — imported by all pages)
- Page-specific strings in each page's `<script>` block
- `applyI18n()` helper merges shared + page strings and applies to DOM
- Language toggle on homepage saves to `localStorage('dl-lang')`
- All pages read the saved language on load

**Trade-off**: Flash of untranslated content on initial load if language is PT-BR. Could be solved with a server-side redirect or cookie-based routing, but adds complexity not worth it for a personal site.

---

## DD-005: Single Data Source for Projects

**Decision**: All 12 projects defined in `src/data/projects.ts` with both EN and PT-BR descriptions.

**Rationale**: The homepage stat card ("12 Active Projects") and the projects page both need the project list. A single source of truth prevents count mismatches and makes adding/removing projects a one-file change.

**Interface**:
```typescript
interface Project {
  name: string;
  description: string;
  descriptionPt: string;
  tech: string[];
  tag: string;
  tagPt: string;
  link: string | null;
}
```

---

## DD-006: Cloudflare Workers over Cloudflare Pages

**Decision**: Deploy to Cloudflare Workers with static assets, not Cloudflare Pages.

**Rationale**: David already had a Cloudflare Workers setup for the domain (`davidluky.com` was previously routed to a different worker). Workers allows `wrangler deploy` with a simple `wrangler.toml` config, no build pipeline to configure. Pages would require connecting a GitHub repo and configuring build settings.

**Trade-off**: No automatic GitHub-triggered deploys — requires manual `npx wrangler deploy`. Could set up Cloudflare Builds later for CI/CD.

---

## DD-007: OG Image as PNG via @resvg/resvg-js

**Decision**: Generate the OG image as a 1200x630 PNG using a one-shot Node script, rather than using the SVG directly.

**Rationale**: Twitter, Discord, and Slack don't render SVG images in link previews. A raster PNG is universally supported. Using `@resvg/resvg-js` (a Rust-based SVG renderer compiled to WASM) produces high-quality output with system fonts.

**Script**: `scripts/generate-og.mjs` — run manually when the OG image design changes. Output goes to `public/og-image.png`. The SVG source (`public/og-image.svg`) is kept as the editable source.

---

## DD-008: No JavaScript Framework for Interactivity

**Decision**: All interactivity (language toggle, scroll morph) uses vanilla JavaScript in inline `<script>` tags.

**Rationale**: The site has exactly two interactive features: the brand scroll morph and the language toggle. Neither warrants importing React, Vue, or even Alpine.js. Inline scripts are bundled by Vite, tree-shaken, and produce minimal output.

**Result**: Total JavaScript shipped is ~3KB across all pages (mostly i18n strings).

---

## DD-009: Tailwind CSS 4.x with @theme Block

**Decision**: Use Tailwind CSS 4 with the new `@theme` directive in `global.css` instead of `tailwind.config.ts`.

**Rationale**: Tailwind 4 eliminates the config file in favor of CSS-native theme definitions. The `@theme` block in `global.css` defines all custom colors, fonts, and design tokens in one place, co-located with the CSS they modify.

---

## DD-010: About Page over Homepage Merge

**Decision**: Expand the temporary page into a standalone `/about` page rather than merging its content into the homepage.

**Rationale**: The homepage is intentionally minimal — hero + intro + stats. Adding a full bio, tech stack, timeline, and contact section would make it too long and dilute the clean first impression. A dedicated `/about` page gives the content room to breathe and makes the nav structure clearer (Projects | Gaming | About).

**Date**: 2026-04-11 (Session 2)
