export const sharedStrings = {
  en: {
    nav_projects: 'Projects',
    nav_gaming: 'Gaming',
    nav_about: 'About',
    nav_play: 'Play The Room',
    footer_projects: 'Projects',
    footer_all_projects: 'All Projects',
    footer_explore: 'Explore',
    footer_profiles: 'Gaming',
    footer_about: 'About',
    footer_connect: 'Connect',
  },
  pt: {
    nav_projects: 'Projetos',
    nav_gaming: 'Jogos',
    nav_about: 'Sobre',
    nav_play: 'Jogar The Room',
    footer_projects: 'Projetos',
    footer_all_projects: 'Todos os Projetos',
    footer_explore: 'Explorar',
    footer_profiles: 'Jogos',
    footer_about: 'Sobre',
    footer_connect: 'Contato',
  },
} as const;

export type Language = 'en' | 'pt';

const LANGUAGE_STORAGE_KEY = 'dl-lang';

export function getLanguage(): Language {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'pt' ? 'pt' : 'en';
  } catch {
    return 'en';
  }
}

export function setLanguage(lang: Language) {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  syncLanguageControls(lang);
}

export function toggleLanguage(): Language {
  const nextLang = getLanguage() === 'en' ? 'pt' : 'en';
  setLanguage(nextLang);
  return nextLang;
}

export function syncLanguageControls(lang: Language = getLanguage()) {
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

  const label = lang === 'pt' ? 'PT' : 'EN';
  document.querySelectorAll('[data-lang-label]').forEach((el) => {
    el.textContent = label;
  });
}

export function applyI18n(pageStrings: Record<string, Record<string, string>>) {
  const lang = getLanguage();
  const shared = lang === 'pt' ? sharedStrings.pt : sharedStrings.en;
  const page = pageStrings[lang] || {};
  const merged = { ...shared, ...page };

  syncLanguageControls(lang);

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
