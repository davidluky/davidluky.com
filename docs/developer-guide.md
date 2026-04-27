# Developer Guide

Everything you need to work on davidluky.com.

## Prerequisites

- Node.js 20+
- npm 10+
- Cloudflare account with `wrangler` authenticated (`npx wrangler login`)

## Quick Start

```bash
cd davidluky.com
npm install
npm run dev        # http://localhost:4321
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at localhost:4321 with HMR |
| `npm run build` | Build static site to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run check` | Run Astro TypeScript checker |
| `npx wrangler deploy` | Deploy to Cloudflare Workers |
| `node scripts/generate-og.mjs` | Regenerate OG image PNG from SVG |

## Project Structure

```
davidluky.com/
  src/
    components/
      Header.astro       Sticky header with brand morph + nav
      Hero.astro          Full-width centered hero section
      Footer.astro        3-column footer with link groups
    data/
      projects.ts         Single source of truth for all 18 projects
      stats.ts            Centralized stats (game counts, hours, levels)
      gaming.ts           Gaming data loader: Game Library DB → Steam API → fallback
    i18n/
      shared.ts           Shared nav/footer i18n strings + applyI18n() helper
    layouts/
      Base.astro          HTML shell: meta tags, fonts, OG image, styles
    pages/
      index.astro         Homepage: hero, intro, stats grid, language toggle
      projects.astro      All 18 projects with tags, descriptions, tech badges
      gaming.astro        Gaming stats, platform cards, game lists
      about.astro         Background, tech stack, timeline, contact
      404.astro           Not found page
    styles/
      global.css          Tailwind imports + @theme (Warm Dark palette) + brand morph CSS
    types/
      global.d.ts         Window interface augmentation for define:vars bridge properties
  public/
    _headers             Cloudflare security headers (CSP, X-Frame-Options)
    favicon.svg          "DL" monogram favicon
    og-image.png         1200x630 OG image for social sharing
    og-image.svg         Editable SVG source for OG image
    robots.txt           Standard robots.txt
  scripts/
    generate-og.mjs      One-shot script to render OG image SVG → PNG
  .github/
    workflows/
      deploy.yml         CI/CD: npm ci → check → build → wrangler deploy on push to main
  docs/
    design-decisions.md  Architectural choices with rationale (13 entries)
    tech-notes.md        Implementation details and patterns (11 entries)
    deployment-guide.md  Full deployment, DNS, CI/CD, and analytics guide
    flight-recorder.md   Failed approaches and gotchas (18 entries)
    audit-2026-04-25.md  32-issue audit report with root cause analysis
    SESSION-HANDOFF.md   Latest session state for continuity
  dist/                  Build output (gitignored)
  astro.config.mjs       Astro config: site URL, sitemap, Tailwind plugin
  wrangler.toml          Cloudflare Workers config
  CHANGELOG.md           Version history
  CLAUDE.md              AI assistant instructions
```

## Adding a New Page

1. Create `src/pages/mypage.astro`
2. Import `Base`, `Header`, `Footer` components
3. Add `data-i18n` attributes to all text elements
4. Add a `<script>` block importing `applyI18n` from `../i18n/shared`:
   ```typescript
   import { applyI18n } from '../i18n/shared';
   applyI18n({
     en: { key: 'English text' },
     pt: { key: 'Texto em português' },
   });
   ```
5. Add the page to the nav in `src/components/Header.astro` (navLinks array)
6. Add footer i18n keys if the nav label needs translation
7. The sitemap updates automatically

## Adding a New Project

Edit `src/data/projects.ts` — add a new entry to the `projects` array:

```typescript
{
  name: "Project Name",
  description: "English description.",
  descriptionPt: "Descrição em português.",
  tech: ["TypeScript", "React"],
  tag: "Web App",
  tagPt: "App Web",
  link: "https://example.com",  // or null for no link
}
```

The homepage "Active Projects" count, the projects page, and the "Live Sites" counter all update automatically.

If this is a new tag category, add it to `tagColors` in `projects.astro`.

### Updating Stats

Edit `src/data/stats.ts` to update numeric values (game counts, hours played, levels, etc.). All pages that reference these stats will pick up the change automatically at build time.

For stats that appear in i18n strings, the value flows through `define:vars` → `window.__*` → template literal. See TN-010 in tech-notes.md.

## i18n System

### How It Works

1. **Shared strings** (`src/i18n/shared.ts`): nav labels, footer labels — imported by all pages
2. **Page strings**: each page defines its own EN/PT-BR strings in a `<script>` block
3. **`applyI18n(pageStrings)`**: merges shared + page strings, applies to all `[data-i18n]` elements, returns the current language
4. **Language persistence**: saved to `localStorage('dl-lang')`, read on page load

### Adding a New Translatable Element

1. Add `data-i18n="unique_key"` to the HTML element
2. Add the key to both `en` and `pt` objects in the page's script
3. If it's a nav/footer element, add it to `src/i18n/shared.ts` instead

### Special Cases

- **Projects page**: uses `data-i18n-tag` and `data-i18n-desc` for per-project translations (index-based, e.g., `tag_0`, `desc_0`)
- **Homepage hero**: translated via DOM selectors (not data-i18n) because the Hero component doesn't have i18n attributes
- **Homepage language toggle**: clicking the stat card toggles between EN/PT and updates all elements

## Design System

### Colors (defined in `src/styles/global.css` @theme block)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#0a0a09` | Page background |
| `--color-bg-alt` | `#0c0c0b` | Alternate background |
| `--color-bg-card` | `#1a1917` | Card backgrounds |
| `--color-border` | `#2a2924` | Borders, dividers |
| `--color-text` | `#faf8f1` | Primary text |
| `--color-text-2` | `#b0a998` | Secondary text |
| `--color-text-3` | `#847a6c` | Muted text, labels (WCAG AA compliant) |
| `--color-accent` | `#c4a35a` | Gold accent |
| `--color-accent-dim` | `rgba(196,163,90,0.08)` | Accent tint for backgrounds |

### Fonts

| Font | Usage | Weight |
|------|-------|--------|
| Inter | Body text | 300, 400, 500, 600 |
| JetBrains Mono | Code, tech labels | 400, 500 |
| UnifrakturMaguntia | Brand mark only | 400 |

### Breakpoints

| Prefix | Width | Usage |
|--------|-------|-------|
| `max-md:` | < 768px | Tablet/mobile layout changes |
| `max-sm:` | < 640px | Small phone adjustments |
| `md:` | >= 768px | Desktop grid layouts |
| `lg:` | >= 1024px | Wide desktop (6-col grids) |

### Layout Constants

- Max width: `1280px` (all sections)
- Desktop padding: `px-12` (48px)
- Mobile padding: `px-6` (24px)
- Prose max width: `600px–660px`
- Brand font: `52px` desktop, `30px` mobile (breakpoint: 768px)

## Testing

No automated tests — the site is static content. Verify changes with:

```bash
npm run build    # Build succeeds
npm run check    # TypeScript passes (0 errors, 0 warnings)
npm run preview  # Visual check at localhost:4321
```

Check mobile by resizing browser to 375px width or using Chrome DevTools responsive mode.

### Lighthouse
Run `npx lighthouse https://davidluky.com --chrome-flags="--headless"` for a full audit. Current scores (2026-04-25): **99 / 100 / 100 / 100** (Performance / Accessibility / Best Practices / SEO).

## CI/CD

GitHub Actions runs on every push to `main` (`.github/workflows/deploy.yml`):
1. `npm ci` → `npm run check` → `npm run build` → `wrangler deploy`

**Setup**: Add `CLOUDFLARE_API_TOKEN` secret to the GitHub repo (Settings → Secrets → Actions). Create the token at [Cloudflare Dashboard → API Tokens](https://dash.cloudflare.com/profile/api-tokens) with **Edit Cloudflare Workers** permission.

Manual deploys via `npx wrangler deploy` still work as a fallback.

## Accessibility

The site targets **WCAG 2.1 Level AA** compliance:
- All text meets 4.5:1 contrast ratio against its background
- Heading hierarchy is sequential (h1 → h2, no skipped levels)
- Interactive tooltips are keyboard-accessible (`tabindex="0"`, `:focus-within`)
- Mobile menu announces open/close state via `aria-expanded`
- Document has a `<main>` landmark for screen reader navigation
- i18n uses `textContent` by default; `innerHTML` is opt-in via `data-i18n-html`
