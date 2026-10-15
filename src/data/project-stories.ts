import { stats } from './stats';

export type Bilingual = { en: string; pt: string };
const copy = (en: string, pt: string): Bilingual => ({ en, pt });

export const projectStories = [
  {
    id: 'digipets',
    eyebrow: copy('A little world to care for', 'Um pequeno mundo para cuidar'),
    headline: copy('A pet. A home. A new adventure.', 'Um pet. Uma casa. Uma nova aventura.'),
    intro: copy('Care for your pets, discover their personalities and make room for small adventures. DigiPets brings collecting, minigames and a home of your own into one cozy Android game.', 'Cuide dos seus pets, descubra suas personalidades e abra espaço para pequenas aventuras. O DigiPets reúne coleção, minigames e uma casa para chamar de sua em um jogo aconchegante para Android.'),
    cover: '/projects/digipets-cover-20261015.webp',
    coverAlt: copy('Promotional illustration of Flameko in a sunny home beside a garden', 'Arte promocional do Flameko em uma casa ensolarada ao lado do jardim'),
    caption: copy('Promotional illustration inspired by the game. Actual app screens appear below.', 'Arte promocional inspirada no jogo. As telas reais do app aparecem abaixo.'),
    features: [
      { title: copy('Care and collect', 'Cuidar e colecionar'), body: copy('Feed your pets, follow their growth and build a collection with different species and personalities.', 'Alimente seus pets, acompanhe o crescimento deles e monte uma coleção com espécies e personalidades diferentes.') },
      { title: copy('Make yourself at home', 'Uma casa do seu jeito'), body: copy('Decorate your space, tend the garden and personalize your pet’s look.', 'Decore seu espaço, cuide do jardim e personalize o visual do seu pet.') },
      { title: copy('Find your next adventure', 'Sua próxima aventura'), body: copy('Explore regions, play minigames and take a quieter break in Focus Grove.', 'Explore regiões, jogue minigames e faça uma pausa mais tranquila no Bosque do Foco.') },
    ],
    statusTitle: copy('On Google Play', 'Na Google Play'),
    statusBody: copy('The public listing shows version 0.1.150 and the Haunted Mansion update. Check the store for availability on your device.', 'A página pública lista a versão 0.1.150 e a atualização da Mansão Assombrada. Confira na loja a disponibilidade para seu aparelho.'),
    next: copy('The next adventure chapter is being planned. Planned regions and the new update-history view are not announced as released here.', 'O próximo capítulo de aventuras está em planejamento. Regiões planejadas e a nova visualização do histórico de atualizações ainda não são anunciadas aqui como lançadas.'),
    gallery: [
      { src: '/projects/digipets-home-20261010.webp', alt: copy('DigiPets pet home with Flameko', 'Tela inicial do DigiPets com Flameko'), title: copy('Your daily companion', 'Sua companhia do dia a dia') },
      { src: '/projects/digipets-house-20261010.webp', alt: copy('DigiPets decorated house', 'Casa decorada no DigiPets'), title: copy('A home to personalize', 'Uma casa para personalizar') },
      { src: '/projects/digipets-garden-20261010.webp', alt: copy('DigiPets garden and harvest', 'Jardim e colheita do DigiPets'), title: copy('Something new to grow', 'Algo novo para cultivar') },
    ],
    galleryCaption: copy('App screenshots from a local showcase build with fictional progress and balances (October 2026). They illustrate the experience, not a store-version guarantee.', 'Capturas do app em uma versão local de demonstração, com progresso e saldos fictícios (outubro de 2026). Ilustram a experiência, sem garantir a mesma versão na loja.'),
    links: [
      { href: 'https://play.google.com/store/apps/details?id=com.davidluky.digipets', text: copy('View on Google Play ↗', 'Ver na Google Play ↗') },
      { href: '/privacy/digipets/', text: copy('Privacy and account deletion', 'Privacidade e exclusão de conta') },
    ],
  },
  {
    id: 'the-room',
    eyebrow: copy('Windows + browser', 'Windows + navegador'),
    headline: copy('Games bring people together. The Room gives them a place.', 'Jogos aproximam pessoas. The Room dá um lugar para elas.'),
    intro: copy(`Play, chat and build your RPG character in a shared space. The Room started as a C++ desktop app and grew into a platform with ${stats.theRoomGames} games and a web client.`, `Jogue, converse e desenvolva seu personagem de RPG em um espaço compartilhado. The Room começou como um aplicativo desktop em C++ e cresceu para uma plataforma com ${stats.theRoomGames} jogos e um cliente web.`),
    cover: '/projects/the-room-cover-20261015.webp',
    coverAlt: copy('Promotional illustration inspired by The Room creatures', 'Arte promocional inspirada nas criaturas do The Room'),
    caption: copy('Promotional illustration inspired by the project’s creatures. Open the web client to explore the current interface.', 'Arte promocional inspirada nas criaturas do projeto. Abra o cliente web para conhecer a interface atual.'),
    features: [
      { title: copy('Choose your game', 'Escolha seu jogo'), body: copy(`A collection of ${stats.theRoomGames} games, with achievements and tournaments connected to the same community.`, `Uma coleção de ${stats.theRoomGames} jogos, com conquistas e torneios conectados à mesma comunidade.`) },
      { title: copy('Build your character', 'Desenvolva seu personagem'), body: copy(`RPG progression, an economy and ${stats.theRoomAchievements} achievements give each visit something to work toward.`, `Progressão de RPG, economia e ${stats.theRoomAchievements} conquistas dão a cada visita algo para buscar.`) },
      { title: copy('Meet on the web', 'Encontre a turma na web'), body: copy('The React web client brings The Room to the browser alongside the Windows application.', 'O cliente web em React leva The Room ao navegador junto do aplicativo para Windows.') },
    ],
    statusTitle: copy('Windows v1.97 and a published web client', 'Windows v1.97 e cliente web publicado'),
    statusBody: copy('The Windows release and web update were published on October 13, 2026. The browser client is available at play.davidluky.com.', 'A versão para Windows e a atualização web foram publicadas em 13 de outubro de 2026. O cliente para navegador está disponível em play.davidluky.com.'),
    next: copy('The new campaign market, weekly goals and titles are prepared in development. Their production activation is still pending.', 'O novo mercado da campanha, as metas semanais e os títulos estão preparados no desenvolvimento. A ativação em produção ainda está pendente.'),
    gallery: [],
    galleryCaption: copy('', ''),
    links: [
      { href: 'https://play.davidluky.com', text: copy('Open The Room ↗', 'Abrir The Room ↗') },
    ],
  },
  {
    id: 'posop',
    eyebrow: copy('Product study · interactive demo', 'Estudo de produto · demo interativa'),
    headline: copy('A clearer conversation after dental care.', 'Uma conversa mais clara depois do atendimento.'),
    intro: copy('A dental follow-up prototype that connects the patient’s daily check-in with the clinic’s view. Explore the patient, front-desk and dentist perspectives using fictional examples.', 'Um protótipo de acompanhamento odontológico que aproxima o check-in diário do paciente da visão da clínica. Explore as perspectivas de paciente, secretaria e dentista usando exemplos fictícios.'),
    cover: '/projects/posop-20261015.webp',
    coverAlt: copy('Dental follow-up demo showing fictional patient and clinic views', 'Demo de acompanhamento odontológico com visões de paciente e clínica e dados fictícios'),
    caption: copy('Actual demo screen · fictional data · no messages are sent to a clinic.', 'Tela real da demonstração · dados fictícios · nenhuma mensagem é enviada à clínica.'),
    features: [
      { title: copy('A patient’s daily view', 'O dia a dia do paciente'), body: copy('Try the example check-ins, dose records and follow-up journey.', 'Experimente os check-ins, os registros de doses e o percurso de acompanhamento dos exemplos.') },
      { title: copy('A shared clinic view', 'A visão da clínica'), body: copy('Switch between front-desk and dentist roles to understand the proposed review workflow.', 'Alterne entre secretaria e dentista para entender o fluxo proposto de acompanhamento.') },
      { title: copy('A safe place to explore', 'Um espaço para explorar'), body: copy('Changes last only in the current tab. Reload to start again; any example export stays local.', 'As alterações duram apenas na aba atual. Recarregue para recomeçar; uma exportação de exemplo gera um arquivo local.') },
    ],
    statusTitle: copy('Demo v6 · provisional name', 'Demo v6 · nome provisório'),
    statusBody: copy('The public demonstration is available as “Dentist ↔ Paciente”. It uses fictional records and simulated notifications; it is not a patient-care service.', 'A demonstração pública está disponível como “Dentist ↔ Paciente”. Usa registros fictícios e notificações simuladas; não é um serviço de atendimento a pacientes.'),
    next: copy('A real pilot still depends on clinic definitions, consent and record-retention decisions, production setup and validation on the clinic’s devices.', 'Um piloto real ainda depende das definições da clínica, do consentimento e da guarda dos registros, da configuração de produção e da validação nos aparelhos da clínica.'),
    gallery: [],
    galleryCaption: copy('', ''),
    links: [
      { href: 'https://nathalia.davidluky.com', text: copy('Explore the demo ↗', 'Explorar a demonstração ↗') },
    ],
  },
] as const;
