# davidluky.com

Personal website for David Luky. Built with Astro + Tailwind CSS, deployed on Cloudflare Workers.

## Setup

```bash
npm install
npm run dev       # http://localhost:4321
```

## Build & Deploy

```bash
npm run build     # Output: dist/
npx wrangler deploy
```

## Cloudflare Manual Steps

After first deploy, configure in the Cloudflare dashboard:

1. **Reassign davidluky.com domain** from the-room-web worker to davidluky-com worker:
   - Workers & Pages → the-room-web → Settings → Custom Domains → Remove davidluky.com
   - Workers & Pages → davidluky-com → Settings → Custom Domains → Add davidluky.com

2. **Add play.davidluky.com subdomain** for the-room-web:
   - DNS → Add CNAME record: `play` → `the-room-web.alissonfrangullys.workers.dev`
   - Workers & Pages → the-room-web → Settings → Custom Domains → Add play.davidluky.com

3. **Connect GitHub repo** for auto-deploy (optional):
   - Workers & Pages → davidluky-com → Settings → Builds → Connect to GitHub
