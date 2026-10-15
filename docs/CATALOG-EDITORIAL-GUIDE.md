# Guia editorial do catálogo

Revisão: **15/10/2026** (America/New_York). Fonte inicial do hub: `7a23b7fb`.
Este documento é de manutenção e não deve ser importado pelo código enviado ao navegador.
As fontes locais abaixo são referências de projeto, sem dados de contas, clientes, conversas,
pacientes, credenciais ou recibos operacionais no catálogo público.

## Contrato de dados

A fonte única permanece `src/data/projects.ts`. Os 30 IDs existentes foram preservados;
Ada, PosOp, Xadrez modular e a contribuição ao Chess Review MCP elevam o catálogo a 34 registros.
Os seis destaques são DigiPets, Mega Man X, The Room nativo, Matemática, Ada e PosOp.

| Campo | Significado |
| --- | --- |
| `status` | Atividade editorial histórica do projeto; não prova acesso nem publicação. |
| `visibility` | Visibilidade da fonte/repositório. Repo privado pode ter produto público. |
| `availability` | `public`, `restricted`, `demo`, `beta`, `internal` ou `unavailable`: o que o visitante pode acessar. O CTA distingue site, loja e código público. |
| `releaseState` | `development`, `submitted`, `available`, `maintained` ou `archived`. O marco identifica a versão/entrega a que o estado se refere. |
| `lastReviewedAt` | Data da revisão dos fatos editoriais; não é data de release, última atividade ou novo teste funcional. |
| `latestMilestone` / `latestMilestonePt` | Mesmo marco e mesma limitação nos dois idiomas, sem caminhos privados. |
| `detailSlug` | Página detalhada opcional. Nesta rodada: `digipets`, `the-room`, `posop`. |
| `image` / `imageAlt` / `imageAltPt` | Arquivo existente e descrição fiel nos dois idiomas. Captura de produto e ilustração promocional precisam ser distinguidas. |

`projectAvailabilities` e `projectReleaseStates` exportam rótulos EN/PT.
`getProjectAvailability(project)` retorna o objeto de rótulos, como os demais helpers.
A prioridade é o valor explícito. Sem ele, ferramenta interna permanece interna;
um link de produto ou código público permite acesso público; os demais ficam sem acesso público.
Todos os 34 registros desta rodada têm acesso e estado explícitos.

## Evidência pública de DigiPets

- URL consultada sem conta: `https://play.google.com/store/apps/details?id=com.davidluky.digipets&hl=en_US`.
- Resposta observada em **2026-10-15T20:32:03.9404854Z**: HTTP 200.
- Título: `DigiPets - Apps on Google Play`; botão com `aria-label="Install"`.
- Data apresentada pela loja: `Oct 15, 2026`.
- Trecho do payload público: `[[["0.1.150"]]]`; as notas começam com `New region: the Haunted Mansion, after zone 5`.
- Estado editorial: `availability: "public"`, `releaseState: "available"`; a apresentação remete à loja para a disponibilidade por aparelho.
- SHA-256 do corpo HTML UTF-8 observado: `964853a31e3c20b5236c46ba1a6a53cc4da8e51f208d7a37aff0eb23a57e324f`.
- O número interno **152**, a disponibilidade para cada região/aparelho e a instalação física não foram conferidos pela página pública. A data da loja, sozinha, não determina a versão.

O handoff local `05dc4151`, `pubspec.yaml` e o flight recorder registram o envio
**0.1.150+152** em 15/10, com revisão Google pendente naquele momento. A observação
pública posterior confirma que a loja já anuncia a versão nominal 0.1.150; não
reutilizar a nota anterior como prova de que essa versão continua indisponível.
O plano AT00–AT16 (Trilha Viva e histórico completo de atualizações) continua separado
das capacidades entregues. Não descrevê-lo como implementado sem nova evidência.

## Fontes e limites da revisão

Os caminhos são relativos ao workspace de manutenção `Alisson`, fora do payload público.
O plano canônico e seus trechos detalhados estão em `_ops/docs/websites-update-2026-10-15/`.
Não duplicar recibos de produto neste repositório; registrar somente o ponteiro e a conclusão editorial.

| Registros | Fonte consultada | Decisão e limite |
| --- | --- | --- |
| The Room / Web | `the-room/FLIGHT_RECORDER.md`; `Websites/the-room-web/docs/CODEX-HANDOFF.md`; política de release do Web. HEADs observados: `793c066` / `56ec67b`. | v1.97 nativa e atualização coordenada de contas/Web publicadas. Nova autoridade da campanha/mercado ainda inativa. HEAD de desenvolvimento não é revisão pública. |
| DigiPets | `_isolated/digipets-returning-player-20261010/docs/SESSION-HANDOFF.md`, `FLIGHT_RECORDER.md`, `pubspec.yaml`; página pública acima. | Produto reescrito como coleção, cuidados, minigames, aventuras, casa e jardim. Separar versão nominal pública, envio do build e instalação. |
| Matemática | `Websites/matematica-davidluky/docs/SESSION-HANDOFF.md`. | Lissajous e explorador de 0–1000 L publicados; registro de release `b0c7d09`. Sem repetir a rodada funcional do app. Links de conteúdo: `/explicacoes/curvas-de-lissajous`, `/explicacoes/litros-centimetros-metros-cubicos` e `/explicacoes/mmc-vs-mdc`. |
| Ada | `Websites/ada.davidluky.com/AGENTS.md`, `package.json`; HEAD `d3becd1`; `https://ada.davidluky.com/` respondeu 200 com título Delicacy Studio nesta revisão. | Contato/agenda na Trinks e WhatsApp. Sem prometer agenda local independente nem sincronização Trinks. Nenhum pedido real criado. |
| PosOp | `odonto-posop/README.md`, `docs/RELEASE.md`; HEAD `1522531`; `https://nathalia.davidluky.com/` respondeu 200 com identificação de demonstração. | Nome provisório; demo fictícia e sem envio à clínica. Backend completo e piloto ainda pendentes. Ideia/regras clínicas da colaboradora dentista; implementação de David. Não usar dados clínicos reais na mídia. |
| Mega Man X | `Websites/megaman.davidluky.com/data/project.json` e plano canônico. | Visão X1/X2/X3; checklist X1 e motor próprio separados. Sem congelar porcentagens no hub, nem confundir checklist com conteúdo jogável. Fonte MIT sem assets dos jogos. |
| Tibia Services | `Websites/tibia-services/README.md`. | Catálogo, pedidos e comunicação descritos como capacidades; não afirmar transações, usuários ativos ou operação testada. |
| TCG Arbitrage | `gaming/tcg-arbitrage/README.md`. | Utilidade, histórico e estimativas após taxas/frete substituem contagem antiga de testes/comandos. Nenhuma ação em conta ou rentabilidade real verificada. |
| Game Library | `gaming/game-library/README.md`. | Organização, busca, duplicatas e exportação. Retirada a soma ambígua de plataformas; integrações dependem da conta/provedor, sem novo login ou sync real. |
| Gemini Image Generator | `gemini-image-generator/README.md`. | Pipeline interno, manifestos, dry-run e pós-processamento. Sem alegar quota, preço, credencial ou geração atual validada. |
| MMX Trainer | `mmx-trainer/README.md`. | Caminho atual local com limites de memória, checkpoints e replays. Evidência da frota distribuída é histórica; não anunciar agente que conclui o jogo. |
| Power Monitor | `automation/power-monitor/README.md`. | Fonte recuperada só contém coletor/SQLite. Removida afirmação de API/dashboard presentes e operação contínua observada. |
| Gym Bot | `gym-checkin-bot/README.md` e superfície documentada de filas/exports. | Atualizado além do antigo rótulo Fase 1; fluxo privado genérico. Não ler ou publicar mensagens, métricas pessoais, nomes de participantes ou estado vivo da VM. |
| CCB / música | `ccb-hinos-rock-suno/README.md`. | O fluxo já cobre geração local, preparação Suno, escuta, capas e vídeo. Retirada a descrição de mero planejamento. Nenhuma nova publicação/canal foi verificada; sem números de audiência. |
| Personal Trainer Profile | Registro anterior do catálogo, mantido em linguagem genérica. | Interno, sem destaque. Nenhum conteúdo do perfil pessoal foi aberto para esta revisão. |
| WhatsApp Exporter | `automation/chat-exporters/whatsapp-exporter/README.md`. | HTML/PDF local, filtros e ZIP; conexão ao WhatsApp é uma dependência distinta. Sem sessão ou conversa real nesta revisão. |
| Local IA | `ai-tools/local-ia/README.md`. | Ollama, OpenCode, MCP e diagnósticos; dependências opcionais de nuvem separadas. Sem promessa de custo zero ou disponibilidade de modelo. |
| Alisson / Vida / Frank | Fontes já comparadas no plano: sites pessoais, `vida.davidluky.com/AGENTS.md`, `franks-stories/AGENTS.md`. | Preservados domínio principal, sete origens e as duas histórias existentes. Nenhuma nova biografia, texto ou memória publicada por esta edição dos dados. |
| Matheus | Regra de acesso do hub e conferência anônima documentada no plano. | Acesso restrito explícito; nenhuma mudança da proteção nem tentativa de autenticação. |
| Laptop Bootstrap | `_ops/maintenance/legacy/laptop-bootstrap/README.md`. | Fonte marcada LEGACY REFERENCE; mudou de mantido para arquivado. Não executado. |
| GFWL / Xbox Workbench | `gaming/gfwl-achievement-workbench/README.md`; aviso inicial de `gaming/gfwl-achievement-unlocker/README.md`. | ID antigo preservado, apresentação do workbench atual com limites por título. Unlocker antigo é arquivo privado. Nenhum dado de conta, número de conquista ou ação em conta exportado. |
| Games Downloader | `gaming/games-downloader/README.md`. | Arquivo interno de métodos de transferência/integridade; removidos volumes antigos de acervo. Sem distribuir conteúdo ou validar downloads. |
| Midjourney Relay | `ai-tools/midjourney-relay/README.md`. | Bot oficial organiza pedidos; proprietário gera manualmente e anexa resultado. Selfbot desativado. Sem operação Discord/Midjourney nesta rodada. |
| SNES ROM Ripper | `gaming/snes-rom-ripper/README.md`. | Escopo Mega Man X US v1.1, dados de tiles e entrada fornecida separadamente. Sem distribuição de ROM/assets. |
| Office Render 8-Bit | Card existente e `https://github.com/davidluky/luxury-office-studio-8bit` consultado publicamente (200). | Link de código público confirmado; visibilidade corrigida. Não há serviço hospedado nem render novo validado. |
| Kumiko Frame | `maker/kumiko-frame-p1s/README.md`. | Planejamento e modelos licenciados fatiados; fit/montagem pendentes. Não publicar arquivos licenciados ou insinuar impressão física. |
| Retro Collection Sync | `_ops/maintenance/legacy/sync-scripts/README.md`. | Legacy explícito; mudou de mantido para arquivado. Sem operações de transferência. |
| Xeon Server Ops | `_ops/transfers-ops/README.md`. | Ferramentas internas com alvos explícitos, prévia e registros. Nenhuma topologia, endereço operacional ou mutação de servidor publicada. |
| Modular Chess | `maker/modular-chess/README.md`, posição de 15/10. | Aceite físico limitado a base/corpo/conector relatado pelo usuário; cabeça do cavalo e conjunto completo pendentes. Sem link de download ou promessa de kit pronto. |
| Chess Review MCP | `tintins-chess-analysis/README.md`, `pyproject.toml`, remotes e commits `4730c67` / `38b895d`; fork público consultado. | Original de Dmitri Demler / Chess-analysis-mcp. Contribuições próprias: relatórios de fraquezas, backend Codex e endurecimento de setup/web. Sem atribuir o produto original inteiro a David. |
| Hub | `src/data/projects.ts` e execução corrente do plano. | Apresentação descreve catálogo, estados e páginas desta rodada; publicação do hub exige os gates abaixo. |

O fork público está em `https://github.com/davidluky/tintins-chess-analysis` e identifica
`https://github.com/Chess-analysis-mcp/tintins-chess-analysis` como upstream. A autoria
Dmitri Demler está em `pyproject.toml`. Os dois commits próprios foram inspecionados;
isso sustenta a atribuição da contribuição, sem uma nova execução do aplicativo.

## Fechamento editorial de cada release

Antes de fechar uma release de produto, o responsável registra uma linha nesta fila:

`data | projeto/versão | preparado/enviado/publicado | fonte/recibo | card/CTA/mídia afetados | próxima revisão`

1. Conferir se mudou o que o visitante pode fazer ou acessar.
2. Reconciliar versão da fonte, envio ao provedor e disponibilidade observada.
3. Atualizar o card EN/PT e o marco somente com o que a evidência sustenta; atualizar `lastReviewedAt` pela revisão factual.
4. Revisar CTA, imagem e legenda. Não transportar dados privados para screenshots.
5. Executar os checks do hub; registrar o candidato exato, resultado do provedor e leitura pública no flight recorder canônico quando publicar.

Pendências editoriais concretas desta rodada: confirmação de rollout/build por aparelho do
DigiPets quando necessária; nova campanha do The Room somente após ativação real;
piloto PosOp somente após os gates próprios; conjunto de xadrez somente após aceite físico.
Não criar novidades automaticamente a partir de um commit ou data de build.

## Verificação do candidato

Integração concluída em 15/10: `npm run verify` passou com 36 arquivos Astro
sem diagnósticos, lint sem avisos, 72 testes, 10 páginas e auditoria sem
vulnerabilidades. Revisão no navegador cobriu EN/PT, 1280×900 e 390×844,
filtros combinados, busca vazia, menu, links, imagens, legendas e metadados.
O resultado de publicação pertence ao recibo de execução, separado destes checks.

Os seis destaques usam `summary`/`summaryPt` para textos curtos na página inicial;
`description`/`descriptionPt` mantêm os detalhes no catálogo. A contagem
`publicWebProjects` inclui apenas acesso público à web, excluindo demos,
acesso restrito e links de loja mobile. Nesta revisão são nove sites públicos.

A revisão de dados é documental e de acesso público, não uma auditoria funcional de 34 aplicativos.
Checks focados aprovados em 15/10: ESLint do arquivo, TypeScript strict do módulo,
`git diff --check` e validação de 34 IDs únicos/30 preservados, seis destaques,
três slugs, pares EN/PT, enums, datas, mídia existente e ausência de payload privado.
A integração do hub deve passar `npm run verify`, revisão PT/EN desktop/mobile,
filtros/contadores/CTAs, JSON-LD e guardas Matheus/privacidade antes da publicação.
Os registros canônicos de voo/retrospectiva e o recibo de release são fechados pelo responsável
pela integração, sem reescrever evidências históricas.
