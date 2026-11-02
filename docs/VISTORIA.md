# Vistoria do projeto MEDTEC Web

**Data:** 01/11/2026. **Branch:** `feature/cms-projetos`, commit `8903ac9`, 20 commits à frente da `origin/dev` e sem push.

**Conclusão:** o site público está estável, sem erros de console, imagens quebradas ou rolagem horizontal, e nenhum CPF chega ao site. Para a apresentação de 05/11, os riscos são conteúdo de teste na API, duas telas do painel que não chegam ao site (galeria e redes), o mapa zerado, o link do YouTube quebrado e o painel nunca testado com login real.

## Como a vistoria foi feita

| Item | Como |
|---|---|
| API | API configurada no `.env`, só `GET` e sem token; rotas conferidas em `origin/release` do Rails |
| Site | `next build` + `next start`; 20 rotas em 4 modos (1360 px e 390 px, claro e escuro), 80 cargas no total |
| Acessibilidade | axe-core 4.10 (WCAG 2 A e AA) em todas as cargas |
| Validação | 1079/1079 testes, `tsc` sem erros, ESLint com 0 erros e 22 avisos, build OK |

**Não testado nesta vistoria:**

- **Painel depois do login:** não há token nem credencial autorizada para esta vistoria. Só as rotas `/admin/login` e os redirecionamentos foram visitados.
- **Escrita na API real:** nenhum `POST`, `PATCH` ou `DELETE` foi enviado.
- **Imagem Docker:** o Docker não está instalado nesta máquina.
- **Leitor de tela real:** só a checagem automática do axe e o foco por teclado na home.

## 1. Integração com a API

**Status:** `integrado` usa a API; `mock` usa dados fixos ou locais; `sem backend` não tem rota na API. Nenhum endpoint consumido pelo front deu 404 no servidor.

**Testado:** `auto` é teste automatizado com `fetch` simulado; `nav` é navegador contra mock do contrato; `real` é navegador contra a API real, só leitura. Nenhuma escrita foi testada na API real.

### Painel

| Tela | Serviço | Endpoint | Status | Testado |
|---|---|---|---|---|
| `/admin/login` | `/api/auth` | `/auth/login`, `/auth/me` | integrado | sim: auto, nav |
| `/admin` (Início) | `admin-overview`, `useDuvidasPendentes`, `useProjetosResumo`, `useBannersTotal` | 14 leituras de totais | integrado | sim: auto, nav |
| `/admin/noticias` | `noticias` | `/n_noticias`, `/n_categorias_noticia`, publicar e despublicar | integrado | sim: auto |
| `/admin/kanban` | `noticias`, `conquistas`, `relatos`, `projetos`, `duvidasVisitante` | filas `aguardando` e `q[respondida_false]` | integrado | sim: auto; nav em projetos e dúvidas |
| `/admin/avisos` | `avisos`, `tiposAviso` | `/a_avisos`, `/a_tipos_aviso` | integrado | sim: auto |
| `/admin/banners` | `banners` | `/b_banners` | integrado | sim: auto, nav |
| `/admin/galeria` | `fotosGaleria`, `categoriasGaleria` | `/fotos_galeria`, `/categorias_galeria` | integrado | sim: auto |
| `/admin/faq` | `duvidas`, `categoriasDuvida`, `duvidasVisitante` | `/d_duvidas`, `/d_categorias_duvida`, `/d_duvidas_visitante` | integrado | sim: auto, nav |
| `/admin/professores` e subrotas | `professores`, `disciplinasProfessor`, `relatos`, `escolas` | `/p_professores`, `/p_disciplinas`, `/p_relatos`, `/escolas` | integrado | sim: auto |
| `/admin/alunos` e subrota | `conquistas`, `categoriasConquista`, `escolas` | `/c_conquistas_aluno`, `/c_categorias_conquista_aluno` | integrado | sim: auto |
| `/admin/projetos` e subrotas | `projetos`, `temasProjeto`, `membrosProjeto`, `escolas` | `/pj_projetos`, `/pj_temas`, `/pj_membros` | integrado | sim: auto, nav |
| `/admin/redes` | `canaisContato` | `/canais_contato` | integrado | sim: auto |
| `/admin/usuarios` | `usuarios`, `perfis` | `/usuarios`, `/perfis`, permissões | integrado | sim: auto |
| `/admin/estados-cidades` | `estados`, `cidades` | `/g_estados`, `/g_cidades` | integrado | sim: auto |
| `/admin/institucional` | `fetch` local | `/api/data` → `db.json`; salvar desabilitado | mock + sem backend | não para `SiteInfoModule` |
| Quatro Pilares (`HomePillarsModule`) | nenhum; rascunho em memória | nenhum; publicar desabilitado | sem backend | sim: auto |

### Site

| Tela | Serviço | Endpoint | Status | Testado |
|---|---|---|---|---|
| `/` carrossel | `bannersPublicos`, no servidor | `/publico/b_banners` | integrado | sim: auto, nav, real |
| `/` projetos | `projetosPublicos` | `/publico/pj_projetos` | integrado | sim: auto, real |
| `/` mural | `professoresPublicos`, `conquistasPublicas` | `/publico/p_professores`, `/publico/c_conquistas_aluno` | integrado | sim: auto, real |
| `/` números do topo | nenhum | constantes em `HomePageClient.tsx:163` | mock | não |
| `/` Quatro Pilares | nenhum | constantes em `TechAdvantages` | sem backend | sim: auto |
| `/noticias`, `/noticias/[id]` | `noticias` | `/publico/n_noticias`, `/publico/n_categorias_noticia` | integrado | sim: auto, real |
| `/avisos` | `avisos` | `/publico/a_avisos` | integrado | sim: auto, real |
| `/ao-vivo` | `avisos` + constantes | `/publico/a_avisos`; redes fixas | integrado em parte | sim: auto, real |
| `/projetos`, `/projetos/[id]` | `projetosPublicos` | `/publico/pj_projetos`, `/publico/pj_temas` | integrado | sim: auto, real |
| `/professores`, `/professores/[id]` | `professoresPublicos` | `/publico/p_professores`, `/publico/p_disciplinas`; `POST` de relato | integrado | sim: auto, real; `POST` não |
| `/alunos` | `conquistasPublicas` | `/publico/c_conquistas_aluno`, categorias | integrado | sim: auto, real |
| `/duvidas`, `/faq` | `duvidasPublicas` | `/publico/d_duvidas`, categorias; `POST` de visitante | integrado | sim: auto, real; `POST` só nav |
| `/galeria`, `/acervo` | nenhum | fixo em `gallery={[]} unavailable`; `/publico/fotos_galeria` existe e não é usada | mock | sim: auto, real |
| `/redes` e rodapé | nenhum | constantes; `/publico/canais_contato` existe e não é usada | mock | sim: auto, real |
| `/mapa`, `/comunidades` | `fetch` local | `/api/schools` vazio; `/publico/escolas` dá 404 e `/escolas` exige login | sem backend | só real |
| `/transparencia` | `fetch` local | `/api/transparency` vazio; `/publico/transparencia` dá 404 | sem backend | só real |

## 2. Pendências conhecidas

| Pendência | Status | Evidência |
|---|---|---|
| Layout persistente das subrotas | pendente em parte | Feito em `src/app/admin/projetos/layout.tsx:19`; professores e alunos remontam o shell em `src/app/admin/professores/page.tsx:10` e `src/app/admin/alunos/page.tsx:10` |
| Erros visíveis com formulário fechado | pendente em parte | Erros aparecem fora do formulário (`BannersPanel.tsx:82`), mas Cancelar não limpa o erro anterior (`BannersPanel.tsx:98`, `ConquistasPanel.tsx:234`, `CommunityTaxonomyManager.tsx:117`) |
| `/api/data` sem catch vazio | feito | `src/app/api/data/route.ts:96` registra o erro |
| Paginação de usuários | pendente | `src/components/admin/useAdminUsers.ts:25` pede só `per_page: 50` e não há paginação na tela |
| `priority` no login | pendente | `src/app/admin/login/page.tsx:103` e `:153` usam `priority`, descontinuado no Next 16 em favor de `preload` |
| `alert()` restantes | pendente | 36 `alert` e 9 `confirm`, a partir de `GalleryModule.tsx:134`, `AnnouncementsModule.tsx:125`, `NewsModule.tsx:65`, `EstadosCidadesModule.tsx:113`, `UserManager.tsx:168` e `admin/noticias/page.tsx:114` |
| Perfis inexistentes no seed | pendente | `src/components/admin/AdminShell.tsx:216-238`, `src/app/admin/page.tsx:291-309` e `src/lib/admin-auth-navigation.ts:14-17` citam quatro perfis fora do seed |
| Login por `ADMIN_USER` | pendente | `src/app/api/auth/route.ts:96` e `src/lib/auth.ts:119`; abre o painel sem token e a API responde 401 |
| `/api/upload` sem uso | pendente | `src/app/api/upload/route.ts:47` existe; nenhum arquivo fora de `src/app/api` chama a rota |
| Restos de `db.json` e `initialData.json` | pendente | `src/lib/db.ts:9`, `src/app/api/data/route.ts:69`; o site não lê esses dados, só `/admin/institucional` |
| Página inexistente com status 200 | pendente em parte | `/rota-inexistente` responde 404; `/projetos/999999`, `/projetos/abc`, `/professores/999999` e `/noticias/nao-existe` respondem 200 com tela de 404 e `noindex` |
| Fila de Aprovação só para `Administrador` | pendente (decisão) | `src/components/admin/AdminShell.tsx:241` e `src/app/admin/page.tsx:171`; o contrato também dá publicação ao `Gestor` |
| Filtros com `page=all` no site | pendente | `src/components/AlunosView.tsx:50` e `src/components/ProjetosView.tsx:52`; o filtro de município é local porque a API não expõe o id da cidade |

**Perfis citados no front e ausentes do seed:** `Operador de Conteúdo`, `Editor de Notícias`, `Curador de Fotos` e `Publicador de Avisos`. Sem token, não foi possível ver se existem cadastrados direto no banco.

## 3. Código morto

Busca feita por importações em `src`. "Só testes" significa que apenas `tests/api-client.test.ts` ainda usa o item.

| Item | Tipo | Confiança | Observação |
|---|---|---|---|
| `src/components/mapa/*` (10 arquivos) | componentes | alta | `mapa-shell` não tem importador; o site usa `SchoolMap` |
| `leaflet`, `react-leaflet`, `react-leaflet-cluster`, `@types/leaflet` | dependências | alta | só a pasta acima usa |
| `/api/geocode`, `/api/route` | rotas | alta | só a pasta acima chama |
| `Badge3D`, `ImageModal`, `NewsGrid`, `NewsPublicationPreview`, `NewsSection`, `Reveal` | componentes | alta | sem importador |
| `src/lib/security.ts` | lib | média | só `NewsSection` importa |
| `Announcements`, `FaqSection` | componentes | média | só testes |
| `src/lib/admin-faq.ts` | lib | média | só testes |
| `hashPassword`, `verifyPassword` em `auth.ts` | funções | alta | sem uso |
| `/api/upload`, `/api/editorial`, `/api/news/view`, `/api/admin/users` | rotas | alta | nenhuma chamada no front |
| `/api/faqs` | rota | alta | citada só em comentário |
| `PUT /api/data` | método | alta | o front só usa `GET` |
| `StatItem`, `Noticia`, `ItemEditorial`, `FaqPersona`, `NoticiaApi` | tipos | alta | sem uso |
| `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | assets | alta | padrão do Next |
| `public/assets/hero-BQyC57JO.jpg` | asset | alta | sem referência |
| `public/uploads/*` (4 cópias da mesma imagem, 1 MB) | assets | média | versionados e públicos; sem referência no código |
| `public/logo-medtec-dark.png` (578 KB), `public/icon.svg` | assets | média | sem referência textual; conferir uso externo |
| `ROTAS_FRONT.md`, `docs/ROTAS_FRONT_FULL.md`, `docs/rotas_front.md` | docs | média | versões do mesmo guia |

## 4. Site em produção

| Verificação | Resultado |
|---|---|
| Erros de console | nenhum, exceto o 404 esperado de `/rota-inexistente` |
| Requisições falhas | nenhuma |
| Imagens quebradas ou sem `alt` | nenhuma |
| Rolagem horizontal | nenhuma nas 80 cargas |
| `h1` e `lang` | um `h1` por página; `pt-BR` |
| Foco por teclado | visível nos 14 primeiros elementos da home |
| Links internos | todos respondem; 33 links distintos verificados |
| Links externos | **`https://www.youtube.com/@SeducRondonia` responde 404**; usado em 8 pontos do código e também gravado na API |
| Contraste (axe) | 166 ocorrências em 58 das 80 cargas |

### Conteúdo inadequado vindo da API

| Onde aparece | Conteúdo |
|---|---|
| `/noticias`, `/noticias/flamengo` | Notícia "Flamengo", texto "Flamengo mengo mengo..." e capa de site externo |
| `/avisos`, `/ao-vivo` | Aviso "Flamengo Lider do Brasileirão": "Flamengo é o maior time do mundo" |
| `/duvidas`, `/faq` | "Qual é o horario de almoco do sesc ?", resposta "11 a 11 e meia"; "Resposta corrigida." |
| `/`, `/professores`, `/professores/1` | Disciplina "Geografia 1793500268" |
| `/`, `/alunos` | Categoria "Hackathon 1793508674" |
| `/`, `/projetos`, `/alunos` | Imagens aleatórias do `picsum.photos` no banner, no projeto e na conquista |
| `/publico/canais_contato` | WhatsApp `wa.me/5569911112222`, com jeito de número fictício; hoje o site não lê esse dado |

### Telas que passam impressão errada

- **`/mapa` e `/comunidades`:** mostram "0 escolas", "100% ativas", "Conexão Satelital Operacional" e "Todos (52)" sem nenhuma escola.
- **`/galeria` e `/acervo`:** dizem que a consulta pública ainda não existe, mas a rota já existe e o painel cadastra fotos.
- **Rodapé:** usa `mediacaotecnologica@seduc.ro.gov.br`, e a API tem `medtec@seduc.ro.gov.br`.
- **Topo da home:** os números 6.000+, 129, 330 e 52 são fixos; `db.json` tem outros valores, sem uso no site.

### Contraste

| Modo | Ocorrências | Principal |
|---|---|---|
| Claro, desktop | 34 | Cards da home, 3,69:1 |
| Claro, celular | 31 | Mesmos elementos |
| Escuro, desktop | 50 | Rodapé em todas as páginas, 3,82:1 |
| Escuro, celular | 51 | Rodapé em todas as páginas, 3,82:1 |

Os piores casos são textos pequenos em `/admin/login` e em `/professores/1`, com 2,63:1. `/mapa` e `/comunidades` somam 11 ou 12 ocorrências em cada tema. O mínimo para texto normal é 4,5:1.

## 5. Segurança

### Segredos e credenciais

| Item | Situação |
|---|---|
| `.env` | fora do Git e sem histórico; nenhum valor de senha ou segredo do `.env` aparece em arquivos versionados |
| Chaves privadas, tokens GitLab/GitHub, chaves AWS, JWT | nenhum encontrado |
| `ROTAS_FRONT.md`, `docs/ROTAS_FRONT_FULL.md`, `docs/rotas_front.md` | 6 campos cada com senha literal em exemplos. A vistoria anterior encontrou nesses arquivos valores padrão antigos; também seguem no histórico do Git |
| `tests/api-client.test.ts` | 70 campos com valores literais; a vistoria anterior encontrou lá um valor padrão antigo |
| `src/lib/auth.ts:55` e `:82-83` | usuário, senha e segredo de reserva fora de produção; em produção a falta das variáveis gera erro |
| `docs/ROTAS_BANNERS.md:79`, `:120` | IP interno em exemplos |

### Rotas `/api` sem cookie

| Rota | Resposta | Avaliação |
|---|---|---|
| `GET` e `PUT /api/data` | 401 | protegida |
| `GET /api/admin/users` | 401 | protegida; usa a conta de serviço `BACKEND_ADMIN_*` e não tem uso no front |
| `POST /api/admin/users` | 403 | protegida |
| `POST /api/upload` | 401 | protegida; sem uso |
| `POST /api/editorial` | 403 | protegida; sem uso |
| `GET /api/editorial`, `/api/faqs`, `/api/schools`, `/api/transparency` | 200 | públicas, com listas vazias |
| `POST /api/news/view` | 400 | não grava nada; sem uso |
| **`GET /api/geocode`** | **200** | **aberta, sem limite: repassa consultas ao Nominatim** |
| **`GET /api/route`** | **200** | **aberta, sem limite: repassa consultas ao OSRM** |
| `POST /api/auth` | sem limite de tentativas no front | permite força bruta contra `ADMIN_USER`; o limite no Rails não foi verificado |
| `/.env` | 403 | bloqueado pelo `src/proxy.ts` |

**Outros pontos:**

- **`PUT /api/data`:** sem uso no front; aceita chaves livres e grava em disco para qualquer sessão válida.
- **Cabeçalhos:** HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy` e `Permissions-Policy` estão ativos. O CSP só tem `frame-ancestors`.
- **Token de acesso:** fica em `localStorage`, então um XSS poderia lê-lo. Não há `dangerouslySetInnerHTML` com dados da API; o único uso é o script de tema.

### Dados pessoais no site

| Dado | Resultado |
|---|---|
| CPF | não chega ao site: ausente das respostas públicas e do HTML; o front também descarta o campo |
| E-mail e telefone de relatos | ausentes das respostas públicas (`nome`, `texto`, `created_at`) |
| E-mail e telefone institucionais | só em `canais_contato`, como esperado |
| Nomes de estudantes e membros | aparecem por desenho (`nome_aluno`, relatos, membros). A API não registra consentimento; o painel só avisa |

**API real:** os 404 respondem com 7,9 KB, incluindo a exceção e a estrutura de `traces`. Isso indica ambiente sem configuração de produção.

## 6. Performance

Primeira carga com a API real. O peso é o transferido, com compressão.

| Rota | JS | Total | Prefetch | API | CLS | LCP |
|---|---|---|---|---|---|---|
| `/` | 395 KB | 655 KB | 14 | 3 | 0,000 | 2444 ms |
| `/noticias` | 388 KB | 585 KB | 17 | 2 | 0,018 | 648 ms |
| `/noticias/flamengo` | 388 KB | 619 KB | 16 | 0 | 0,000 | 452 ms |
| `/projetos` | 388 KB | 546 KB | 19 | 2 | 0,006 | 2144 ms |
| `/projetos/1` | 394 KB | 562 KB | 16 | 0 | 0,000 | 724 ms |
| `/professores` | 410 KB | 545 KB | 18 | 2 | 0,000 | 80 ms |
| `/professores/1` | 419 KB | 558 KB | 18 | 0 | 0,000 | 184 ms |
| `/alunos` | 405 KB | 592 KB | 20 | 2 | 0,021 | 1124 ms |
| `/avisos` | 404 KB | 550 KB | 22 | 0 | 0,036 | 116 ms |
| `/galeria` | 388 KB | 515 KB | 15 | 0 | 0,000 | 68 ms |
| `/mapa` | 388 KB | 520 KB | 15 | 1 | 0,000 | 92 ms |
| `/duvidas` | 388 KB | 518 KB | 15 | 2 | 0,011 | 72 ms |
| `/faq` | 388 KB | 521 KB | 16 | 2 | 0,016 | 80 ms |
| `/redes` | 388 KB | 520 KB | 16 | 0 | 0,000 | 76 ms |
| `/ao-vivo` | 404 KB | 545 KB | 16 | 0 | 0,000 | 100 ms |
| `/transparencia` | 402 KB | 564 KB | 16 | 1 | 0,014 | 76 ms |
| `/admin/login` | 267 KB | 408 KB | 2 | 0 | 0,000 | 84 ms |

### Home, mediana de 3 cargas

| Cenário | CLS | LCP | TBT | JS | Total |
|---|---|---|---|---|---|
| Desktop, rede livre | 0,000 | 2092 ms | 0 ms | 395 KB | 699 KB |
| Desktop, 4G | 0,001 | 2668 ms | 79 ms | 395 KB | 742 KB |
| Celular 390 px, rede livre | 0,000 | 108 ms | 0 ms | 268 KB | 482 KB |
| Celular 390 px, 4G e CPU 4x | 0,000 | 952 ms | 107 ms | 268 KB | 607 KB |

- **LCP no desktop:** é a imagem do banner, hoje vinda do `picsum.photos`. O número precisa ser medido de novo com a arte real.
- **Chamadas em cascata:** não há no site. As chamadas de cada página saem em paralelo, com no máximo 3 na home.
- **Painel:** o Início dispara 14 leituras, duas delas com `page=all`. O JS das telas logadas não foi medido nesta vistoria.
- **Prefetch:** cada página faz de 14 a 22 pedidos de navegação antecipada ao carregar.
- **Salto residual:** sem nenhum projeto publicado, `HomeProjectsAccordionSection` gerou CLS de 0,39 no desktop e 0,61 no celular em medição anterior. Hoje a API real tem um projeto publicado.

## Pendências por prioridade

### P1: bloqueia ou expõe algo na apresentação de 05/11

| # | Descrição | Onde | Lado | Esforço |
|---|---|---|---|---|
| 1 | Apagar o conteúdo de teste: Flamengo, "almoço do sesc", disciplinas e categorias com números | Dados da API; painel | Backend/conteúdo | baixo |
| 2 | Trocar as imagens do `picsum.photos` por artes reais | Banner, projeto e conquista | Conteúdo | baixo |
| 3 | Fotos cadastradas no painel não aparecem no site; integrar a rota pública e cadastrar fotos | `src/app/galeria/page.tsx:31`, `src/app/acervo/page.tsx:31` | Front | médio |
| 4 | Canais editados no painel não aparecem no site | `src/app/redes/page.tsx:21`, `SocialSection.tsx:24`, `SiteFooter.tsx:9`, `ao-vivo/page.tsx:23` | Front | médio |
| 5 | Corrigir o link do YouTube, que dá 404 | 8 pontos em `src` e `canais_contato` na API | Front/conteúdo | baixo |
| 6 | Mapa mostra zeros e "100% ativas"; trocar por "em breve" até haver dados | `src/components/SchoolMap.tsx:206` | Front | baixo |
| 7 | Fazer o roteiro completo do painel com login por CPF real, como `Administrador` e `Gestor` | Todas as telas de `/admin` | Front/QA | médio |
| 8 | Integrar à `dev` os 20 commits locais de projetos e banners | `feature/cms-projetos`, sem remoto | Front | baixo |
| 9 | Construir a imagem Docker e conferir as variáveis do servidor; o `.env` local tem `NEXT_PUBLIC_API_URL` duplicada e nenhuma `BACKEND_ADMIN_*` | `Dockerfile`, `docker-compose.yml`, `.env` | Front/infra | médio |
| 10 | Na demonstração, entrar com CPF, nunca com `ADMIN_USER`, e confirmar a rede ou VPN | `src/app/api/auth/route.ts:96` | Operação | baixo |

### P2: corrigir na semana

| # | Descrição | Onde | Lado | Esforço |
|---|---|---|---|---|
| 11 | Remover `/api/geocode` e `/api/route`, abertas e sem uso | `src/app/api/geocode/route.ts`, `src/app/api/route/route.ts` | Front | baixo |
| 12 | Remover `/api/upload`, `/api/editorial`, `/api/news/view`, `/api/faqs`, `/api/admin/users` e `PUT /api/data` | `src/app/api` | Front | baixo |
| 13 | Limitar tentativas de login | `src/app/api/auth/route.ts:13` | Front/backend | médio |
| 14 | Remover o login por `ADMIN_USER`, depois de todos terem CPF | `src/lib/auth.ts:119`, `src/app/api/auth/route.ts:96` | Front | médio |
| 15 | Trocar as credenciais antigas e limpar os exemplos | `ROTAS_FRONT.md`, `docs/ROTAS_FRONT_FULL.md`, `docs/rotas_front.md`, testes | Front/backend | baixo |
| 16 | Corrigir o contraste, começando pelo rodapé escuro | `SiteFooter`, cards da home, `/mapa`, `/admin/login` | Front | médio |
| 17 | Trocar `alert` e `confirm` por mensagens na tela | 6 módulos, 45 chamadas | Front | médio |
| 18 | Adicionar paginação à lista de usuários; acima de 50, os demais não aparecem | `useAdminUsers.ts:25`, `UserManager.tsx` | Front | baixo |
| 19 | Levar o layout persistente para professores e alunos | `src/app/admin/professores`, `src/app/admin/alunos` | Front | baixo |
| 20 | Limpar o erro anterior ao cancelar um formulário | `BannersPanel.tsx:98`, `ConquistasPanel.tsx:234`, `ProfessoresPanel.tsx:179`, `CommunityTaxonomyManager.tsx:117`, `MembrosProjetoPanel.tsx:100` | Front | baixo |
| 21 | Trocar `priority` por `preload` no login | `src/app/admin/login/page.tsx:103`, `:153` | Front | baixo |
| 22 | Evitar o salto da seção de projetos sem nenhum publicado | `HomeProjectsAccordionSection.tsx` | Front | baixo |
| 23 | Decidir o que fazer com Institucional e Quatro Pilares, que têm salvar desabilitado; se não houver rota, esconder do menu | `SiteInfoModule.tsx:134`, `HomePillarsModule.tsx:419`, `:430` | Front | baixo |
| 24 | Unificar o e-mail de contato do rodapé com o da API | `SiteFooter.tsx:9` | Front/conteúdo | baixo |
| 25 | Decidir se o `Gestor` acessa a Fila de Aprovação | `AdminShell.tsx:241`, `admin/page.tsx:171` | Front | baixo |

### P3: depende do backend

| # | Descrição | Onde | Lado | Esforço |
|---|---|---|---|---|
| 26 | Tirar a API do modo que expõe exceção e `traces` nos 404; idealmente antes de 05/11 | Servidor Rails | Backend | baixo |
| 27 | Confirmar os quatro perfis fora do seed e, depois, limpá-los do front | `AdminShell.tsx:216-238`, `admin/page.tsx:291-309`, `admin-auth-navigation.ts:14-17` | Backend, depois front | baixo |
| 28 | Alinhar o `Gestor`: o seed dá regras de professores e conquistas, mas o painel bloqueia | `AdminShell.tsx:231-238` | Backend e front | baixo |
| 29 | Definir se `Gestor` e `Administrador` devem publicar sem aprovação em dúvidas e projetos | `Duvidas::SalvarDuvidaService`, serviço de projetos | Backend | médio |
| 30 | Criar rota pública de escolas com localização para o mapa | `/publico/escolas`, hoje 404 | Backend | alto |
| 31 | Criar rotas de transparência | `/publico/transparencia`, hoje 404 | Backend | alto |
| 32 | Criar rotas de informações institucionais e Quatro Pilares | Hoje 404 | Backend | médio |
| 33 | Expor o id da cidade no site, para o filtro não depender de `page=all` | `AlunosView.tsx:50`, `ProjetosView.tsx:52` | Backend | baixo |
| 34 | Adicionar descrição (`alt`) aos banners | `/b_banners` | Backend | baixo |
| 35 | Definir a proporção das artes de banner | Contrato de banners | Backend/conteúdo | baixo |
| 36 | Garantir `imagem` em HTTPS se o site for servido em HTTPS | `/publico/b_banners` | Backend | baixo |
| 37 | Criar forma de remover a capa enviada por arquivo em projetos | `/pj_projetos` | Backend | baixo |
| 38 | Registrar o vínculo entre dúvida de visitante e FAQ, para evitar duplicados | `/d_duvidas_visitante` | Backend | médio |
| 39 | Registrar o consentimento de divulgação de nomes e imagens | Conquistas, relatos e membros | Backend | médio |
| 40 | Confirmar se o `Gestor` deve excluir dúvida de visitante; hoje o botão aparece e a API recusa | `db/seeds.rb`, `DuvidasVisitanteModule.tsx` | Backend | baixo |

### P4: melhoria pós-apresentação

| # | Descrição | Onde | Lado | Esforço |
|---|---|---|---|---|
| 41 | Responder HTTP 404 nas páginas dinâmicas inexistentes | `/projetos/[id]`, `/professores/[id]`, `/noticias/[id]` | Front | médio |
| 42 | Remover o código morto da seção 3 e as dependências do Leaflet | `src/components/mapa`, componentes e assets listados | Front | médio |
| 43 | Remover os restos locais de `db.json` e `/api/data`, depois do item 32 | `src/lib/db.ts`, `src/data` | Front | médio |
| 44 | Reduzir o JS inicial, hoje de 388 a 419 KB por rota | Bundle compartilhado | Front | alto |
| 45 | Avaliar os 14 a 22 prefetches por página | `SiteHeader`, `SiteFooter` | Front | baixo |
| 46 | Reduzir as 14 leituras do Início do painel | `src/lib/admin-overview.ts` | Front | médio |
| 47 | Medir de novo o LCP do desktop com a arte real | Home | Front | baixo |
| 48 | Paginar no servidor as listas com `page=all`, depois do item 33 | `AlunosView`, `ProjetosView` | Front | baixo |
| 49 | Ampliar o CSP e avaliar a saída do token do `localStorage` | `next.config.ts`, `src/lib/api/tokens.ts` | Front | alto |
| 50 | Trocar os 22 `<img>` restantes, apontados pelo ESLint | Vários componentes | Front | médio |
| 51 | Unificar as três versões do guia de rotas | `ROTAS_FRONT.md`, `docs/` | Front | baixo |
