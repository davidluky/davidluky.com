export interface Project {
  name: string;
  description: string;
  tech: string[];
  tag: string;
  link: string | null;
}

export const projects: Project[] = [
  {
    name: "The Room",
    description:
      "Multiplayer social platform with 13 games, a full turn-based RPG (7 zones, endgame boss), real-time chat, 239 achievements, tournaments, economy, and admin dashboard. The original C++ desktop client that started it all.",
    tech: ["C++17", "Firebase", "libcurl", "Windows API"],
    tag: "Game Platform",
    link: null,
  },
  {
    name: "The Room — Web Client",
    description:
      "Full React web companion to The Room, sharing the same Firebase backend. 40 routes, 3 visual themes (Terminal, Hybrid, Modern), bilingual (EN/PT-BR), PWA-ready.",
    tech: ["React 19", "TypeScript", "Tailwind", "Firebase", "Vite"],
    tag: "Web App",
    link: "https://play.davidluky.com",
  },
  {
    name: "Tibia Services",
    description:
      "Marketplace for Tibia game services — hunting, quests, bestiary, PK. Booking system with in-chat, character verification via TibiaData API, reviews, dispute resolution, and featured listings.",
    tech: ["Next.js 14", "Supabase", "TypeScript", "Tailwind"],
    tag: "Marketplace",
    link: "https://tibia-services.vercel.app",
  },
  {
    name: "Game Library",
    description:
      "Desktop app that aggregates game libraries from Steam, Xbox, Epic, GOG, PlayStation, Nintendo, Game Pass, and more into a single unified view. FTS5 search, game deduplication, encrypted tokens, 3 themes.",
    tech: ["Electron", "React 19", "SQLite", "Zustand", "Vite"],
    tag: "Desktop App",
    link: null,
  },
  {
    name: "Gym Check-in Bot",
    description:
      "WhatsApp bot that tracks gym training via message reactions in a group chat. Posts daily, weekly, and monthly reports in PT-BR. Auto-detects members and reconciles check-ins.",
    tech: ["Node.js", "whatsapp-web.js", "SQLite", "PM2"],
    tag: "Bot",
    link: null,
  },
  {
    name: "WhatsApp Exporter",
    description:
      "Desktop app for exporting WhatsApp conversations to HTML/PDF with full media support. QR-based login, optional ZIP backup merge, rich styled output with lightbox and reactions.",
    tech: ["Electron", "React 19", "Puppeteer", "Vite"],
    tag: "Desktop App",
    link: null,
  },
  {
    name: "Local IA",
    description:
      "Personal AI workstation for running open-weight models locally via Ollama with intelligent cloud escalation. Claude Code-like CLI, custom MCP servers, skill library, benchmark framework, and cost tracking.",
    tech: ["TypeScript", "Ollama", "OpenClaude", "MCP"],
    tag: "AI Tooling",
    link: null,
  },
  {
    name: "GFWL Achievement Unlocker",
    description:
      "Proxy DLL that hijacks xlive.dll to unlock Games for Windows Live achievements in BioShock 2 and other GFWL titles. Watcher thread polls a file for achievement IDs to fire.",
    tech: ["C", "Windows API", "Python", "MinGW"],
    tag: "Reverse Engineering",
    link: null,
  },
  {
    name: "Frank's Stories",
    description:
      "Family storytelling platform with decade-based timeline, DOCX/PDF upload, auto-image extraction, password-gated reader access, and admin dashboard.",
    tech: ["Next.js 14", "SQLite", "Tailwind", "mammoth.js"],
    tag: "Web App",
    link: null,
  },
  {
    name: "Games Downloader",
    description:
      "Automated preservation system for retro game collections — 200 Xbox 360 titles (1.66 TB) and 1,199 Nintendo 3DS games (347 GB) from archive.org. Batch downloads, ZIP integrity checks, duplicate tracking.",
    tech: ["Bash", "Python", "Selenium", "curl"],
    tag: "Automation",
    link: null,
  },
  {
    name: "Midjourney Relay",
    description:
      "Discord bot that multiplexes a single Midjourney subscription across multiple users. Relays /imagine prompts and returns generated images to a shared channel.",
    tech: ["Python", "discord.py"],
    tag: "Bot",
    link: null,
  },
  {
    name: "davidluky.com",
    description:
      "This website. Personal hub for projects, gaming profiles, and bio. Static site with blackletter brand morph, bilingual toggle, and zero JS besides scroll animation.",
    tech: ["Astro", "Tailwind", "TypeScript", "Cloudflare"],
    tag: "Website",
    link: "/",
  },
];
