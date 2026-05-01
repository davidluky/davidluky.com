import { stats } from "./stats";

export const projectTags = {
  "game-platform": {
    label: "Game Platform",
    labelPt: "Plataforma de Jogos",
    colorClass: "text-accent",
  },
  "web-app": {
    label: "Web App",
    labelPt: "App Web",
    colorClass: "text-[#66c0f4]",
  },
  marketplace: {
    label: "Marketplace",
    labelPt: "Marketplace",
    colorClass: "text-[#f0c040]",
  },
  "desktop-app": {
    label: "Desktop App",
    labelPt: "App Desktop",
    colorClass: "text-[#a78bfa]",
  },
  bot: {
    label: "Bot",
    labelPt: "Bot",
    colorClass: "text-[#34d399]",
  },
  "ai-tooling": {
    label: "AI Tooling",
    labelPt: "Ferramentas de IA",
    colorClass: "text-[#f472b6]",
  },
  "reverse-engineering": {
    label: "Reverse Engineering",
    labelPt: "Engenharia Reversa",
    colorClass: "text-[#fb923c]",
  },
  automation: {
    label: "Automation",
    labelPt: "Automação",
    colorClass: "text-[#38bdf8]",
  },
  "game-dev": {
    label: "Game Dev",
    labelPt: "Desenvolvimento de Jogos",
    colorClass: "text-[#ef4444]",
  },
  "mobile-app": {
    label: "Mobile App",
    labelPt: "App Mobile",
    colorClass: "text-[#14b8a6]",
  },
  website: {
    label: "Website",
    labelPt: "Website",
    colorClass: "text-accent",
  },
  "ops-tooling": {
    label: "Ops Tooling",
    labelPt: "Ferramentas de Operações",
    colorClass: "text-[#93c5fd]",
  },
} as const;

export const projectStatuses = {
  active: { label: "Active", labelPt: "Ativo" },
  maintained: { label: "Maintained", labelPt: "Mantido" },
  live: { label: "Live", labelPt: "Online" },
  wip: { label: "In Progress", labelPt: "Em andamento" },
  internal: { label: "Internal", labelPt: "Interno" },
  archived: { label: "Archived", labelPt: "Arquivado" },
} as const;

export const projectVisibilities = {
  public: { label: "Public", labelPt: "Público" },
  private: { label: "Private repo", labelPt: "Repo privado" },
  internal: { label: "Internal tool", labelPt: "Ferramenta interna" },
} as const;

export type ProjectTag = keyof typeof projectTags;
export type ProjectStatus = keyof typeof projectStatuses;
export type ProjectVisibility = keyof typeof projectVisibilities;

export interface Project {
  id: string;
  name: string;
  year: number;
  description: string;
  descriptionPt: string;
  tech: readonly string[];
  tag: ProjectTag;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  featured?: boolean;
  liveUrl?: string;
  repoUrl?: string;
  metrics?: readonly string[];
  metricsPt?: readonly string[];
}

export const projects: readonly Project[] = [
  {
    id: "the-room",
    name: "The Room",
    year: 2020,
    description:
      `Multiplayer social platform with ${stats.theRoomGames} games, a full turn-based RPG with graphical mode (7 zones, endgame boss), real-time chat, ${stats.theRoomAchievements} achievements, tournaments, economy, and admin dashboard. The original C++ desktop client that started it all.`,
    descriptionPt:
      `Plataforma social multiplayer com ${stats.theRoomGames} jogos, um RPG por turnos completo com modo gráfico (7 zonas, boss endgame), chat em tempo real, ${stats.theRoomAchievements} conquistas, torneios, economia e painel admin. O cliente desktop C++ original que começou tudo.`,
    tech: ["C++17", "Firebase", "libcurl", "raylib", "Windows API"],
    tag: "game-platform",
    status: "active",
    visibility: "private",
    featured: true,
    metrics: [`${stats.theRoomGames} games`, `${stats.theRoomAchievements} achievements`, "7 RPG zones"],
    metricsPt: [`${stats.theRoomGames} jogos`, `${stats.theRoomAchievements} conquistas`, "7 zonas de RPG"],
  },
  {
    id: "the-room-web",
    name: "The Room Web Client",
    year: 2024,
    description:
      "Full React web companion to The Room, sharing the same Firebase backend. 40 routes, 3 visual themes (Terminal, Hybrid, Modern), bilingual EN/PT-BR content, and PWA-ready architecture.",
    descriptionPt:
      "Companion web completo em React para o The Room, compartilhando o mesmo backend Firebase. 40 rotas, 3 temas visuais (Terminal, Híbrido, Moderno), conteúdo bilíngue EN/PT-BR e arquitetura pronta para PWA.",
    tech: ["React 19", "TypeScript", "Tailwind", "Firebase", "Vite"],
    tag: "web-app",
    status: "live",
    visibility: "public",
    featured: true,
    liveUrl: "https://play.davidluky.com",
    metrics: ["40 routes", "3 themes", "Shared Firebase backend"],
    metricsPt: ["40 rotas", "3 temas", "Backend Firebase compartilhado"],
  },
  {
    id: "matematica-elementar",
    name: "Matemática Elementar",
    year: 2026,
    description:
      "Dual-curriculum math practice site: BNCC for Brazilian students (6th-9th grade plus Ensino Médio) and US Common Core K-8 plus Algebra 1, Geometry, and Algebra 2. 267 audited sets, 5,564 problems, local progress, no account required.",
    descriptionPt:
      "Site de prática de matemática com currículo duplo: BNCC para estudantes brasileiros (6º ao 9º ano + Ensino Médio) e US Common Core K-8 com Algebra 1, Geometry e Algebra 2. 267 sets auditados, 5.564 problemas, progresso local e sem conta.",
    tech: ["Next.js 16", "React 19", "TypeScript", "Tailwind", "KaTeX"],
    tag: "web-app",
    status: "live",
    visibility: "public",
    featured: true,
    liveUrl: "https://matematica.davidluky.com",
    metrics: ["267 audited sets", "5,564 problems", "BNCC + US Common Core"],
    metricsPt: ["267 sets auditados", "5.564 problemas", "BNCC + US Common Core"],
  },
  {
    id: "tibia-services",
    name: "Tibia Services",
    year: 2025,
    description:
      "Marketplace for Tibia game services: hunting, quests, bestiary, and PK. Booking system with in-chat coordination, character verification via TibiaData API, reviews, dispute resolution, and featured listings.",
    descriptionPt:
      "Marketplace para serviços de Tibia: hunts, quests, bestiário e PK. Sistema de reservas com chat, verificação de personagem via TibiaData API, avaliações, resolução de disputas e destaques.",
    tech: ["Next.js 15", "Supabase", "TypeScript", "Tailwind"],
    tag: "marketplace",
    status: "live",
    visibility: "public",
    featured: true,
    liveUrl: "https://tibia.davidluky.com",
    metrics: ["Booking flow", "TibiaData verification", "Reviews + disputes"],
    metricsPt: ["Fluxo de reservas", "Verificação TibiaData", "Avaliações + disputas"],
  },
  {
    id: "tcg-arbitrage",
    name: "TCG Arbitrage",
    year: 2026,
    description:
      "CLI scanner that finds cross-platform price discrepancies between eBay and TCGPlayer for trading cards. Includes 80 tests, 18 commands, persistent SQLite price history, alerts, and the eBay compliance endpoint now served by this site.",
    descriptionPt:
      "Scanner CLI que encontra discrepâncias de preço entre eBay e TCGPlayer para cards colecionáveis. Inclui 80 testes, 18 comandos, histórico de preços persistente em SQLite, alertas e o endpoint de compliance do eBay agora servido por este site.",
    tech: ["Python", "SQLite", "httpx", "Rich", "eBay API"],
    tag: "automation",
    status: "active",
    visibility: "private",
    featured: true,
    metrics: ["80 tests", "18 commands", "SQLite alerts"],
    metricsPt: ["80 testes", "18 comandos", "Alertas em SQLite"],
  },
  {
    id: "game-library",
    name: "Game Library",
    year: 2025,
    description:
      "Desktop app that aggregates game libraries from 10+ platforms — Steam, Xbox, Epic, GOG, PlayStation, Nintendo, Game Pass PC/Xbox, and more — into one unified view. FTS5 search, game deduplication, encrypted tokens, and 3 themes.",
    descriptionPt:
      "App desktop que agrega bibliotecas de jogos de 10+ plataformas — Steam, Xbox, Epic, GOG, PlayStation, Nintendo, Game Pass PC/Xbox e mais — em uma única visualização. Busca FTS5, deduplicação de jogos, tokens criptografados e 3 temas.",
    tech: ["Electron", "React 19", "SQLite", "Zustand", "Vite"],
    tag: "desktop-app",
    status: "active",
    visibility: "private",
    featured: true,
    metrics: ["10+ platforms", "FTS5 search", "Encrypted tokens"],
    metricsPt: ["10+ plataformas", "Busca FTS5", "Tokens criptografados"],
  },
  {
    id: "digipets",
    name: "DigiPets",
    year: 2026,
    description:
      "Virtual pet mobile app: feed pets, play minigames, earn coins, unlock new species, and explore Flutter/mobile architecture patterns through a playful product surface.",
    descriptionPt:
      "App mobile de pet virtual: alimente pets, jogue minigames, ganhe moedas, desbloqueie novas espécies e explore padrões de Flutter/mobile por meio de uma experiência lúdica.",
    tech: ["Flutter", "Dart", "Firebase"],
    tag: "mobile-app",
    status: "wip",
    visibility: "private",
    featured: true,
    metrics: ["Mobile-first", "Minigames", "Firebase-backed"],
    metricsPt: ["Mobile-first", "Minigames", "Com Firebase"],
  },
  {
    id: "gemini-image-generator",
    name: "Gemini Image Generator",
    year: 2026,
    description:
      "Batch image generation pipeline using Google Gemini via Vertex AI. Region rotation for quota management, post-processing (resize, transparency, palette normalization), and dry-run mode. Built for RPG sprites in The Room, but general-purpose by design.",
    descriptionPt:
      "Pipeline de geração de imagens em lote usando Google Gemini via Vertex AI. Rotação de regiões para gestão de quota, pós-processamento (redimensionamento, transparência, normalização de paleta) e modo dry-run. Feito para sprites de RPG no The Room, mas geral por design.",
    tech: ["Python", "Vertex AI", "Gemini API", "PIL"],
    tag: "ai-tooling",
    status: "active",
    visibility: "private",
    metrics: ["Region rotation", "Batch pipeline", "Asset post-processing"],
    metricsPt: ["Rotação de regiões", "Pipeline em lote", "Pós-processamento de assets"],
  },
  {
    id: "mmx-trainer",
    name: "MMX Trainer",
    year: 2026,
    description:
      "Reinforcement learning agent that learns to play Mega Man X on SNES via population-based training. Distributed rollouts across an RTX 5080 workstation and a 32-thread Xeon server; findings feed back into the Megaman X knowledge base.",
    descriptionPt:
      "Agente de reinforcement learning que aprende a jogar Mega Man X no SNES via population-based training. Rollouts distribuídos entre uma workstation RTX 5080 e um servidor Xeon de 32 threads; as descobertas realimentam a knowledge base de Megaman X.",
    tech: ["Python", "PyTorch", "Mesen2", "Lua"],
    tag: "ai-tooling",
    status: "active",
    visibility: "private",
  },
  {
    id: "megaman-x",
    name: "Megaman X",
    year: 2026,
    description:
      "Game engine and remake project built from scratch with raylib. Content-driven architecture with JSON-based level and entity definitions, custom physics, and sprite animation system.",
    descriptionPt:
      "Engine de jogo e projeto de remake feito do zero com raylib. Arquitetura orientada a conteúdo com definições de níveis e entidades em JSON, física customizada e sistema de animação de sprites.",
    tech: ["C++17", "raylib", "CMake", "JSON"],
    tag: "game-dev",
    status: "active",
    visibility: "private",
  },
  {
    id: "power-monitor",
    name: "Power Monitor",
    year: 2026,
    description:
      "24/7 electricity usage logger for a home lab. Samples GPU, CPU, and wall draw every 10 seconds, stores in SQLite, and serves an internal dashboard through a private network path.",
    descriptionPt:
      "Logger de consumo de energia 24/7 para um home lab. Amostra GPU, CPU e consumo da tomada a cada 10 segundos, armazena em SQLite e serve um dashboard interno por uma rota privada.",
    tech: ["Python", "FastAPI", "Next.js 16", "SQLite", "Tailscale"],
    tag: "automation",
    status: "internal",
    visibility: "internal",
    metrics: ["10-second samples", "SQLite history", "Private dashboard"],
    metricsPt: ["Amostras a cada 10s", "Histórico SQLite", "Dashboard privado"],
  },
  {
    id: "gym-checkin-bot",
    name: "Gym Check-in Bot",
    year: 2025,
    description:
      "WhatsApp bot that tracks gym training via message reactions in a group chat. Posts daily, weekly, and monthly reports in PT-BR, auto-detects members, and reconciles check-ins.",
    descriptionPt:
      "Bot de WhatsApp que rastreia treinos na academia via reações em grupo. Publica relatórios diários, semanais e mensais em PT-BR, detecta membros automaticamente e reconcilia check-ins.",
    tech: ["Node.js", "whatsapp-web.js", "SQLite", "PM2"],
    tag: "bot",
    status: "maintained",
    visibility: "private",
  },
  {
    id: "whatsapp-exporter",
    name: "WhatsApp Exporter",
    year: 2025,
    description:
      "Desktop app for exporting WhatsApp conversations to HTML/PDF with full media support. QR-based login, optional ZIP backup merge, rich styled output with lightbox and reactions.",
    descriptionPt:
      "App desktop para exportar conversas do WhatsApp em HTML/PDF com suporte completo de mídia. Login por QR code, merge opcional de backup ZIP, saída estilizada com lightbox e reações.",
    tech: ["Electron", "React 19", "Puppeteer", "Vite"],
    tag: "desktop-app",
    status: "maintained",
    visibility: "private",
  },
  {
    id: "local-ia",
    name: "Local IA",
    year: 2025,
    description:
      "Personal AI workstation for running open-weight models locally via Ollama with intelligent cloud escalation. Claude Code-like CLI, custom MCP servers, skill library, benchmark framework, and cost tracking.",
    descriptionPt:
      "Estação de trabalho pessoal de IA para rodar modelos open-weight localmente via Ollama com escalação inteligente para nuvem. CLI estilo Claude Code, servidores MCP customizados, biblioteca de skills, framework de benchmark e rastreamento de custos.",
    tech: ["Python", "Ollama", "MCP", "Claude Code"],
    tag: "ai-tooling",
    status: "maintained",
    visibility: "private",
  },
  {
    id: "alisson-david-frangullys",
    name: "Alisson David Frangullys",
    year: 2026,
    description:
      "Astro microsite for a personal RPG-style profile, built as a sibling branded site under alisson.davidluky.com. It shares the portfolio stack while experimenting with chaptered storytelling and bilingual content scaffolding.",
    descriptionPt:
      "Microsite em Astro para um perfil pessoal em estilo RPG, criado como site irmão em alisson.davidluky.com. Compartilha a stack do portfólio enquanto experimenta storytelling em capítulos e estrutura bilíngue.",
    tech: ["Astro", "Tailwind", "TypeScript", "Cloudflare"],
    tag: "website",
    status: "wip",
    visibility: "private",
  },
  {
    id: "laptop-bootstrap",
    name: "Laptop Bootstrap",
    year: 2026,
    description:
      "Flash-drive Windows bootstrap that installs and hardens OpenSSH Server, authorizes a public key, scopes the firewall to Private/Domain networks, locks ACLs, and writes a hardware/network inventory file.",
    descriptionPt:
      "Bootstrap Windows via pendrive que instala e endurece o OpenSSH Server, autoriza uma chave pública, limita o firewall a redes Private/Domain, trava ACLs e grava um inventário de hardware/rede.",
    tech: ["PowerShell", "Windows", "OpenSSH"],
    tag: "ops-tooling",
    status: "maintained",
    visibility: "internal",
  },
  {
    id: "gfwl-achievement-unlocker",
    name: "GFWL Achievement Unlocker",
    year: 2025,
    description:
      "Proxy DLL that hijacks xlive.dll to unlock Games for Windows Live achievements in BioShock 2 and other GFWL titles. Watcher thread polls a file for achievement IDs to fire.",
    descriptionPt:
      "DLL proxy que intercepta xlive.dll para desbloquear conquistas do Games for Windows Live no BioShock 2 e outros títulos GFWL. Thread watcher que monitora um arquivo para disparar IDs de conquistas.",
    tech: ["C", "Windows API", "Python", "MinGW"],
    tag: "reverse-engineering",
    status: "maintained",
    visibility: "private",
  },
  {
    id: "franks-stories",
    name: "Frank's Stories",
    year: 2025,
    description:
      "Family storytelling platform with decade-based timeline, DOCX/PDF upload, auto-image extraction, password-gated reader access, and admin dashboard.",
    descriptionPt:
      "Plataforma de histórias familiares com timeline por década, upload de DOCX/PDF, extração automática de imagens, acesso de leitura protegido por senha e painel admin.",
    tech: ["Next.js 15", "SQLite", "Tailwind", "mammoth.js"],
    tag: "web-app",
    status: "maintained",
    visibility: "private",
  },
  {
    id: "games-downloader",
    name: "Games Downloader",
    year: 2025,
    description:
      "Automated preservation system for retro game collections: 200 Xbox 360 titles (1.66 TB) and 1,199 Nintendo 3DS games (347 GB) from archive.org. Batch downloads, ZIP integrity checks, and duplicate tracking.",
    descriptionPt:
      "Sistema automatizado de preservação de coleções retro: 200 títulos de Xbox 360 (1,66 TB) e 1.199 jogos de Nintendo 3DS (347 GB) do archive.org. Downloads em lote, verificação de integridade ZIP e rastreamento de duplicatas.",
    tech: ["Bash", "Python", "Selenium", "curl"],
    tag: "automation",
    status: "archived",
    visibility: "internal",
  },
  {
    id: "midjourney-relay",
    name: "Midjourney Relay",
    year: 2025,
    description:
      "Discord bot that multiplexes a single Midjourney subscription across multiple users. Relays /imagine prompts and returns generated images to a shared channel.",
    descriptionPt:
      "Bot do Discord que multiplexa uma única assinatura do Midjourney entre vários usuários. Retransmite prompts /imagine e retorna imagens geradas em um canal compartilhado.",
    tech: ["Python", "discord.py"],
    tag: "bot",
    status: "archived",
    visibility: "private",
  },
  {
    id: "snes-rom-ripper",
    name: "SNES ROM Ripper",
    year: 2025,
    description:
      "Standalone tool for extracting and decompressing graphics data from SNES ROMs. Implements the RLE3/LZSS algorithm used by Capcom with variable-length bit encoding, back-references, and auto-detection of copier headers.",
    descriptionPt:
      "Ferramenta standalone para extrair e descomprimir dados gráficos de ROMs de SNES. Implementa o algoritmo RLE3/LZSS usado pela Capcom com codificação de bits de comprimento variável, back-references e detecção automática de headers de copier.",
    tech: ["Python"],
    tag: "reverse-engineering",
    status: "maintained",
    visibility: "private",
  },
  {
    id: "davidluky-com",
    name: "davidluky.com",
    year: 2026,
    description:
      "This website: personal hub for projects, gaming profiles, and bio. Static Astro site with blackletter brand morph, bilingual toggle, Cloudflare Workers assets, hardened security headers, and eBay deletion endpoint compliance.",
    descriptionPt:
      "Este site: hub pessoal para projetos, perfis de jogos e bio. Site estático em Astro com morph blackletter, alternância bilíngue, assets em Cloudflare Workers, headers de segurança endurecidos e endpoint de compliance do eBay.",
    tech: ["Astro", "Tailwind", "TypeScript", "Cloudflare Workers"],
    tag: "website",
    status: "live",
    visibility: "public",
    liveUrl: "/",
    repoUrl: "https://github.com/davidluky/davidluky.com",
  },
] as const;

export const featuredProjects = projects.filter((project) => project.featured);
export type LiveProject = Project & { liveUrl: string };
export const liveProjects = projects.filter((project): project is LiveProject => project.liveUrl?.startsWith("http") === true);

export function getProjectTag(project: Project) {
  return projectTags[project.tag];
}

export function getProjectStatus(project: Project) {
  return projectStatuses[project.status];
}

export function getProjectVisibility(project: Project) {
  return projectVisibilities[project.visibility];
}
