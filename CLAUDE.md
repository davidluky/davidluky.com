# davidluky.com — Personal Website

## Tech Stack
- **Astro 5.x** — static site generator, zero JS shipped
- **Tailwind CSS 4.x** — via @tailwindcss/vite plugin, theme in global.css @theme block
- **TypeScript** — strict mode via astro/tsconfigs/strict
- **Cloudflare Workers** — static asset deployment via wrangler

## Project Structure
- `src/pages/` — File-based routing (index, projects, gaming)
- `src/components/` — .astro single-file components
- `src/layouts/Base.astro` — HTML shell with meta tags and fonts
- `src/styles/global.css` — Tailwind imports + custom @theme (Warm Dark palette)
- `public/` — Static assets (favicon, robots.txt)
- `dist/` — Build output (static HTML/CSS)

## Design System
- **Palette**: Warm Dark — bg #111110, accent #c4a35a (gold), text #faf8f1
- **Fonts**: Inter (body), JetBrains Mono (tech labels)
- **Layout**: Glasswing-faithful — sticky header, centered hero, full-width breaks, left-aligned body sections in 1280px container with ~660px prose width

## Commands
- `npm run dev` — Dev server at localhost:4321
- `npm run build` — Build to dist/
- `npm run preview` — Preview production build
- `npm run check` — Astro TypeScript check

## Deployment
- Cloudflare Workers: `npx wrangler deploy`
- Domain: davidluky.com (custom domain in Cloudflare dashboard)
- Auto-deploy: Set up via Cloudflare Builds (connect GitHub repo)

## Related
- **the-room-web**: play.davidluky.com (subdomain)
- **Cloudflare account**: alissonfrangullys@gmail.com
