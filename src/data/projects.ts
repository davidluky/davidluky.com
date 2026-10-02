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
  "creative-pipeline": {
    label: "Creative Pipeline",
    labelPt: "Pipeline Criativo",
    colorClass: "text-[#facc15]",
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
  "personal-system": {
    label: "Personal System",
    labelPt: "Sistema Pessoal",
    colorClass: "text-[#2dd4bf]",
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
  image?: string;
  imageAlt?: string;
  imageAltPt?: string;
  metrics?: readonly string[];
  metricsPt?: readonly string[];
}

export const projects: readonly Project[] = [
  {
    id: "the-room",
    name: "The Room",
    year: 2020,
    description:
      `Multiplayer social platform with ${stats.theRoomGames} games, a full turn-based RPG with graphical mode (7 zones, endgame boss), real-time chat, ${stats.theRoomAchievements} achievements, tournaments, economy, and admin dashboard. Native v1.85 improves shutdown reliability in standard and graphical builds and refreshes the contributor guides.`,
    descriptionPt:
      `Plataforma social multiplayer com ${stats.theRoomGames} jogos, um RPG por turnos completo com modo gráfico (7 zonas, boss endgame), chat em tempo real, ${stats.theRoomAchievements} conquistas, torneios, economia e painel admin. A versão nativa v1.85 melhora a confiabilidade ao fechar os aplicativos padrão e gráfico e atualiza os guias para colaboradores.`,
    tech: ["C++17", "Firebase", "libcurl", "raylib", "Windows API"],
    tag: "game-platform",
    status: "active",
    visibility: "private",
    featured: true,
    image: "/projects/the-room.webp",
    imageAlt: "Pixel art RPG monsters from The Room sprite set",
    imageAltPt: "Monstros de RPG em pixel art do acervo de sprites do The Room",
    metrics: [`${stats.theRoomGames} games`, `${stats.theRoomAchievements} achievements`, "Native v1.85 maintainability"],
    metricsPt: [`${stats.theRoomGames} jogos`, `${stats.theRoomAchievements} conquistas`, "Manutenção nativa v1.85"],
  },
  {
    id: "the-room-web",
    name: "The Room Web Client",
    year: 2024,
    description:
      "Browser companion to The Room, with shared accounts and progress, real-time chat, games, an RPG, and three visual themes. A coordinated update to account protection and game-state privacy is in development; those changes have not been released to the live web client.",
    descriptionPt:
      "Versão de navegador do The Room, com contas e progresso compartilhados, chat em tempo real, jogos, RPG e três temas visuais. Uma atualização coordenada de proteção das contas e privacidade das partidas está em desenvolvimento; essas mudanças ainda não foram publicadas no cliente web.",
    tech: ["React 19", "TypeScript", "Tailwind", "Firebase", "Vite"],
    tag: "web-app",
    status: "live",
    visibility: "public",
    featured: true,
    liveUrl: "https://play.davidluky.com",
    image: "/projects/the-room-web.webp",
    imageAlt: "The Room Web login screen with language selector",
    imageAltPt: "Tela de login do The Room Web com seletor de idioma",
    metrics: ["Shared progress", "3 themes", "Update in development"],
    metricsPt: ["Progresso compartilhado", "3 temas", "Atualização em desenvolvimento"],
  },
  {
    id: "matematica-elementar",
    name: "Matemática Elementar",
    year: 2026,
    description:
      "Math practice with 281 audited sets across BNCC and US Common Core curricula, worked answers, and progress saved in your browser. The quick explanations include an interactive LCM/GCF illustration: follow two repeating cycles or try equal ribbon cuts. No account required.",
    descriptionPt:
      "Prática de matemática com 281 listas auditadas nos currículos BNCC e US Common Core, gabaritos explicados e progresso salvo no navegador. As explicações rápidas incluem uma ilustração interativa de MMC/MDC: acompanhe dois ciclos ou experimente cortes iguais em fitas. Sem precisar de conta.",
    tech: ["Next.js 16", "React 19", "TypeScript", "Tailwind", "KaTeX"],
    tag: "web-app",
    status: "live",
    visibility: "public",
    featured: true,
    liveUrl: "https://matematica.davidluky.com",
    image: "/projects/matematica-elementar.webp",
    imageAlt: "Matemática Elementar home page with grade selection cards",
    imageAltPt: "Página inicial do Matemática Elementar com cards de seleção de série",
    metrics: ["281 audited sets", "Animated LCM / GCF", "BNCC + US Common Core"],
    metricsPt: ["281 listas auditadas", "MMC / MDC animados", "BNCC + US Common Core"],
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
    image: "/projects/tibia-services.webp",
    imageAlt: "Tibia Services landing page with marketplace call to action",
    imageAltPt: "Landing page do Tibia Services com chamada do marketplace",
    metrics: ["Booking flow", "TibiaData verification", "Reviews + disputes"],
    metricsPt: ["Fluxo de reservas", "Verificação TibiaData", "Avaliações + disputas"],
  },
  {
    id: "tcg-arbitrage",
    name: "TCG Arbitrage",
    year: 2026,
    description:
      "CLI scanner that finds cross-platform price discrepancies between eBay and TCGPlayer for trading cards. Includes 82 tests, 18 commands, persistent SQLite price history, alerts, and the eBay compliance endpoint now served by this site.",
    descriptionPt:
      "Scanner CLI que encontra discrepâncias de preço entre eBay e TCGPlayer para cards colecionáveis. Inclui 82 testes, 18 comandos, histórico de preços persistente em SQLite, alertas e o endpoint de compliance do eBay agora servido por este site.",
    tech: ["Python", "SQLite", "httpx", "Rich", "eBay API"],
    tag: "automation",
    status: "active",
    visibility: "private",
    featured: true,
    metrics: ["82 tests", "18 commands", "SQLite alerts"],
    metricsPt: ["82 testes", "18 comandos", "Alertas em SQLite"],
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
    image: "/projects/digipets.webp",
    imageAlt: "DigiPets desktop smoke screenshot showing a pet and navigation tools",
    imageAltPt: "Screenshot desktop do DigiPets mostrando um pet e ferramentas de navegação",
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
    name: "Mega Man X Engine",
    year: 2026,
    description:
      "A C++ project that runs the original Mega Man X cartridge's code, with recorded gameplay compared frame by frame against the original. The public site has short gameplay videos, a dated news timeline, and the X1 checklist with verified and unfinished work. The checklist is an index, not a percentage of playable content. Original engine source is available under MIT; game assets are not included.",
    descriptionPt:
      "Projeto em C++ que executa o código do cartucho original de Mega Man X, com gravações comparadas quadro a quadro com o original. O site público reúne vídeos do jogo, uma timeline de novidades e o checklist do X1 com o que já foi verificado e o que falta. O checklist é um índice, não uma porcentagem do conteúdo jogável. O código original da engine está disponível sob MIT; os assets do jogo não estão incluídos.",
    tech: ["C++17", "raylib", "CMake", "JSON"],
    tag: "game-dev",
    status: "active",
    visibility: "public",
    image: "/projects/megaman-x.webp",
    liveUrl: "https://megaman.davidluky.com/",
    repoUrl: "https://github.com/davidluky/megaman-x-engine",
    metrics: ["Gameplay videos", "Verified X1 checklist", "PT / EN news"],
    metricsPt: ["Vídeos do jogo", "Checklist verificado do X1", "Novidades PT / EN"],
    imageAlt: "Autotest frames from the custom Megaman X raylib engine",
    imageAltPt: "Frames de autoteste da engine customizada de Megaman X em raylib",
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
      "WhatsApp bot that tracks gym training via message reactions in a group chat. The Phase 1 personal-trainer mode adds allowlisted private chats, PT-BR commands/natural recaps for workouts, food, hydration, body metrics, and pain, scheduled morning plans, evening reviews, and safe CSV exports into a private profile folder.",
    descriptionPt:
      "Bot de WhatsApp que rastreia treinos na academia via reações em grupo. O modo personal trainer Fase 1 adiciona chats privados autorizados, comandos e recaps naturais em PT-BR para treinos, comida, hidratação, métricas corporais e dor, planos pela manhã, revisões à noite e exportação CSV segura para uma pasta de perfil privada.",
    tech: ["Node.js", "whatsapp-web.js", "SQLite", "PM2", "Jest"],
    tag: "bot",
    status: "active",
    visibility: "private",
    featured: true,
    metrics: ["Private PT mode", "Morning/evening coaching", "CSV profile exports"],
    metricsPt: ["Modo personal privado", "Coaching manhã/noite", "Exportação CSV"],
  },
  {
    id: "ccb-hinos-rock-suno",
    name: "CCB Hinos Rock Suno Pipeline",
    year: 2026,
    description:
      "Production pipeline for non-commercial rock and epic-rock hymn arrangements. It includes a 480-hymn tracker, catalog CSV/JSON, rights review, Suno prompt queue and stubs, cover/video scripts, YouTube metadata, upload queue, and an offline TV workflow. It is a planning system, not a lyrics archive, and publication stays gated by rights clearance.",
    descriptionPt:
      "Pipeline de produção para arranjos não comerciais de hinos em rock e rock épico. Inclui tracker de 480 hinos, catálogo CSV/JSON, revisão de direitos, fila e stubs de prompts para Suno, scripts de capa/vídeo, metadados de YouTube, fila de upload e fluxo offline para TV. É um sistema de planejamento, não um arquivo de letras, e publicação continua condicionada à liberação de direitos.",
    tech: ["Node.js", "PowerShell", "Excel", "Suno", "YouTube Workflow"],
    tag: "creative-pipeline",
    status: "wip",
    visibility: "private",
    image: "/projects/ccb-hinos-rock-suno.webp",
    imageAlt: "Rock hymn cover artwork from the CCB Hinos Suno pipeline",
    imageAltPt: "Arte de capa de hino rock do pipeline CCB Hinos Suno",
    metrics: ["480-hymn tracker", "Rights-first workflow", "Video/upload queue"],
    metricsPt: ["Tracker de 480 hinos", "Fluxo com direitos primeiro", "Fila de vídeo/upload"],
  },
  {
    id: "personal-profile",
    name: "Personal Trainer Profile",
    year: 2026,
    description:
      "Private planning profile for training, nutrition, recovery, progress reviews, and future Gym Bot personal-trainer integration. It organizes measurements, health summaries, inventories, mobility/recomposition plans, logs, and reviewed exports while staying internal and explicitly outside medical-advice territory.",
    descriptionPt:
      "Perfil privado de planejamento para treino, nutrição, recuperação, revisões de progresso e futura integração com o modo personal trainer do Gym Bot. Organiza medidas, resumos de saúde, inventários, planos de mobilidade/recomposição, logs e exports revisados, mantendo tudo interno e explicitamente fora do papel de aconselhamento médico.",
    tech: ["YAML", "CSV", "Markdown", "SQLite exports", "Gym Bot"],
    tag: "personal-system",
    status: "internal",
    visibility: "internal",
    metrics: ["Private profile", "Trainer-mode handoff", "Progress logs"],
    metricsPt: ["Perfil privado", "Integração com modo personal", "Logs de progresso"],
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
      "A bilingual personal site told through an RPG character sheet: life chapters, engineering, games, and writing. The textos di.versos archive brings together the daily texts from 2022 and newer pieces, with reading by date, themes, and search.",
    descriptionPt:
      "Site pessoal bilíngue contado como uma ficha de personagem de RPG: capítulos de vida, engenharia, jogos e escrita. O acervo textos di.versos reúne os textos diários de 2022 e escritos mais recentes, com leitura por data, temas e busca.",
    tech: ["Astro", "Tailwind", "TypeScript", "Cloudflare"],
    tag: "website",
    status: "live",
    visibility: "public",
    liveUrl: "https://alisson.davidluky.com",
    image: "/projects/alisson-david-frangullys.webp",
    imageAlt: "Alisson David Frangullys personal site hero page",
    imageAltPt: "Hero do site pessoal Alisson David Frangullys",
  },
  {
    id: "painel-da-vida",
    name: "Painel da Vida",
    year: 2026,
    description:
      "Seven origins in a life simulation built for mobile. Balance your 24-hour day and work toward financial freedom in Brazil, India, Somalia or Venezuela. Advance a month or a year, stop at decisions, and see the actual costs and effects of events. Progress stays in your browser. Includes optional adult content and a hyperinflation challenge.",
    descriptionPt:
      "Sete origens em um simulador de vida feito para o celular. Equilibre as 24 horas do dia e busque a liberdade financeira no Brasil, Índia, Somália ou Venezuela. Avance um mês ou um ano, pare nas decisões e veja os custos e efeitos reais dos eventos. O progresso fica no navegador. Inclui conteúdo adulto opcional e um desafio de hiperinflação.",
    tech: ["Astro", "TypeScript", "Tailwind", "Cloudflare"],
    tag: "web-app",
    status: "live",
    visibility: "public",
    liveUrl: "https://vida.davidluky.com",
    image: "/projects/painel-da-vida.webp",
    imageAlt: "Painel da Vida dashboard with hour sliders, colored level bars and the monthly budget",
    imageAltPt: "Painel da Vida com controles de horas, barras de nível coloridas e o orçamento do mês",
  },
  {
    id: "matheus-manual-pescados",
    name: "Manual de Pescados - Matheus",
    year: 2026,
    description:
      "Password-protected seafood handling manual with a signed-cookie gate and a selector for three editions: the original manual, an editorial magazine, and a new photography book with responsive AVIF/WebP plates.",
    descriptionPt:
      "Manual de manipulação de pescados protegido por senha, com sessão assinada por cookie e um seletor para três edições: manual original, revista editorial e novo livro fotográfico com pranchas responsivas em AVIF/WebP.",
    tech: ["HTML", "CSS", "Cloudflare Workers Assets"],
    tag: "website",
    status: "wip",
    visibility: "public",
    liveUrl: "https://matheus.davidluky.com/",
    image: "/projects/matheus-manual-pescados.webp",
    imageAlt: "Manual de Pescados landing page with three edition options",
    imageAltPt: "Landing page do Manual de Pescados com três opções de edição",
    metrics: ["Password gate", "8 photo chapters", "AVIF/WebP plates"],
    metricsPt: ["Acesso com senha", "8 capítulos fotográficos", "Pranchas AVIF/WebP"],
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
      "Family memories presented as a timeline by decade and a book-style reader. The first two recovered stories, from 1943 and 1946, are available to read on desktop or mobile.",
    descriptionPt:
      "Memórias de família em uma linha do tempo por década e um leitor em estilo livro. As duas primeiras histórias recuperadas, de 1943 e 1946, estão disponíveis para ler no computador ou no celular.",
    tech: ["Next.js 16", "JSON", "Tailwind", "mammoth.js"],
    tag: "web-app",
    status: "live",
    visibility: "private",
    liveUrl: "https://frank.davidluky.com",
    image: "/projects/franks-stories.webp",
    imageAlt: "Frank's Stories timeline landing page for the 1940s",
    imageAltPt: "Timeline inicial do Frank's Stories mostrando a década de 1940",
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
    id: "luxury-office-studio-8bit",
    name: "Office Render 8-Bit",
    year: 2026,
    description:
      "Local Vite tool for approving cinematic luxury-office stills, attaching audio, and exporting browser-generated WEBM video or audio-only output. Includes image approval gate, duration, FPS, and sequential-or-mix audio controls.",
    descriptionPt:
      "Ferramenta Vite local para aprovar imagens de escritório luxuoso, anexar áudio e exportar vídeo WEBM ou áudio gerados no browser. Inclui gate de aprovação de imagem, controles de duração, FPS e mixagem sequencial ou simultânea.",
    tech: ["Vite", "JavaScript", "Canvas API"],
    tag: "creative-pipeline",
    status: "active",
    visibility: "private",
    repoUrl: "https://github.com/davidluky/luxury-office-studio-8bit",
  },
  {
    id: "kumiko-frame-p1s",
    name: "Kumiko Frame (P1S)",
    year: 2026,
    description:
      "3D-print planning and production system for a modular kumiko-style wall panel on a Bambu Lab P1S. Tracks parts, slicer settings, tolerance tests, and the full assembly workflow from first test print to wall mount.",
    descriptionPt:
      "Sistema de planejamento e produção para um painel de parede modular estilo kumiko no Bambu Lab P1S. Rastreia peças, configurações de fatiador, testes de tolerância e o fluxo completo de montagem desde o primeiro teste até a instalação.",
    tech: ["Bambu Lab P1S", "MakerWorld", "Markdown", "CSV"],
    tag: "creative-pipeline",
    status: "wip",
    visibility: "internal",
  },
  {
    id: "sync-scripts",
    name: "Retro Collection Sync",
    year: 2026,
    description:
      "PowerShell toolkit for syncing Xbox 360 and Nintendo 3DS game collections across machines. Includes ETA tracking, stale mtime repair, integrity verification, and per-platform progress monitoring.",
    descriptionPt:
      "Kit PowerShell para sincronizar coleções de Xbox 360 e Nintendo 3DS entre máquinas. Inclui rastreamento de ETA, reparo de mtimes antigos, verificação de integridade e monitoramento de progresso por plataforma.",
    tech: ["PowerShell"],
    tag: "ops-tooling",
    status: "maintained",
    visibility: "internal",
  },
  {
    id: "transfers-ops",
    name: "Xeon Server Ops",
    year: 2026,
    description:
      "PowerShell toolkit for Xeon home-lab server operations: data sync with stall detection, firewall scoping, ACL management, WinRM hardening, security audit, and Windows Update automation via Tailscale.",
    descriptionPt:
      "Kit PowerShell para operações no servidor Xeon do home lab: sync de dados com detecção de stall, escopo de firewall, gestão de ACLs, hardening de WinRM, auditoria de segurança e automação de Windows Update via Tailscale.",
    tech: ["PowerShell", "Windows", "Tailscale"],
    tag: "ops-tooling",
    status: "active",
    visibility: "internal",
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
