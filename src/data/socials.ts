export interface SocialProfile {
  platform: string;
  handle: string;
  url: string;
  role: string;
  rolePt: string;
  kind: "code" | "professional" | "writing" | "video" | "thinking" | "personal";
}

export const socialProfiles: readonly SocialProfile[] = [
  {
    platform: "GitHub",
    handle: "davidluky",
    url: "https://github.com/davidluky",
    role: "Public code, repos, and technical profile",
    rolePt: "Código público, repositórios e perfil técnico",
    kind: "code",
  },
  {
    platform: "LinkedIn",
    handle: "Alisson Frangullys",
    url: "https://www.linkedin.com/in/alisson-frangullys-06615b251",
    role: "Engineering background and professional profile",
    rolePt: "Formação em engenharia e perfil profissional",
    kind: "professional",
  },
  {
    platform: "Instagram",
    handle: "@alisson_frangullys",
    url: "https://www.instagram.com/alisson_frangullys/",
    role: "Personal public presence",
    rolePt: "Presença pública pessoal",
    kind: "personal",
  },
  {
    platform: "Writing",
    handle: "@textosdi.versos",
    url: "https://www.instagram.com/textosdi.versos/",
    role: "Original Portuguese texts and verses",
    rolePt: "Textos e versos autorais em português",
    kind: "writing",
  },
  {
    platform: "YouTube",
    handle: "Alisson Frangullys",
    url: "https://www.youtube.com/channel/UCn5wUS9RhsGojS3k3kiBJvw",
    role: "Videos, stories, and experiments",
    rolePt: "Vídeos, histórias e experimentos",
    kind: "video",
  },
  {
    platform: "LessWrong",
    handle: "alisson-frangullys",
    url: "https://www.lesswrong.com/users/alisson-frangullys",
    role: "AI, reasoning, and long-form thinking",
    rolePt: "IA, raciocínio e pensamento longo",
    kind: "thinking",
  },
  {
    platform: "Personal",
    handle: "alisson.davidluky.com",
    url: "https://alisson.davidluky.com",
    role: "Personal about-me page",
    rolePt: "Página pessoal sobre mim",
    kind: "personal",
  },
];
