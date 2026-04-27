import { stats } from "./stats";

export interface Project {
  name: string;
  description: string;
  descriptionPt: string;
  tech: string[];
  tag: string;
  tagPt: string;
  link: string | null;
}

export const projects: Project[] = [
  {
    name: "The Room",
    description:
      `Multiplayer social platform with ${stats.theRoomGames} games, a full turn-based RPG with graphical mode (7 zones, endgame boss), real-time chat, ${stats.theRoomAchievements} achievements, tournaments, economy, and admin dashboard. The original C++ desktop client that started it all.`,
    descriptionPt:
      `Plataforma social multiplayer com ${stats.theRoomGames} jogos, um RPG por turnos completo com modo gráfico (7 zonas, boss endgame), chat em tempo real, ${stats.theRoomAchievements} conquistas, torneios, economia e painel admin. O cliente desktop C++ original que começou tudo.`,
    tech: ["C++17", "Firebase", "libcurl", "raylib", "Windows API"],
    tag: "Game Platform",
    tagPt: "Plataforma de Jogos",
    link: null,
  },
  {
    name: "The Room — Web Client",
    description:
      "Full React web companion to The Room, sharing the same Firebase backend. 40 routes, 3 visual themes (Terminal, Hybrid, Modern), bilingual (EN/PT-BR), PWA-ready.",
    descriptionPt:
      "Companion web completo em React para o The Room, compartilhando o mesmo backend Firebase. 40 rotas, 3 temas visuais (Terminal, Híbrido, Moderno), bilíngue (EN/PT-BR), pronto para PWA.",
    tech: ["React 19", "TypeScript", "Tailwind", "Firebase", "Vite"],
    tag: "Web App",
    tagPt: "App Web",
    link: "https://play.davidluky.com",
  },
  {
    name: "Tibia Services",
    description:
      "Marketplace for Tibia game services — hunting, quests, bestiary, PK. Booking system with in-chat, character verification via TibiaData API, reviews, dispute resolution, and featured listings.",
    descriptionPt:
      "Marketplace para serviços de Tibia — hunts, quests, bestiário, PK. Sistema de reservas com chat, verificação de personagem via TibiaData API, avaliações, resolução de disputas e destaques.",
    tech: ["Next.js 15", "Supabase", "TypeScript", "Tailwind"],
    tag: "Marketplace",
    tagPt: "Marketplace",
    link: "https://tibia.davidluky.com",
  },
  {
    name: "Game Library",
    description:
      "Desktop app that aggregates game libraries from Steam, Xbox, Epic, GOG, PlayStation, Nintendo, Game Pass, and more into a single unified view. FTS5 search, game deduplication, encrypted tokens, 3 themes.",
    descriptionPt:
      "App desktop que agrega bibliotecas de jogos de Steam, Xbox, Epic, GOG, PlayStation, Nintendo, Game Pass e mais em uma única visualização. Busca FTS5, deduplicação de jogos, tokens criptografados, 3 temas.",
    tech: ["Electron", "React 19", "SQLite", "Zustand", "Vite"],
    tag: "Desktop App",
    tagPt: "App Desktop",
    link: null,
  },
  {
    name: "Gym Check-in Bot",
    description:
      "WhatsApp bot that tracks gym training via message reactions in a group chat. Posts daily, weekly, and monthly reports in PT-BR. Auto-detects members and reconciles check-ins.",
    descriptionPt:
      "Bot de WhatsApp que rastreia treinos na academia via reações em grupo. Publica relatórios diários, semanais e mensais em PT-BR. Detecta membros automaticamente e reconcilia check-ins.",
    tech: ["Node.js", "whatsapp-web.js", "SQLite", "PM2"],
    tag: "Bot",
    tagPt: "Bot",
    link: null,
  },
  {
    name: "WhatsApp Exporter",
    description:
      "Desktop app for exporting WhatsApp conversations to HTML/PDF with full media support. QR-based login, optional ZIP backup merge, rich styled output with lightbox and reactions.",
    descriptionPt:
      "App desktop para exportar conversas do WhatsApp em HTML/PDF com suporte completo de mídia. Login por QR code, merge opcional de backup ZIP, saída estilizada com lightbox e reações.",
    tech: ["Electron", "React 19", "Puppeteer", "Vite"],
    tag: "Desktop App",
    tagPt: "App Desktop",
    link: null,
  },
  {
    name: "Local IA",
    description:
      "Personal AI workstation for running open-weight models locally via Ollama with intelligent cloud escalation. Claude Code-like CLI, custom MCP servers, skill library, benchmark framework, and cost tracking.",
    descriptionPt:
      "Estação de trabalho pessoal de IA para rodar modelos open-weight localmente via Ollama com escalação inteligente para nuvem. CLI estilo Claude Code, servidores MCP customizados, biblioteca de skills, framework de benchmark e rastreamento de custos.",
    tech: ["Python", "Ollama", "MCP", "Claude Code"],
    tag: "AI Tooling",
    tagPt: "Ferramentas de IA",
    link: null,
  },
  {
    name: "GFWL Achievement Unlocker",
    description:
      "Proxy DLL that hijacks xlive.dll to unlock Games for Windows Live achievements in BioShock 2 and other GFWL titles. Watcher thread polls a file for achievement IDs to fire.",
    descriptionPt:
      "DLL proxy que intercepta xlive.dll para desbloquear conquistas do Games for Windows Live no BioShock 2 e outros títulos GFWL. Thread watcher que monitora um arquivo para disparar IDs de conquistas.",
    tech: ["C", "Windows API", "Python", "MinGW"],
    tag: "Reverse Engineering",
    tagPt: "Engenharia Reversa",
    link: null,
  },
  {
    name: "Frank's Stories",
    description:
      "Family storytelling platform with decade-based timeline, DOCX/PDF upload, auto-image extraction, password-gated reader access, and admin dashboard.",
    descriptionPt:
      "Plataforma de histórias familiares com timeline por década, upload de DOCX/PDF, extração automática de imagens, acesso de leitura protegido por senha e painel admin.",
    tech: ["Next.js 15", "SQLite", "Tailwind", "mammoth.js"],
    tag: "Web App",
    tagPt: "App Web",
    link: null,
  },
  {
    name: "Games Downloader",
    description:
      "Automated preservation system for retro game collections — 200 Xbox 360 titles (1.66 TB) and 1,199 Nintendo 3DS games (347 GB) from archive.org. Batch downloads, ZIP integrity checks, duplicate tracking.",
    descriptionPt:
      "Sistema automatizado de preservação de coleções retro — 200 títulos de Xbox 360 (1,66 TB) e 1.199 jogos de Nintendo 3DS (347 GB) do archive.org. Downloads em lote, verificação de integridade ZIP, rastreamento de duplicatas.",
    tech: ["Bash", "Python", "Selenium", "curl"],
    tag: "Automation",
    tagPt: "Automação",
    link: null,
  },
  {
    name: "Midjourney Relay",
    description:
      "Discord bot that multiplexes a single Midjourney subscription across multiple users. Relays /imagine prompts and returns generated images to a shared channel.",
    descriptionPt:
      "Bot do Discord que multiplexa uma única assinatura do Midjourney entre vários usuários. Retransmite prompts /imagine e retorna imagens geradas em um canal compartilhado.",
    tech: ["Python", "discord.py"],
    tag: "Bot",
    tagPt: "Bot",
    link: null,
  },
  {
    name: "Gemini Image Generator",
    description:
      "Batch image generation pipeline using Google Gemini via Vertex AI. Region rotation for quota management, post-processing (resize, transparency, palette normalization), and dry-run mode. Originally built for RPG sprites in The Room, works for any image type.",
    descriptionPt:
      "Pipeline de geração de imagens em lote usando Google Gemini via Vertex AI. Rotação de regiões para gestão de quota, pós-processamento (redimensionamento, transparência, normalização de paleta) e modo dry-run. Originalmente feito para sprites de RPG no The Room, funciona para qualquer tipo de imagem.",
    tech: ["Python", "Vertex AI", "Gemini API", "PIL"],
    tag: "AI Tooling",
    tagPt: "Ferramentas de IA",
    link: null,
  },
  {
    name: "Megaman X",
    description:
      "Game engine and remake project built from scratch with raylib. Content-driven architecture with JSON-based level and entity definitions, custom physics, and sprite animation system.",
    descriptionPt:
      "Engine de jogo e projeto de remake feito do zero com raylib. Arquitetura orientada a conteúdo com definições de níveis e entidades em JSON, física customizada e sistema de animação de sprites.",
    tech: ["C++17", "raylib", "CMake", "JSON"],
    tag: "Game Dev",
    tagPt: "Desenvolvimento de Jogos",
    link: null,
  },
  {
    name: "MMX Trainer",
    description:
      "Reinforcement learning agent that learns to play Mega Man X on SNES via population-based training. Distributed rollouts across an RTX 5080 workstation and a 32-thread Xeon server; findings feed back into the Megaman X knowledge base.",
    descriptionPt:
      "Agente de reinforcement learning que aprende a jogar Mega Man X no SNES via population-based training. Rollouts distribuídos entre uma workstation RTX 5080 e um servidor Xeon de 32 threads; as descobertas realimentam a knowledge base de Megaman X.",
    tech: ["Python", "PyTorch", "Mesen2", "Lua"],
    tag: "AI Tooling",
    tagPt: "Ferramentas de IA",
    link: null,
  },
  {
    name: "Power Monitor",
    description:
      "24/7 electricity usage logger for a home lab. Samples GPU, CPU, and wall draw every 10 seconds, stores in SQLite, and serves a live dashboard. Collector runs as a Windows Scheduled Task, API on Tailscale, dashboard on Vercel.",
    descriptionPt:
      "Logger de consumo de energia 24/7 para um home lab. Amostra GPU, CPU e consumo da tomada a cada 10 segundos, armazena em SQLite e serve um dashboard ao vivo. Coletor roda como Tarefa Agendada do Windows, API via Tailscale, dashboard na Vercel.",
    tech: ["Python", "FastAPI", "Next.js 16", "SQLite", "Vercel"],
    tag: "Automation",
    tagPt: "Automação",
    link: "https://power.davidluky.com",
  },
  {
    name: "Matemática Elementar",
    description:
      "BNCC-aligned math practice site for Brazilian students (6th–9th grade). Problem sets with answer keys, self-check progress tracking, and mastery by grade — all stored locally in the browser, no account needed.",
    descriptionPt:
      "Site de matemática alinhado à BNCC para estudantes brasileiros (6º ao 9º ano). Problem sets com gabaritos, acompanhamento de progresso por auto-correção e domínio por série — tudo salvo localmente no navegador, sem necessidade de conta.",
    tech: ["Next.js 16", "React 19", "TypeScript", "Tailwind", "KaTeX"],
    tag: "Web App",
    tagPt: "App Web",
    link: "https://matematica.davidluky.com",
  },
  {
    name: "SNES ROM Ripper",
    description:
      "Standalone tool for extracting and decompressing graphics data from SNES ROMs. Implements the RLE3/LZSS algorithm used by Capcom with variable-length bit encoding, back-references, and auto-detection of copier headers.",
    descriptionPt:
      "Ferramenta standalone para extrair e descomprimir dados gráficos de ROMs de SNES. Implementa o algoritmo RLE3/LZSS usado pela Capcom com codificação de bits de comprimento variável, back-references e detecção automática de headers de copier.",
    tech: ["Python"],
    tag: "Reverse Engineering",
    tagPt: "Engenharia Reversa",
    link: null,
  },
  {
    name: "davidluky.com",
    description:
      "This website. Personal hub for projects, gaming profiles, and bio. Static site with blackletter brand morph, bilingual toggle, and zero JS besides scroll animation.",
    descriptionPt:
      "Este site. Hub pessoal para projetos, perfis de jogos e bio. Site estático com morph blackletter, alternância bilíngue e zero JS além da animação de scroll.",
    tech: ["Astro", "Tailwind", "TypeScript", "Cloudflare"],
    tag: "Website",
    tagPt: "Website",
    link: "/",
  },
];
