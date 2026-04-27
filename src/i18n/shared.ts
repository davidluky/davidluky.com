export const sharedStrings = {
  en: {
    nav_projects: 'Projects',
    nav_gaming: 'Gaming',
    nav_about: 'About',
    nav_play: 'Play The Room',
    footer_projects: 'Projects',
    footer_all_projects: 'All Projects',
    footer_gaming: 'Gaming',
    footer_profiles: 'Profiles',
    footer_connect: 'Connect',
  },
  pt: {
    nav_projects: 'Projetos',
    nav_gaming: 'Jogos',
    nav_about: 'Sobre',
    nav_play: 'Jogar The Room',
    footer_projects: 'Projetos',
    footer_all_projects: 'Todos os Projetos',
    footer_gaming: 'Jogos',
    footer_profiles: 'Perfis',
    footer_connect: 'Contato',
  },
} as const;

export function applyI18n(pageStrings: Record<string, Record<string, string>>) {
  const lang = localStorage.getItem('dl-lang') || 'en';
  const shared = lang === 'pt' ? sharedStrings.pt : sharedStrings.en;
  const page = pageStrings[lang] || {};
  const merged = { ...shared, ...page };

  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n')!;
    if (key in merged) {
      const val = merged[key as keyof typeof merged];
      if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    }
  });

  return lang;
}
