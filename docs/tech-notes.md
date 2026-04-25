# Tech Notes

Implementation details, patterns, and gotchas for davidluky.com.

---

## TN-001: Brand Morph Animation

The "David Luky" → "DL" morph is pure CSS, no JavaScript animation.

### HTML Structure
```html
<span class="brand-text">
  <span class="brand-keep">D</span>
  <span class="brand-mid">avid</span>
  <span class="brand-gap"></span>
  <span class="brand-keep">L</span>
  <span class="brand-mid">uky</span>
</span>
```

### How It Works
1. **Default state**: All letters visible, gap at `0.35em`
2. **On scroll past 60px**: JS adds `.header-scrolled` class to `<header>`
3. **CSS transition**: `.brand-mid` elements animate `font-size: 0` + `opacity: 0`, `.brand-gap` shrinks to `0.06em`, `.brand-keep` letters turn gold with text-shadow glow
4. **Timing**: `cubic-bezier(0.4, 0, 0.2, 1)` for smooth deceleration, 500ms duration

### Key Detail
The morph uses `font-size: 0` instead of `display: none` because font-size transitions smoothly while display is binary. The letters literally shrink away rather than popping out.

### Mobile
Brand font shrinks from 52px to 36px at `max-width: 640px` via media query in `global.css`.

---

## TN-002: Astro Inline Scripts and Vite Bundling

Astro `<script>` tags are processed by Vite at build time. This means:
- TypeScript works in inline scripts
- ES module imports work (`import { applyI18n } from '../i18n/shared'`)
- Each page's script is bundled into a separate chunk
- Dead code elimination applies

This is why the i18n deduplication works — `src/i18n/shared.ts` is imported by all 5 pages and Vite deduplicates the module in the final bundle.

### Gotcha
Astro inline scripts run **once per page load**, not per component instance. If a component with a script is used multiple times, the script only executes once.

---

## TN-003: Google Fonts Loading Strategy

The site loads 3 font families from Google Fonts:
- Inter (4 weights: 300, 400, 500, 600)
- JetBrains Mono (2 weights: 400, 500)
- UnifrakturMaguntia (1 weight: 400)

### Optimization
1. `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com` (with `crossorigin`)
2. `display=swap` in the Google Fonts URL — prevents invisible text during load
3. `fetchpriority="high"` on the stylesheet link — tells browser to prioritize this resource

### Trade-off
~70KB total font download (woff2). Could self-host for faster loading but Google's CDN has good cache hit rates globally.

---

## TN-004: OG Image Generation

**Problem**: SVG OG images don't render on Twitter, Discord, or Slack.

**Solution**: Generate a 1200x630 PNG using `@resvg/resvg-js` (Rust SVG renderer compiled to WASM).

**Process**:
1. SVG is defined inline in `scripts/generate-og.mjs` (not loaded from file, so fonts can be specified as system fonts)
2. `Resvg` renders the SVG to a pixel buffer
3. Buffer is written as PNG to `public/og-image.png`

**Font note**: The SVG uses `Arial, Helvetica, sans-serif` and `Consolas, monospace` instead of Inter and JetBrains Mono, because resvg can only use locally installed fonts. The visual difference is minimal at OG image resolution.

**When to regenerate**: Run `node scripts/generate-og.mjs` after changing the OG design (title, tagline, colors).

---

## TN-005: Projects Page i18n for Dynamic Content

The projects page has a unique i18n challenge: project descriptions come from `src/data/projects.ts` (server-side data), but translations need to happen client-side.

### Approach
1. Each project card has `data-i18n-tag="tag_0"` and `data-i18n-desc="desc_0"` attributes (index-based)
2. The projects array is passed to client-side via `define:vars` — the script reads `descriptionPt`/`tagPt` directly from the data
3. On load, if language is `pt`, the script iterates all `[data-i18n-tag]` and `[data-i18n-desc]` elements and replaces their text from the imported data

### Why not data-i18n?
The standard `data-i18n` system uses a flat key-value map. Projects need per-item translations that map to array indices, not named keys. Using separate `data-i18n-tag`/`data-i18n-desc` attributes keeps the two systems cleanly separated.

### No duplication
PT-BR descriptions live only in `projects.ts` (as `descriptionPt`/`tagPt` fields). The page script reads them directly — there is no separate `projectsPt` map to keep in sync. Adding a project is a single-file change.

---

## TN-006: Cloudflare Workers Static Assets

The site deploys to Cloudflare Workers using the `[assets]` config in `wrangler.toml`:

```toml
[assets]
directory = "./dist"
not_found_handling = "404-page"
```

This serves static files directly from Cloudflare's edge network. The `404-page` handling means `dist/404.html` is served for any unmatched route.

### Security Headers
`public/_headers` defines CSP and security headers. Cloudflare Workers respects this file for static asset deployments.

### Domain Routing
- `davidluky.com` → this site (Workers)
- `play.davidluky.com` → the-room-web (separate Workers)
- `tibia.davidluky.com` → Tibia Services (Vercel, via CNAME)

---

## TN-007: Mobile Responsive Strategy

The site uses a mobile-first approach with Tailwind's `max-*` breakpoint modifiers:

### Breakpoint Cascade
1. **Default styles**: work at all sizes (text sizes, spacing)
2. **`max-md:` (< 768px)**: layout changes (flex-col, reduced padding, smaller headings)
3. **`max-sm:` (< 640px)**: fine-tuning for small phones (tighter gaps, smaller text, brand logo resize)

### Common Patterns
- `px-12 max-md:px-6` — container padding
- `text-[42px] max-md:text-3xl` — heading size
- `gap-8 max-md:gap-4 max-sm:gap-3` — grid/flex gaps
- `p-7 max-sm:p-4` — card padding

### Known Limitation
The gaming page's platform cards (Steam, Xbox, Tibia, Epic) use `ml-auto` for right-aligned stats which can crowd on very narrow screens (< 360px). The cards are functional but not perfectly balanced at extreme widths.

---

## TN-008: Sitemap Generation

`@astrojs/sitemap` auto-generates the sitemap at build time. Configuration in `astro.config.mjs`:

```javascript
site: "https://davidluky.com",
integrations: [sitemap()],
```

The sitemap includes all pages in `src/pages/` except:
- `404.astro` (excluded by Astro convention)

Output: `dist/sitemap-index.xml` and `dist/sitemap-0.xml`

---

## TN-009: Security Considerations

### What's Public
- All page content (it's a static site)
- Project descriptions and tech stacks
- Gaming profiles and stats
- Contact email (davidluky@davidluky.com)

### What's Not in the Repo
- No API keys, tokens, or secrets
- No analytics tracking (no Google Analytics, no Plausible)
- No cookies set (localStorage only for language preference)
- No forms or user input

### CSP Headers
`public/_headers` sets Content-Security-Policy allowing only:
- Scripts: self + Google Fonts
- Styles: self + Google Fonts + inline (Tailwind)
- Fonts: Google Fonts CDN
- Images: self
- Frame: none (X-Frame-Options: DENY)

---

## TN-010: Server-to-Client Data Bridge via `define:vars`

Astro pages compute data at build time (server-side), but i18n translations happen client-side. To pass server-side values into client-side `<script>` blocks:

### Pattern
```astro
<!-- Step 1: inline script with define:vars to set window globals -->
<script is:inline define:vars={{ roomGames: stats.theRoomGames }}>
  window.__stats = { roomGames };
</script>

<!-- Step 2: module script reads from window -->
<script>
  const { roomGames } = (window as any).__stats;
  // Use in template literals for i18n strings
  const strings = { en: { text: `${roomGames} games` } };
</script>
```

### Why two scripts?
- `is:inline` scripts with `define:vars` can receive Astro server values but are NOT processed by Vite (no imports)
- Module scripts (no `is:inline`) ARE processed by Vite (imports work) but can't use `define:vars`
- The `window.__*` bridge connects the two worlds

### Pages using this pattern
- `index.astro` → `window.__stats` (roomGames, roomAchievements)
- `about.astro` → `window.__about` (timelinePt, techCategoriesPt, roomGames, roomAchievements)
- `projects.astro` → `window.__projects` (project descriptions for i18n)
- `gaming.astro` → `window.__gaming` (all gaming stats for i18n)
