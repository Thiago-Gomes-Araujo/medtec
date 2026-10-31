# Etapa 12B — Componentização da interface da Visão Geral

## 1. Diagnóstico inicial

Confirmados `/home/lennon/medtec-web`, a branch
`` `feature/integracao-rotas-noticias` `` e a árvore inicial limpa.
Foram inspecionados integralmente `admin/page.tsx`, o hook e helper da 12A,
o relatório anterior, o shell, componentes existentes, tipos e subrotas.
Também foram lidos `AGENTS.md`, a skill `medtec-architecture` e o guia local
de Server/Client Components da versão instalada do Next.js.

O diagnóstico foi apresentado antes da edição. A interface possuía três blocos:
boas-vindas com ações Novo, seis cards de indicadores e oito cartões de módulos
com atalhos e destaques. Não havia estado visual exclusivo desses blocos.
Menu, busca, tema, pastas da Sidebar e modal eram compartilhados com a página.

Não foi encontrado componente existente equivalente ao resumo ou aos seus
indicadores. Os riscos principais eram alterar a árvore HTML/classes, perder
os estados de erro/zero/carregamento, trocar totais por contagens locais ou
modificar callbacks/permissões. A estimativa de redução foi 650–700 linhas.

A cópia inicial e os hashes de `src` foram guardados em
`/tmp/medtec-12b-baseline`. Nenhuma alteração local foi descartada e não houve commit.

## 2. Componentes visuais identificados e reutilizados

O resumo era JSX inline, usando `Link` do Next.js e ícones Lucide. Ambos foram
reutilizados. Os componentes de Sidebar, o shell e os módulos administrativos
existentes não são equivalentes aos cards do resumo e ficaram intactos.

Foram criados somente dois componentes coesos:

- `AdminOverview`: composição, boas-vindas, ações rápidas e oito cartões de acesso.
- `OverviewStats`: os seis indicadores superiores, incluindo seus estados de
  carregamento, erro e vazio e links existentes.

Não foram criados componentes por ícone/card simples, gráfico, tabela, atividade
recente, novo hook ou biblioteca de interface.

## 3. Arquivos criados e modificados

| Arquivo | Alteração |
| --- | --- |
| `src/components/admin/AdminOverview.tsx` — novo | Interface de boas-vindas, ações e cartões de módulos; compõe os indicadores. |
| `src/components/admin/OverviewStats.tsx` — novo | Interface dos seis KPIs com props tipadas e comportamento anterior. |
| `src/app/admin/page.tsx` | Substitui o bloco visual pela montagem de `AdminOverview` e retira quatro imports exclusivos transferidos. |
| `tests/api-client.test.ts` | Cinco testes novos de apresentação e interação por callbacks. |
| `docs/ETAPA_12B_RELATORIO.md` — novo | Diagnóstico, decisões, resultados e checklist. |

A comparação de hashes dos arquivos existentes em `src` identificou somente
`admin/page.tsx` modificado. Hook, helper de dados, shell, onze subrotas,
outros módulos, serviços, handlers, autenticação e arquivos de dados ficaram
inalterados. Arquivos novos não rastreados não entram no `diff --stat` convencional.

## 4. Responsabilidades extraídas

Saíram da página o cabeçalho de boas-vindas, botões/links Novo e Portal Público,
o grid de KPIs, os cartões de módulos, seus destaques e os controles visuais
de carregamento/erro. A composição não adiciona wrappers HTML.

Permaneceram na página a chamada ao hook, autenticação, permissões, encaminhamento
por perfil, navegação, Sidebar, breadcrumbs, tema, carregamento global e os
blocos legados. A montagem conserva a condição original:
`currentSection === 'visaoGeral' && userSession.isGestor`.

Foram retirados do pai somente os imports de `Plus`, `Loader2`, `ArrowRight`
e `AlertCircle`, que passaram a ser usados pelos componentes extraídos.
Nenhum estado visual foi transferido, pois não havia estado exclusivo do resumo.

## 5. Props e tipos utilizados

`OverviewStatsIndicators` utiliza `Pick<ReturnType<typeof useAdminOverview>, ...>`
para herdar os tipos dos totais, subtotais, flags, erros e rótulo de usuários.
O import do hook nesse arquivo é somente de tipo: não executa o hook ou consultas.

`AdminOverviewProps` recebe:

- `indicators`: somente os indicadores utilizados pelos cards, incluindo Banners;
- `userName`: nome já escolhido pela expressão anterior de nome/usuário;
- `latestNews`: título, data e autoria, tipados com `Pick<NNoticia, ...>`;
- `featuredProject`: título, escola e município, com `Pick<ProjectMission, ...>`;
- `announcementTitle`: título selecionado pela regra anterior de urgente;
- `canAccessKanban`: decisão existente de permissão, calculada no pai;
- `onOpenNews`, `onCreateNews`, `onOpenKanban`: callbacks sem retorno de dados.

A página projeta explicitamente os campos dos destaques. Não passa sessão,
JWT, banco completo, coleções de usuários/projetos ou setters de dados ao
componente visual. Não foi introduzido `any`.

## 6. Dependências preservadas

`Link`, ícones, classes Tailwind, condições e textos existentes foram mantidos.
Os componentes de apresentação não têm `fetch`, chamadas de serviços, estado,
efeitos, uso de roteador ou persistência local.

Os callbacks do roteador permanecem na página. Uma comparação de suas
inicializações no AST confirmou inalterados `handleSelectSection`, `loadData`,
`handleLogout`, `handleSaveSocials`, `renderCmsModule`, `toggleTheme` e
`canAccessKanban`. Os efeitos de compatibilidade e autenticação não foram editados.

Os cinco blocos administrativos antigos, seus estados e referências foram
preservados. A limpeza desses caminhos pertence à 12C.

## 7. Relação com `useAdminOverview`

O hook continua sendo chamado uma única vez pela página e mantém a responsabilidade
pelas leituras, estados, erros e métricas. Nem ele nem `admin-overview.ts` foram
modificados. Não há outra fonte de verdade ou leitura em componentes visuais.

Os componentes apenas exibem as props. A seleção anterior do primeiro registro
de notícia/projeto e do título urgente é feita uma única vez na montagem por
props, com as mesmas expressões de seleção. As fórmulas e contagens não foram
movidas ou duplicadas na interface.

## 8. KPIs e fontes preservados

Conservam-se os totais oficiais de `pagination.total_count` para Notícias,
Avisos, Galeria, categorias e Usuários. Nenhuma lista visual é usada para
substituí-los. Subtotais por status, ativos e urgentes continuam preparados
pelo hook/helper da 12A, sem alteração de regras.

Projetos, municípios distintos, FAQ e Banners mantêm a leitura legada documentada.
Estados continua no badge da Sidebar, sem criar KPI ou atalho novo no corpo do
resumo. O inventário completo de fontes e limitações continua no relatório da 12A.

Os estados globais de autenticação/leitura legada permanecem no pai. Os estados
de Notícias/Avisos/Galeria e o rótulo de Usuários são exibidos como antes.
Também foram mantidos os textos vazios, valores padrão de apresentação e as
limitações semânticas preexistentes dos destaques e rótulos de ativos.

## 9. Navegação, permissões e atalhos

Foram preservados:

- Notícias Lista e Nova Notícia, pelos mesmos destinos de `router.push`;
- Projetos Lista e Novo (`/admin/projetos?action=new`);
- Avisos, Banners, Galeria e FAQ;
- Kanban, com botão desabilitado quando `canAccessKanban` é falso;
- Institucional, Redes e Usuários, no cartão de dados/contatos;
- Estados/Municípios pela Sidebar existente;
- Portal Público em nova aba, com os atributos anteriores.

A guarda gestora permanece no pai. O componente não calcula um novo papel
ou amplia privilégios; o booleano editorial só controla a ação existente.
A autorização definitiva de operações Rails continua no backend.

Sidebar, breadcrumbs, seção ativa, links legados, Voltar/Avançar e as onze
subrotas permanecem com suas implementações anteriores. `AdminShell`, proxy,
`auth.ts`, cookies, JWT e login/logout não foram modificados. Nenhuma rota foi criada.

## 10. Testes e verificações

| Verificação | Resultado |
| --- | --- |
| `npx tsc --noEmit` inicial e após implementação | Passou. |
| `npm test` | 90 testes em 21 suítes passaram. |
| `npm run lint -- --format json` inicial/final | Mesmos 12 erros e 42 avisos, sem novos diagnósticos. |
| `git diff --check` | Passou. |
| `npm run build` | Turbopack falhou por `binding to a port` / `Operation not permitted`. |
| `npm run build -- --webpack` | Passou, com verificação de tipos e as onze subrotas anteriores. |
| `wc -l`, `git diff --stat`, `git status --short` | Executados. |

Os cinco testes novos cobrem renderização dos totais/destaques sem consultas,
zero e textos vazios, carregamento e erro distintos de vazio, links Lista/Novo,
botão editorial desabilitado e encaminhamento das ações pelos callbacks.
As classes responsivas são conferidas na renderização; isso não substitui
verificação de layout em um navegador.

Os testes da 12A continuam passando, incluindo 50 usuários recebidos com total
oficial 120, permissões de leitura e ausência de consultas duplicadas.
Os demais testes preservam cobertura dos módulos e subrotas existentes.

Além da suíte, foi reconstruída temporariamente a renderização do JSX anterior,
a partir da cópia inicial, e comparada à dos dois novos componentes. O HTML
foi **idêntico** em quatro cenários: dados preenchidos, vazio, carregamento e
erro (incluindo a ação editorial desabilitada). Isso confere árvore, textos,
classes, ícones e atributos. Os artefatos estão em `/tmp/medtec-12b-baseline`,
sem snapshot ou componente antigo duplicado no código do projeto.

A primeira tentativa de autorização automática para executar testes expirou
antes da avaliação. A única repetição permitida foi aprovada e a suíte passou.
Testes e Webpack usaram execução ampliada do sandbox, sem alteração de configuração
ou dependências. Não houve upload, mutação real ou teste autenticado interativo.

O Webpack manteve os avisos anteriores sobre lockfile externo e falhas de conexão
das páginas públicas de avisos, acervo, galeria e redes. Foram compiladas
`/admin/noticias`, `/admin/kanban`, `/admin/usuarios`, `/admin/faq`,
`/admin/projetos`, `/admin/banners`, `/admin/avisos`, `/admin/galeria`,
`/admin/redes`, `/admin/institucional` e `/admin/estados-cidades`.

## 11. Linhas antes e depois

`src/app/admin/page.tsx`: **2.108 → 1.432 linhas**, redução de **676 linhas**.
`AdminOverview.tsx` possui 480 linhas e `OverviewStats.tsx`, 270.

A redução corresponde à saída real do JSX e seus imports exclusivos, com
props explícitas na montagem. Não houve compactação, remoção de caminhos
legados ou antecipação da limpeza geral.

## 12. Riscos e pendências

- A comparação de HTML não verifica pixels, hidratação, hitboxes, foco ou
  histórico do navegador; esses itens aguardam validação manual.
- Não há infraestrutura de teste de navegador adicionada nesta etapa.
  Os testes de interação invocam os handlers dos elementos React, sem cliques
  nativos ou contas autenticadas.
- Dependências legadas, consulta indireta de usuários, necessidade de
  `page=all` para subtotais e gravações bloqueadas continuam como na 12A.
- O lint preexistente permanece. Nenhuma biblioteca ou supressão foi adicionada.
- A página ainda contém Sidebar, autenticação e blocos antigos; não se afirma
  concluir sua transformação em composição mínima antes da 12C.

## 13. Checklist manual — sem mutações reais

- [ ] Abrir `/admin` com perfil autorizado e conferir a Visão Geral.
- [ ] Comparar boas-vindas, cards, textos, cores, ícones, espaçamentos e animações.
- [ ] Conferir totais Rails, subtotais e números legados com a versão validada da 12A.
- [ ] Conferir zero confirmado e destaques vazios em cenário controlado.
- [ ] Conferir estados de carregamento sem substituir valores por zero.
- [ ] Conferir falhas controladas de Notícias, Avisos, Galeria e Usuários.
- [ ] Conferir erro da leitura legada na tela global existente.
- [ ] Abrir Notícias Lista e Nova Notícia, sem salvar.
- [ ] Abrir Usuários, Avisos e Galeria, sem gravações ou seleção de arquivos.
- [ ] Abrir Projetos Lista/Novo e Banners; não realizar upload ou mutação.
- [ ] Abrir FAQ, Kanban, Institucional, Redes e Estados/Municípios.
- [ ] Conferir Kanban desabilitado quando a permissão editorial não existe.
- [ ] Conferir Sidebar, busca, breadcrumbs, destaque ativo, menu móvel e tema.
- [ ] Conferir celular, tablet e desktop nas mesmas grades responsivas.
- [ ] Atualizar com F5 e conferir autorização, carregamento e dados.
- [ ] Testar Voltar/Avançar, Lista/Novo e links legados.
- [ ] Conferir Portal Público em nova aba.
- [ ] Abrir as onze subrotas anteriores e conferir acessos sem mutações reais.

## 14. Recomendações para a Etapa 12C

Após validar a 12B, auditar os caminhos legados que ainda permanecem na página,
seus consumidores, estados, efeitos e callbacks antes de remover qualquer código.
Avaliar a composição com o shell existente e a navegação duplicada, preservando
o contrato do hook, autorização e equivalência visual demonstrados aqui.

Não misturar a limpeza com mudanças de design, contratos Rails, fontes de
indicadores ou persistência. Somente a Etapa 12B foi implementada; a 12C
aguarda validação do usuário.
