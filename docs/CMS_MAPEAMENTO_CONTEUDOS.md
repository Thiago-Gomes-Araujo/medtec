# MEDTEC — Mapeamento de conteúdos e planejamento do CMS

Data da auditoria: **31/10/2026**. Projeto: `/home/lennon/medtec-web`.
Branch conferida: **`feature/evolucao-cms-institucional`**. HEAD consultado: `297e625`.

**Entrega de planejamento ampliada (inclui os módulos editoriais Professores e Mediadores e Alunos que Inspiram).** O editor em memória e pré-visualização dos Quatro Pilares da Home já está implementado em `/admin/institucional` (`HomePillarsModule.tsx`); nesta etapa, nenhuma tela, componente funcional, serviço, endpoint, dado ou dependência adicional é alterado. Especificação complementar de contratos Rails: [CMS_CONTRATOS_BACKEND.md](CMS_CONTRATOS_BACKEND.md).

## 1. Método, fontes e limites da confirmação

Auditoria estática das páginas em `src/app`, seus componentes e consumidores de dados; dos módulos em `src/components/admin`; de `src/lib/api/services`, tipos, sessão, navegação e handlers existentes. Também foram consultados:

- [ROTAS_FRONT.md](../ROTAS_FRONT.md), incluindo notícias administrativas e públicas, seções 18 e 19.
- [docs/rotas_front.md](rotas_front.md), versão anterior que termina na seção 17, e [ROTAS_FRONT_FULL.md](ROTAS_FRONT_FULL.md).
- Relatórios das etapas 6C a 12B e dos [lotes C1](LOTE_C1_RELATORIO.md), [C2](LOTE_C2_RELATORIO.md), [C3](LOTE_C3_RELATORIO.md) e [D](LOTE_D_RELATORIO.md).
- Contrato complementar `ROTAS_NOVAS_AVISOS_DUVIDAS.md`, lido em `/home/lennon/Downloads/ROTAS_NOVAS_AVISOS_DUVIDAS.md`; sua origem e limitações estão registradas nos relatórios C1–D. O arquivo não está versionado neste repositório; a equipe Rails deve incorporar sua versão oficial ao pacote de contratos.
- Skill `medtec-architecture`, padrões atuais do painel e guia instalado `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`. Para interfaces, orientações de planejamento da skill `impeccable`; carregador de contexto indisponível por ausência do binário, sem instalação. Não foram encontrados `PRODUCT.md` ou `DESIGN.md` no projeto.

Não há código-fonte Rails neste repositório. Não foram feitos login, chamadas à API, uploads, mutações ou testes de homologação. Não se conhece, por esta auditoria, a disponibilidade de cada rota no servidor implantado. As referências legais, nomes, números e alegações abaixo são **conteúdo encontrado no código**, sem atestar sua atualidade, vigência ou correção pedagógica. Não houve verificação externa de legislação.

Não foi recebida uma imagem anexada nesta solicitação. A prioridade visual foi identificada pelos oito itens descritos e pela implementação de `TechAdvantages.tsx`; não se afirma comparação com uma captura de tela.

### Legenda usada nos dois documentos

| Código | Classificação | Evidência e limite |
|---|---|---|
| E | Existente e confirmado no repositório | Contrato e serviço/consumidor identificados. Confirma integração no código, **não homologação em ambiente**. |
| D | Documentado, mas não homologado | Contrato complementar e implementação presentes; relatórios registram expressamente dependência do merge/homologação Rails. |
| N | Novo proposto | Necessidade sem contrato Rails encontrado; caminhos e modelos são proposta, nunca disponibilidade presumida. |
| L | Legado/local | Handler Next.js, JSON ou conteúdo fixo. Não equivale a endpoint Rails nem a CMS operacional. |

Uma tela existir não comprova persistência, publicação ou consumo público. Nenhum endpoint foi promovido a “homologado” nesta entrega.

## 2. Diagnóstico principal

1. Os **quatro pilares**, o cabeçalho de **Formação Geral Básica + Itinerários Formativos**, as duas matrizes e seus oito cards estão em código em [TechAdvantages.tsx](../src/components/TechAdvantages.tsx), sem serviço ou editor correspondente.
2. A Home não lê `siteInfo` ou `stats` do painel. Os banners vêm de `GET /publico/b_banners` (veja [BANNERS_MAPEAMENTO.md](BANNERS_MAPEAMENTO.md)). O Hero usa `/hero.jpg`, textos e indicadores fixos. Alterar a prévia institucional não altera a Home pública.
3. Notícias, avisos, galeria, geografia, canais, usuários e permissões têm integrações Rails identificadas. FAQ já foi integrado nos lotes recentes; não deve receber outro módulo ou modelo paralelo.
4. Informações institucionais têm interfaces reaproveitáveis, mas a gravação principal está bloqueada. Seus dados administrativos ainda usam `GET /api/data`.
5. Professores, alunos, escolas e transparência consomem handlers de compatibilidade que retornam coleções vazias. Isso sinaliza dependência de backend, não ausência comprovada de conteúdo oficial.
6. `/redes`, `/ao-vivo`, rodapé e redes flutuantes usam contatos fixos; o CRUD Rails de canais existente não está conectado a essas exibições.
7. O README descreve uma arquitetura antiga de CMS em JSON, inclusive arquivo de dados que não existe mais (`medtecData.ts`). O código atual e os contratos específicos prevalecem para este planejamento.

## 3. Inventário detalhado da Home

### 3.1 Hero e elementos compartilhados

| ID | Local e conteúdo encontrado | Fonte atual / gestão | Necessidade futura |
|---|---|---|---|
| H01 | `src/app/page.tsx`: título principal, descrição, selo SEDUC/52 municípios, lei e portaria | L: JSX fixo | Editor da página `home`, seção `hero`; referências documentais vinculadas. |
| H02 | Públicos “Ribeirinhos & Indígenas”, “Quilombolas & Comunidades Rurais”, “100% de Cobertura Estadual” | L: fixos | Itens ordenáveis e indicadores com fonte/data, sem converter afirmações em telemetria. |
| H03 | CTAs `#como-funciona`, `/avisos`; rolagem `#tecnologia` | L: links fixos | Rótulo e destino controlados; preservar âncoras públicas. |
| H04 | `/hero.jpg` no fundo e no painel; dois textos alternativos diferentes | L: asset fixo | Seleção de mídia, texto alternativo por uso e enquadramento; distinguir banner, fundo e foto de estúdio. |
| H05 | Painel “Rede Oficial”, “Sinal via Satélite”, “Alta Definição” | L: textos/sinais visuais fixos | Campos editoriais opcionais. Não apresentar status técnico como medição real. |
| H06 | `6.000+` estudantes, `129` unidades, `330` turmas, `52` municípios / `100%` cobertura | L: números no JSX | Fonte única de indicadores; referência temporal e unidade; reutilizar em metodologia/dossiê. |
| H07 | `SiteHeader`: marca textual, descrição do programa, atalhos, menu, links e acesso ao dossiê | L: arrays e JSX | Conteúdo global controlado; catálogo de rotas permitido. Tema e comportamento continuam em código. |
| H08 | `SiteFooter`: descrição, base legal, telefone, e-mail, endereço, fontes, navegação e copyright 2026 | L: constante `INSTITUTIONAL_CONTACT` e JSX | Contatos de canais existentes; texto institucional e links globais no CMS. Ano pode ser derivado pela aplicação. |
| H09 | `FloatingSocialRotator` montado no layout: Instagram/Facebook/YouTube | L: URLs fixas | Consumir canais publicados, respeitar desativação; sem lista paralela. |

### 3.2 Prioridade 1 — pilares e matrizes (`TechAdvantages.tsx`)

Todos os itens desta tabela são **L / fixos**, sem administração correspondente. O destino proposto é **N**, detalhado no contrato complementar.

| ID | Conteúdo atual | Campos a administrar / destino |
|---|---|---|
| P01 | Cabeçalho “Pilares da Mediação Tecnológica”, lei, título “Por que o MEDTEC…” e introdução | Página `home`, seção `pilares`: sobretítulo, título e descrição; vínculos de documentos. |
| P02 | “Transmissão Ao Vivo em Tempo Real via Satélite” | Card com título, descrição, selo “Transmissão Satelital”, ícone `Satellite`, nota “Latência Controlada • Banda C / Ku” e complemento “Porto Velho ↔ 52 Municípios”. |
| P03 | “Professor Mediador Presencial” | Card com título, descrição, selo “Apoio Humano 100%”, ícone `Users` e nota “Plantão ativo durante as transmissões”. |
| P04 | “Equidade & Inclusão Geográfica” | Card com título, descrição, selo “Universalização”, ícone `HeartHandshake`, públicos e nota “100% Gratuito”. |
| P05 | “Matriz BNCC + Agroecologia & Sustentabilidade” | Card com título, descrição (NBAZ e Projeto de Vida), selo, ícone `Leaf`, nota de diplomação e referência à portaria. |
| P06 | “Formação Geral Básica + Itinerários Formativos”, instrução de alternância e base legal | Seção `matrizes`: títulos/descrições; referências às matrizes publicadas; rótulos das abas vindos das matrizes. |
| P07 | Aba “Matriz Regular (BNCC)” | Matriz `regular`, tipo, título curto, apresentação, ano/versão/vigência, posição, documentos; áreas e componentes associados. |
| P08 | Aba “Matriz Diferenciada (Rondônia)” | Matriz `diferenciada`, mesmos campos. Não assumir equivalência entre todas as trilhas mostradas e componentes oficiais. |
| P09 | Quatro cards regulares: Linguagens & Tecnologias; Matemática & Aplicações; Ciências da Natureza; Ciências Humanas & Sociais | Áreas com título, tag, descrição específica na matriz e ordem; componentes individuais cadastrados e vinculados. |
| P10 | Quatro cards diferenciados: Agroecologia (NBAZ); Projeto de Vida; Iniciação Científica & Robótica; Saberes Amazônicos & Povos | Componentes/eixos com classificação pedagógica validada; tags, descrições e ordem. Não cadastrar cada card como um módulo. |
| P11 | Tags BNCC/inovação/protagonismo/território; `badge` dos arrays; rodapés “Grade 2026” e “100% Carga Horária” | Separar conteúdo de decoração. `badge` está nos dados, mas não é renderizado; o rodapé exibido é fixo. Ano e carga devem vir do contrato, sem inferir horas inexistentes. |
| P12 | Referências Lei nº 3.846/2016, Portaria nº 928/2025 e BNCC | Documentos reutilizáveis com órgão, número, ano, ementa, fonte oficial, vigência editorial e PDF/link real. Atualmente não há anexos nesta seção. |

Descrições regulares hoje agregam disciplinas: Português, Literatura, Produção Textual, Arte e Inglês; conteúdos matemáticos; Física, Química e Biologia; História, Geografia, Sociologia e Filosofia. Não existe no código uma base normalizada desses componentes, distribuição por série ou carga horária. A carga oficial e a taxonomia serão fornecidas/validadas pela área pedagógica, não deduzidas pelo frontend.

A criação/remoção/ordenação de cards deverá adaptar a grade às quantidades permitidas pelo template. O gestor escolhe conteúdo, ícones e variantes previamente suportadas; não edita JSX, classes Tailwind ou animações.

### 3.3 Demais seções e dossiê

| ID | Superfície | Situação atual | Gestão necessária |
|---|---|---|---|
| H10 | `Methodology`, `#como-funciona` | Cinco passos fixos: Produção nos Estúdios; Transmissão Satelital & IP; Professor Mediador; Itinerários & Agroecologia; Conclusão & Futuro | Seção do tipo passos; título, descrição, ícone e ordem. |
| H11 | `Methodology`: “Quem faz acontecer” | Três perfis ilustrados por iniciais, nomes, funções e disciplinas escritos no componente; independentes de `/api/teachers` | Usar referências de docentes oficiais quando houver contrato; revisar origem antes de migrar. |
| H12 | `Methodology`: cobertura, 129 unidades, 6.000+ estudantes, CTA `/mapa` | Fixos, repetem números da Home | Referenciar indicadores publicados, sem copiar seus valores em textos de cada seção. |
| H13 | `HomeProjectsAccordionSection`, `#projetos-ecossistemas` | Título, instrução e CTA fixos; lâminas leem `GET /publico/pj_projetos` | Integrado. Veja [PROJETOS_MAPEAMENTO.md](PROJETOS_MAPEAMENTO.md). |
| H14 | `CommunityMuralSection`, `#comunidade-escolar` | Cabeçalhos, descrições e CTAs fixos; listas via `/api/teachers` e `/api/students`; exibe até três docentes | Recursos docentes/histórias; seleção de destaques; reaproveitar mesmos registros de `/professores` e `/alunos`. |
| H15 | `PresentationPitchModal` → `ExecutiveDossierModal` | Quatro abas fixas: resumo, arquitetura satelital, alcance e amparo legal; números duplicados; impressão via `window.print()` | Página editorial `dossie`, seções e cards reutilizáveis; referências aos mesmos indicadores/documentos. |

As alegações técnicas também divergem: pilares falam em Banda C/Ku; dossiê fala em Ku e produção 4K. São pendências editoriais para validação institucional antes da carga inicial, não fatos a consolidar automaticamente.

`NewsSection`, `Announcements` e `FaqSection` não são montados pela Home atual. Não presumir blocos de notícias, avisos ou FAQ nesta página por existirem componentes com esses nomes. `FaqSection` é apenas um wrapper do FAQ público atual; `TeacherProfiles` e `StudentStories` são usados nas páginas internas.

## 4. Inventário de todas as páginas públicas

Há **15 rotas públicas de página**, incluindo `/`, mais o detalhe dinâmico de notícia. Os arquivos `page.tsx` correspondem diretamente às rotas abaixo. Em todas as páginas internas, sobretítulo, título, descrição de `PageHeader` e metadados de SEO são fixos, exceto metadados do detalhe de notícia.

| Rota | Componentes / conteúdo | Fonte dos registros e situação CMS | Trabalho necessário |
|---|---|---|---|
| `/` | Inventário H01–H15/P01–P12 | Fixo e handlers vazios | Prioridade inicial: pilares e matrizes; depois demais seções. |
| `/noticias` | `NewsEditorialSection`: busca, categorias, carrossel editorial, lista e leitor | E: `noticias.listPublico`, `listCategoriasPublico`, detalhe por slug | Reutilizar Notícias; cabeçalho/SEO via página editorial. Destaques atuais vêm da página da listagem, não de um banner da Home. |
| `/noticias/[id]` | Artigo, resumo, autor, data, capa; o parâmetro chamado `id` é usado como **slug** | E: `getPublicoBySlug`; 404 separado de indisponibilidade; SEO vem da notícia | Preservar contrato existente e links; não criar cadastro de artigos institucional paralelo. |
| `/avisos` | `AvisosView`, filtros e paginação | Administração E: avisos/tipos. Leitura pública D: `/publico/a_avisos` | Homologar o contrato público complementar; cabeçalho via página editorial. |
| `/ao-vivo` | `LiveBroadcastSection`: canais, grade, destaque de aviso e atalhos | Aviso público D; contatos e três horários/status fixos; notícias recebem `[]` | Grade editorial ordenada e canais públicos. Não há player/telemetria real a ser presumido. |
| `/projetos`, `/projetos/[id]` | `ProjetosView` e página do projeto | `GET /publico/pj_projetos`, `/publico/pj_projetos/:id` e `/publico/pj_temas` | Integrado. Veja [PROJETOS_MAPEAMENTO.md](PROJETOS_MAPEAMENTO.md). |
| `/professores` | Painel duplo ministrante/mediador fixo; `ProfessoresView` + `TeacherProfiles` | L: `/api/teachers` vazio; filtros e entrevistas no frontend | Catálogo N de perfis públicos; não confundir com contas de acesso. |
| `/alunos` | `AlunosView` + `StudentStories`: categoria, história destacada, cards e modal | L: `/api/students` vazio | Recurso N de histórias/conquistas, evidência de autorização privada e publicação. |
| `/mapa` | `SchoolMap`: filtros, lista, números e mapa SVG | L: `/api/schools` vazio; nós/coordenadas/legendas de telemetria são fixos | Fonte oficial N de unidades/polos; distinguir ilustração e dados reais; reutilizar cidades E. |
| `/comunidades` | Outro cabeçalho sobre o mesmo `SchoolMap` | Mesma fonte de `/mapa` | Reutilizar escolas e conteúdo institucional; não duplicar cadastro. |
| `/galeria` | `GallerySection`, categorias, lightbox e metadados | Administração E; página passa `gallery={[]}` e `unavailable`; sem leitura pública Rails | Propor extensão pública do recurso existente, sem abrir rota administrativa ao visitante. |
| `/acervo` | Mesma `GallerySection`, outro cabeçalho/SEO | Mesma indisponibilidade de `/galeria` | Reutilizar acervo e categorias. Política de aliases/canonical é decisão posterior. |
| `/duvidas` | `FaqCentralSection` e formulário de visitante | D: dúvidas/categorias públicas e envio de visitante, lotes C1–D | Homologar; usar FAQ existente. Não migrar FAQ novamente a JSON. |
| `/faq` | Mesma central de dúvidas, outro cabeçalho/SEO | Mesma integração D | Compartilhar conteúdo/registros; decidir canonical posteriormente. |
| `/redes` | `SocialSection`: cards, descrições, CTAs e link “Conheça o projeto” da SEDUC | Contatos definidos na página e defaults do componente; CMS E de canais desconectado | Endpoint público N sobre canais existentes + textos editoriais da página. |
| `/transparencia` | `TransparencySection`: indicadores, contratos, fontes, aviso LAI/TCE e link oficial | L: `/api/transparency` retorna arrays vazios; filtro de anos fixo 2024–2026 | Indicadores N compartilhados com Home; contratos N específicos, filtros derivados dos dados. |

`/painel-gestor` só redireciona para `/admin`; não é página de conteúdo público. `not-found.tsx` contém textos e atalhos fixos; pode receber textos globais em fase posterior. `layout.tsx` centraliza SEO padrão, URLs e redes flutuantes; `icon.tsx`/favicon são assets técnicos. `sitemap.ts` lista as 15 rotas estáticas, sem detalhes de notícias; `robots.ts` restringe administração/API. Sua evolução deve acompanhar publicação/canonical, sem tornar robots um controle de acesso.

### 4.1 Imagens, documentos, links e conteúdo lateral

- A Home usa `/hero.jpg`. Existem também logos PNG, imagens em `public/uploads`, e outros assets; existência no disco não prova publicação. Não migrar arquivos sem revisão de origem, direitos e vínculo.
- A galeria mantém `CATALOG_INFO` e prioridade para IDs legados `gal-1` etc., com localização, infraestrutura e origem fixas. O contrato atual de foto não cobre esses campos nem status de publicação; adaptar o componente e estender o recurso existente depois de homologação, sem inferir metadados pelo ID.
- O PDF em `ReplicationPassportModal` só muda estados com temporizadores; não baixa arquivo. Duração “4 semanas”, “16 horas” e “100% alinhado” são fixas. O dossiê oferece impressão do navegador, não geração de PDF pelo Rails.
- Não foi encontrado um módulo de documentos/legislação, anexos curriculares ou acervo PDF oficial no fluxo prioritário. Hoje as citações são textos; não existe contrato de upload de documentos equivalente ao upload de capas.
- Links de fontes no rodapé: SEDUC-RO, DIOF, Transparência RO e INEP. Contatos e redes aparecem repetidos em quatro superfícies; devem apontar ao mesmo registro oficial. Não alterar `ativo=false` para um fallback que faça o canal reaparecer.
- Rótulos funcionais (“Buscar”, “Tentar novamente”), mensagens de validação, tema, ícones disponíveis, layouts e animações continuam responsabilidade da aplicação. Textos institucionais, descrições, mídia, indicadores e destinos editoriais são conteúdo.

## 5. Módulos administrativos existentes e reaproveitamento

| Rota atual | Implementação / fonte | O que já existe | Lacuna / recomendação |
|---|---|---|---|
| `/admin` | `AdminOverview`, `OverviewStats`, `useAdminOverview`, `admin-overview.ts` | Resumo e atalhos; totais Rails de notícias, avisos, fotos, categorias, FAQ, usuários e estados | Não confundir esses KPIs operacionais com números públicos do programa. Adicionar contagens CMS só quando houver contrato. |
| `/admin/noticias` | `NewsModule` e `noticias.service.ts` (E) | Cadastro/edição, capa arquivo/URL, lista, exclusão, prévia e ações editoriais | Reusar padrões; manter status/autor do Rails. |
| `/admin/kanban` | `EditorialKanban`, `useEditorialNews` (E) | Publicação/reprovação sobre as mesmas notícias | Não copiar seu estado para novos conteúdos; revisão genérica é fase posterior. |
| `/admin/avisos` | `AnnouncementsModule`, avisos/tipos (E) | CRUD, tipos, cor, ativação/desativação e prévia | Preservar `ativo`; não impor status de notícias a avisos existentes. |
| `/admin/galeria` | `GalleryModule`, fotos/categorias (E) | CRUD, imagem arquivo/URL, categorias, modal e prévia | Estender publicação/acessibilidade/metadados na entidade existente, sem nova galeria. |
| `/admin/faq` | `FaqModule`, `DuvidaCategoriesManager`, `DuvidasVisitanteModule` (D) | Três áreas: dúvidas, categorias e visitantes; filtros, paginação, aprovação e atendimento | Homologar contratos existentes. `admin-faq.ts` é legado sem uso nesta rota; relatórios 9A/9B não representam o estado mais recente. |
| `/admin/projetos`, `/admin/projetos/temas`, `/admin/projetos/membros` | `ProjetosPanel`, `TemasProjetoPanel`, `MembrosProjetoPanel` | `/pj_projetos`, `/pj_temas`, `/pj_membros` | Integrado. Veja [PROJETOS_MAPEAMENTO.md](PROJETOS_MAPEAMENTO.md). |
| `/admin/banners` | `BannersPanel` | `/b_banners` | Integrado. Veja [BANNERS_MAPEAMENTO.md](BANNERS_MAPEAMENTO.md). |
| `/admin/institucional` | `SiteInfoModule` + `AdminLiveSimulator`, `GET /api/data` (L) | Campos de Hero, lei e métricas; prévia; salvar desabilitado | Evoluir a rota em editor institucional/indicadores com contratos N; reaproveitar formulário e linguagem visual, sem conservar acoplamento a `DatabaseSchema`. |
| `/admin/redes` | `SocialChannelsModule`, `admin-channels.ts`, canais Rails (E) | Leitura, alteração de valor, posição, visibilidade e gravação em lote | Reusar; sete redes fixas do seed, sem criar/excluir nem inventar TikTok. Falta consumo público. |
| `/admin/estados-cidades` | `EstadosCidadesModule`, geografia Rails (E) | CRUD e filtros de estados/municípios | Reutilizar IDs geográficos em projetos e escolas. Cidade não é escola/polo. |
| `/admin/usuarios` | `UserManager`, `useAdminUsers`, usuários/perfis/permissões Rails (E) | Equipe, contas, senhas e permissões | Reutilizar infraestrutura; perfil público docente é outro domínio. |
| `/admin/login` | Sessão Next.js + login Rails/JWT | Entrada e retorno ao destino administrativo | Reaproveitar fluxo; sessão local não concede autorização Rails. |

### 5.1 Fonte local não é a solução para o CMS novo

`src/types/index.ts` possui `DatabaseSchema`, `SiteInfo`, `Stats`, tipos de FAQ e outras entidades antigas. `src/lib/api/types.ts` contém os contratos Rails atuais; centralizar contratos novos nesse domínio após aceite, com adaptadores explícitos.

`db.json` e `initialData.json` têm `siteInfo`, quatro métricas e redes; as coleções de notícias, avisos, galeria, usuários, escolas, professores, alunos e FAQ estão vazias no snapshot auditado. `getDatabase()` mescla defaults e pode devolver o snapshot inicial em erro; sua presença não comprova dados oficiais Rails.

`GET /api/data` exige sessão Next.js, retorna uma estrutura ampla e pode consultar usuários via cliente servidor Rails. `PUT /api/data` ainda existe e escreve configurações locais, mas zera notícias, avisos, galeria, usuários, projetos e FAQ antes de gravar. Não usar esse caminho para persistir o novo CMS nem reativar botões bloqueados. Não foram executados esses handlers nesta auditoria.

`/api/teachers`, `/api/students`, `/api/schools` e `/api/transparency` são compatibilidade vazia. `/api/faqs` também permanece, mas o FAQ público atual usa Rails diretamente. Não criar novos handlers desse tipo como substituto do backend.

### 5.2 Infraestrutura a preservar

- `AdminShell`, `DesktopSidebarContainer`, `SidebarFolderAccordion`, `SidebarNavItem`, `MobileDrawerFooter` e `useAdminTheme` para navegação, tema, busca do menu e layout responsivo.
- `SECTION_CONFIG`, `AdminSection`, `SECTION_HREFS` e aliases administrativos para registrar futuras rotas no menu existente, sem painel isolado.
- `AdminShell` pode entregar a sessão aos filhos por função; iniciar leituras restritas só depois da confirmação de acesso, como nas subrotas recentes.
- `apiFetch`, `ApiError`, `getMediaUrl`, cliente de tokens e serviços por domínio para integração. Manter refresh coordenado, FormData sem Content-Type manual e DTO público separado do administrativo.
- `AdminLiveSimulator`, `AdminPreviewModal` e `NewsPublicationPreview` como padrões de prévia; ampliar tipos/renderizadores necessários depois, sem fingir que a prévia atual cobre os novos templates.
- `useDialogFocus`, feedbacks, formulários, paginação e estados dos módulos recentes como referências. Não há formulário genérico único comprovado; extrair somente elementos realmente compartilhados durante a implementação autorizada.

A autorização atual mistura sessão local e Rails e heurísticas `isGestor` por perfil/ID. O shell limita rotas, mas não representa uma matriz de permissões efetivas por ação para novos recursos. Reusar sessão e infraestrutura, exigir Rails para leitura/escrita administrativa nova e mapear ações retornadas para o próprio usuário; não ampliar acesso por nome de perfil ou por uma guarda visual. `rails-backend.ts` mantém autenticação administrativa legada no servidor; não usá-la para publicar em nome de outro usuário nem reproduzir credenciais na documentação.

## 6. Arquitetura administrativa proposta

Escolha recomendada: **editor de conteúdo com templates controlados + cadastros de domínio reutilizados**. Sem construtor livre de páginas e sem um módulo por card.

| Área no menu existente | Rota frontend sugerida | Responsabilidade |
|---|---|---|
| Conteúdos do site → Página inicial | `/admin/conteudos/home` (nova) | Seções da Home, quatro pilares, cabeçalhos, referências a matrizes, projetos e indicadores. |
| Conteúdos do site → Páginas institucionais | Evoluir `/admin/institucional` | Textos internos, dossiê, textos globais, SEO e links institucionais; preservar entrada atual. |
| Conteúdos do site → Matrizes curriculares | `/admin/matrizes` (nova) | Matrizes, áreas, componentes, vínculos, séries/cargas validadas, documentos e publicação. Catálogos em abas internas. |
| Conteúdos do site → Documentos e legislação | `/admin/documentos` (nova) | Biblioteca única para normas, referências e PDFs; reuso entre matrizes, páginas e projetos. |
| Dados e contatos → Indicadores públicos | Subárea de `/admin/institucional` | Métricas do programa, fontes e data; sem outra tela duplicando os quatro números antigos. |
| Publicações → Banners / Projetos | `/admin/banners`, `/admin/projetos` atuais | Ativar com contrato homologado, adaptar fontes e prévia. |
| Publicações → Professores e Mediadores | `/admin/professores` (nova) | Cadastro editorial de docentes ministrantes e mediadores, entrevistas, foto e materiais pedagógicos, vínculo com município/escola, fluxo de revisão e destaques na Home. |
| Publicações → Alunos que Inspiram | `/admin/alunos` (nova) | Cadastro editorial de conquistas estudantis, relato, foto, gestão privada de termo LGPD/ECA (especialmente menores), fluxo de revisão e destaques na Home e em `/alunos`. |
| Aprovação e Revisão → Fila de Aprovação | Evoluir `/admin/kanban` | Unificar a moderação editorial em abas por tipo de conteúdo (`Notícias`, `Professores e Mediadores`, `Alunos que Inspiram`), preservando aprovação, reprovação com motivo e trilha de auditoria. |
| Publicações → Notícias / Avisos / Galeria / FAQ | Rotas atuais | Preservar módulos; extensões contratuais pontuais. |
| Fase posterior → Escolas e transparência | Rotas a definir após contratos | Unidades escolares/polos e contratos financeiros são domínios próprios; reutilizar dados geográficos (`g_cidades`). |

As novas rotas são **propostas de interface**, não endpoints implementados. Cada card é um item da seção `pilares`; regular/diferenciada são registros da mesma entidade Matriz. Áreas e componentes são catálogos relacionados, não páginas administrativas independentes obrigatórias.

Páginas podem ter seções de tipos `hero`, `cards`, `passos`, `texto`, `matrizes`, `indicadores`, `colecao` e `grade`. Variantes visuais, âncoras e ícones são um catálogo fechado conhecido pelo frontend/Rails. A seção `colecao` referencia recursos existentes; não copia textos de notícias, FAQ ou projetos. Matrizes, documentos e indicadores possuem publicação própria e controle de uso.

Para editar um conteúdo publicado sem alteração imediata do portal, Rails mantém **rascunho e versão publicada separados**. Salvar atualiza rascunho; publicar promove uma versão validada; despublicar retira a versão pública. A prévia autenticada mostra rascunho e identifica a versão. Sem persistência local, status otimista ou botões que anunciem sucesso sem resposta real.

## 7. Planejamento de cada interface

Regras comuns: lista com carregamento identificado; vazio confirmado diferente de indisponibilidade/403; busca com resultado vazio; erro com nova tentativa; formulário preserva digitação diante de falha; validação por campo e resumo; envio bloqueado durante operação. Sucesso só após confirmação Rails. Se salvar funcionar e a recarga falhar, informar os dois resultados sem repetir mutação. Concorrência apresenta conflito, sem sobrescrever rascunho de outro gestor. Sem auto-save antes de contrato específico.

Prévia com desktop/mobile, identificação “Rascunho” ou “Versão publicada”, foco/teclado e retorno ao editor; mesma apresentação pública quando tecnicamente possível. Prévia antes do primeiro salvamento pode usar estado transitório do formulário, com indicação “não salvo”; nunca arquivo JSON/localStorage. Antes de sair com alterações, oferecer continuar ou descartar, sem alegar recuperação persistente.

| Módulo | Listagem, busca e filtros | Cadastro e edição | Prévia, publicação e ordem | Dependência Rails / estado antes dela |
|---|---|---|---|---|
| Home e vantagens | Seções com título, tipo, ordem, quantidade de itens, visibilidade e situação; busca só se necessária | Cabeçalho da seção; lista dos quatro cards com título, descrição, selo, ícone, notas, links e documentos; adicionar/editar/remover no mesmo editor | Prévia da seção e Home; mover acima/abaixo acessível; publicar página inteira com resumo do que mudou | N páginas/seções; depois de autorização pode haver composição visual sem envio. Salvar/publicar/despublicar indisponíveis até contrato. |
| Matrizes | Título, tipo, ano/vigência, situação; busca por título e filtros tipo/ano/status | Dados gerais; áreas; componentes; associações por série/etapa e carga; documentos/fontes; descrição contextual e ordem | Alternância regular/diferenciada na prévia; publicação atômica da matriz; validar referências; ordenação de áreas/componentes dentro dela | N matrizes/catálogos. Nada de inferir carga/BNCC pelo texto atual. |
| Áreas e componentes | Abas dentro de Matrizes; busca por nome/código; ativo/inativo e área | Código, nome, descrição; vínculo ao catálogo de áreas; anexos/fontes; associação contextual na matriz | Prévia dentro da matriz; ativação do catálogo não publica sozinha; alteração só entra ao republicar matriz | N catálogos; bloquear exclusão com vínculos. Sem menu para cada disciplina. |
| Documentos/legislação | Título, tipo, órgão, número/ano, vigência, situação; busca e filtros | Ementa, URL oficial e/ou PDF, versão, fonte, acessibilidade e metadados; lista de usos | Abrir PDF/link real; publicar/despublicar com impacto mostrado; ordem definida no vínculo com seção/matriz | N biblioteca/upload Rails. Falta de arquivo e falha de upload são estados distintos. |
| Institucional | Páginas/textos globais com situação e data; busca por título/rota | Títulos, textos, seções, links, referências legais e SEO | Prévia por template e tema; publicação por página; ordem das seções | N; evoluir `SiteInfoModule`, sem reativar `PUT /api/data`. |
| Indicadores | Código/rótulo, valor/unidade, referência, fonte, situação; filtros por ano/código | Valor numérico + formato, qualificador, fonte, data e nota metodológica | Prévia Hero/metodologia/dossiê/transparência; publicação do indicador; posição nos locais de uso | N; não converter `liveHoursCount` em `turmas` silenciosamente. |
| Banners | Miniatura, título, posicionamento, ordem e status; filtros por posicionamento/status | Imagem/seleção de acervo, alt, crédito, título opcional e destino | Reusar `SitePhotosManager`; prévia no template público; ordem por posicionamento; publicar/despublicar reais | N; acervos de notícias/galeria existentes podem ser consultados conforme permissões. Upload específico só após contrato. |
| Projetos | Reusar lista; busca, trilha, cidade e situação; paginação servidor | Reusar formulário atual: desafio, prática, impacto, competências, escola/mediador, materiais e cronograma; guia PDF real opcional | Reusar prévia; publicação/despublicação; ordem/destaques da Home referenciam os mesmos projetos | N; salvar/excluir bloqueados. Upload local existente não comprova integração futura. |
| Notícias, avisos, FAQ, galeria e canais | Listas e filtros atuais | Formulários e serviços atuais | Manter semântica existente: notícias/FAQ com ações próprias; avisos/canais com ativo; galeria requer extensão | E/D; homologar e estender o que falta, sem duplicação. |
| Professores e Mediadores (`/admin/professores`) | Busca textual (`nome`, `disciplina`, `escola`, `resumo`), filtros por `funcao` (`ministrante`, `mediador`), `g_cidade_id`, `status` (`rascunho`, `em_revisao`, `publicado`, `reprovado`, `despublicado`) e `destaque_home`; paginação no servidor | Nome de exibição, função, disciplina/área, vínculo com município (`g_cidade_id`) e escola (`escola_id`/`escola_nome`), resumo de prática, entrevista completa, recomendação aos estudantes, upload de foto oficial com `alt` e anexos/materiais pedagógicos | Prévia do card de diretório, gaveta de entrevista e destaque da Home (`#como-funciona` e `#comunidade-escolar`); envio para revisão, aprovação, reprovação com motivo, despublicação e ordenação | N (`/cms/docentes` e `/publico/cms/docentes`); reutiliza `/g_cidades` (E). Sem conta de login exigida para o docente retratado. |
| Alunos que Inspiram (`/admin/alunos`) | Busca textual (`nome_exibicao`, `conquista`, `comunidade`, `escola`), filtros por `categoria`, `g_cidade_id`, `status`, `status_consentimento_lgpd` e `destaque_home`; paginação no servidor | Nome de exibição, idade/faixa etária opcional (sem data de nascimento pública), comunidade, município (`g_cidade_id`), escola (`escola_id`/`escola_nome`), categoria da conquista, título da conquista, relato/resumo, depoimento expandido, foto e materiais; aba obrigatória de **Termo LGPD/ECA** (menor/maior, responsável legal, arquivo privado PDF/imagem, vigência) | Prévia do card padrão, do card panorâmico ("Destaque Territorial" em `/alunos`) e do mural da Home; bloqueio automático de publicação sem termo LGPD válido; despublicação imediata em caso de revogação | N (`/cms/historias_alunos` e `/publico/cms/historias_alunos`); armazenamento privado estrito para termos de autorização. |
| Escolas e transparência | Fase posterior: busca, cidade, tipo/ano/situação conforme domínio | Unidades/coordenadas; contratos/fontes | Prévia nas superfícies existentes; publicação e ordenação específicas; sem status técnico simulado | N; contratos de extensão no documento Rails. Não construir telas antes de definir fonte oficial. |

### 7.1 Proposta concreta das primeiras telas

**Tela 1 — Página inicial / Pilares e características.** Dentro de `AdminShell`, breadcrumb “Conteúdos do site / Página inicial”, título, situação pública e data da última publicação. Lista ordenada de seções à esquerda em desktop; editor da seção selecionada no centro; prévia lateral/recolhível. No mobile, seletor de seção e abas “Editar / Pré-visualizar”, sem três colunas comprimidas. A primeira seção selecionada será `pilares`, com P02–P05 na ordem atual. Cada linha abre o formulário do card no mesmo espaço. Ações principais: salvar rascunho e pré-visualizar; publicar em ação explícita, separada, mostrando alterações e efeitos. Sem endpoint, controles de escrita permanecem indisponíveis com motivo visível.

**Tela 2 — Matrizes curriculares.** Lista de duas matrizes iniciais, sem apresentá-las como já cadastradas no Rails. Formulário em abas “Dados gerais / Áreas e componentes / Documentos / Prévia”. Regular organiza as quatro áreas, com seleção de componentes do catálogo; diferenciada recebe a classificação aprovada pela equipe pedagógica. Carga e vigência não são preenchidas com valores inventados. Botões de mover em cada vínculo permitem ordenação por teclado.

**Tela 3 — Documentos e legislação.** Biblioteca com busca e filtros, formulário para fonte/link/PDF e painel “Usado em”. A seleção de documento nos dois editores anteriores usa esta biblioteca. Não criar campos de upload isolados em cada card.

**Tela 4 — Institucional / Indicadores públicos.** Evolução da rota atual, começando pela correção de modelo: estudantes, unidades, turmas e municípios são códigos distintos; horas podem existir separadamente se houver fonte. Prévia conjunta dos quatro números em todos os pontos que os repetem.

### 7.2 Especificação Editorial Completa: Professores e Mediadores e Alunos que Inspiram

#### 7.2.1 Auditoria das superfícies públicas existentes

Foram auditados todos os componentes públicos e handlers que exibem ou consomem dados de educadores, mediadores e estudantes:

| Superfície pública | Arquivos auditados | Como funciona hoje (estado atual `L`) | O que o CMS precisa administrar (`N`) |
|---|---|---|---|
| **Home — Seção `#como-funciona`** ("Quem Faz Acontecer na Ponta") | [Methodology.tsx](../src/components/Methodology.tsx) | Array fixo `educators` no JSX com 3 mini-perfis (`Profa. Ana Beatriz`, `Prof. Carlos Henrique`, `Profa. Marta Oro Win`), exibindo iniciais (`initials`), nome (`name`), papel/município (`role`), disciplina (`subject`) e selo territorial (`tag`). Não consome `/api/teachers`. | Vincular até 3 docentes publicados do catálogo oficial (`CmsDocente`) ou referenciados na seção `metodologia` da Home, com opção de selo territorial curto (`tag_territorial`). |
| **Home — Seção `#comunidade-escolar`** ("Quem Ensina e Quem Transforma a Educação em Rondônia") | [CommunityMuralSection.tsx](../src/components/CommunityMuralSection.tsx) | Mural em 2 colunas que faz `fetch('/api/teachers')` e `fetch('/api/students')` (ou recebe `initialTeachers`/`initialStudents`). Renderiza até 3 docentes (`teachers.slice(0, 3)`) e até 3 histórias de alunos (`students.slice(0, 3)`), com modais de leitura rápida (`selectedTeacher` e `selectedStudent`). | Consumir os destaques publicados (`destaque_home = true`, ordenados por `posicao_home asc, id asc`) via endpoints públicos `/publico/cms/docentes` e `/publico/cms/historias_alunos` (ou resolvidos no agregado público da Home). |
| **Página `/professores`** ("Professores e Mediadores") | [src/app/professores/page.tsx](../src/app/professores/page.tsx), [ProfessoresView.tsx](../src/components/ProfessoresView.tsx), [TeacherProfiles.tsx](../src/components/TeacherProfiles.tsx), [src/app/api/teachers/route.ts](../src/app/api/teachers/route.ts) | `PageHeader` e painel duplo (`Ministrantes` vs. `Mediadores`) fixos. `ProfessoresView` oferece filtro por `Todas`, `Ministrante`, `Mediador` e busca textual. `TeacherProfiles` consulta `GET /api/teachers?funcao=...` (handler `L` que retorna `items: []`), exibe cards com iniciais (`getInitials`), código `DOC-00X`, `nome`, `disciplina`, badge de `funcao`, `escola`, `municipio` e `resumo`, além de gaveta lateral (`drawer`) com `entrevista`, `resumo` e orientação pedagógica aos estudantes. | CRUD editorial completo em `/admin/professores`, suportando foto oficial (com fallback para iniciais quando sem foto), código público/slug, vínculo com município (`g_cidade_id`) e escola, entrevista, orientação aos alunos, materiais pedagógicos e filtros/paginação no servidor. |
| **Página `/alunos`** ("Alunos que Inspiram") | [src/app/alunos/page.tsx](../src/app/alunos/page.tsx), [AlunosView.tsx](../src/components/AlunosView.tsx), [StudentStories.tsx](../src/components/StudentStories.tsx), [src/app/api/students/route.ts](../src/app/api/students/route.ts) | `PageHeader` com aviso LGPD/ECA. `AlunosView` filtra por `Todas`, `Vestibular`, `Olimpíada`, `Robótica`, `Feira de Ciências`. `StudentStories` consulta `GET /api/students?categoria=...` (handler `L` que retorna `items: []`), destaca `students[0]` em card panorâmico ("Destaque Territorial"), lista `students.slice(1)` em grade de 3 colunas e abre modal com `conquista`, `categoria`, `nome`, `idade`, `comunidade`, `municipio`, `resumo` e selo de verificação LGPD/ECA. | CRUD editorial completo em `/admin/alunos`, controle explícito de qual história ocupa o "Destaque Territorial" (`destaque_pagina`), foto autorizada opcional, vínculo com município/escola/comunidade e trava obrigatória de consentimento LGPD/ECA no servidor antes de publicar. |

#### 7.2.2 Campos de cadastro e edição

**Módulo 1 — Professores e Mediadores (`CmsDocente`, rota `/admin/professores`):**

| Campo | Tipo / Obrigatoriedade | Superfície de uso e regra de negócio |
|---|---|---|
| `nome` | `string` (3..120), obrigatório | Nome público de exibição (ex.: `"Profa. Dra. Ana Beatriz Souza"`). Não exige que o docente possua conta de usuário administrativo no painel. |
| `slug` | `string` (3..140), único | Gerado a partir do `nome` ou ajustado editorialmente para leitura pública individual (`/publico/cms/docentes/:slug`). |
| `codigo_exibicao` | `string` (somente leitura) | Código visual formatado pelo backend ou derivado do `id` (ex.: `DOC-001`) exibido no rodapé do card em `TeacherProfiles.tsx`. |
| `funcao` | enum: `ministrante` \| `mediador`, obrigatório | Define o papel pedagógico (`Docente Ministrante • Estúdio SEDUC` vs. `Mediação Presencial • Unidade Escolar`). |
| `rotulo_funcao` | `string` (3..60), opcional | Permite flexão de gênero na apresentação pública (`"Ministrante"`, `"Mediador"`, `"Mediadora"`) mantendo o filtro canônico `ministrante`/`mediador`. |
| `disciplina` | `string` (2..120), obrigatório | Especialidade ou área de atuação exibida no card e na gaveta (ex.: `"Linguagens e Suas Tecnologias"`). |
| `componente_curricular_ids` | `integer[]`, opcional | Vínculo opcional ao catálogo `ComponenteCurricular` (`N`) quando disponível. |
| `g_cidade_id` | FK `GCidade` (`E`), obrigatório | Município de atuação em Rondônia, selecionado a partir do serviço oficial existente `/g_cidades`. |
| `escola_id` / `escola_nome` | FK `CmsEscola` (`N`) opcional + `string` (3..160) obrigatório | Unidade escolar ou estúdio de lotação (ex.: `"Estúdio Central SEDUC-RO"` ou `"E.E.E.F.M. Paulo Leal"`). Se `escola_id` informado, resolve nome oficial; caso contrário, usa `escola_nome` validado. |
| `comunidade` / `tag_territorial` | `string` (2..80), opcional | Contexto territorial curto usado no card de metodologia da Home (ex.: `"Fronteira • Vale do Guaporé"`, `"Aldeias • Povos Originários"`). |
| `resumo` | `text` (20..600), obrigatório ao publicar | Síntese da prática pedagógica exibida nos cards da Home, na listagem de `/professores` e no bloco "Metodologia Pedagógica Aplicada". |
| `entrevista` | `text` (40..4000), obrigatório ao publicar | Depoimento/entrevista completa exibida na gaveta lateral de `/professores` e no modal rápido do mural da Home. |
| `orientacao_estudantes` | `text` (20..800), opcional | Texto de recomendação direta aos alunos exibido no bloco inferior da gaveta de `TeacherProfiles.tsx` (substituindo o parágrafo genérico fixo). |
| `foto` (`foto_midia_id`) | referência `Midia` (`imagem`), opcional | Retrato oficial do docente com `texto_alternativo` obrigatório se informada e `ponto_focal`. Quando ausente, a interface pública preserva o avatar institucional com iniciais (`getInitials`). |
| `materiais` (`documento_ids`) | `integer[]`, opcional (máx. 5) | Materiais pedagógicos, planos de aula ou publicações públicas vinculadas ao perfil docente (`CmsDocumento` / `Midia` pública). |
| `termo_imagem_midia_id` | FK `Midia` privada, condicional | Obrigatório quando `foto_midia_id` estiver preenchido, registrando autorização de uso de imagem institucional do servidor público. |
| `destaque_home` / `posicao_home` | `boolean` / `integer` (1..10) | Controla elegibilidade e ordem no mural `#comunidade-escolar` e na seção `#como-funciona` da Home. |
| `posicao` | `integer` (>= 1) | Ordem de exibição na listagem pública `/professores`. |

**Módulo 2 — Alunos que Inspiram (`CmsHistoriaAluno`, rota `/admin/alunos`):**

| Campo | Tipo / Obrigatoriedade | Superfície de uso e regra de negócio |
|---|---|---|
| `nome_exibicao` | `string` (3..120), obrigatório | Nome autorizado para divulgação pública (pode ser nome social, primeiro nome + sobrenome ou iniciais abreviadas conforme termo LGPD). |
| `slug` | `string` (3..140), único | Identificador público amigável para leitura de detalhe (`/publico/cms/historias_alunos/:slug`). |
| `idade_referencia` | `integer` (10..99), opcional | Idade do estudante na época da conquista. **Nunca armazenar ou expor data de nascimento no DTO público.** |
| `exibir_idade` | `boolean`, padrão `true` | Permite ocultar a idade na exibição pública caso o termo de consentimento restrinja esse dado. |
| `menor_de_idade` | `boolean`, obrigatório no admin | Define se o estudante tinha menos de 18 anos no ato da autorização, acionando exigência estrita de responsável legal (ECA + LGPD Art. 14). |
| `categoria` | enum/catálogo: `Vestibular` \| `Olimpíada` \| `Robótica` \| `Feira de Ciências`, obrigatório | Categoria da conquista usada nos filtros de `AlunosView.tsx`, nos ícones de `StudentCategoryIcon` e nos selos do mural. |
| `conquista` | `string` (5..160), obrigatório | Título principal em destaque (ex.: `"1º Lugar em Medicina — UNIR"`, `"Medalha de Ouro na OBMEP"`). |
| `ano_conquista` / `serie_turma` | `integer` (2016..2100) / `string` (2..60), opcionais | Ano de obtenção do resultado e série/etapa no Ensino Médio Mediado por Tecnologia. |
| `g_cidade_id` | FK `GCidade` (`E`), obrigatório | Município polo vinculado a `/g_cidades`. |
| `escola_id` / `escola_nome` | FK `CmsEscola` (`N`) opcional + `string` (3..160) obrigatório | Escola estadual ou polo de ensino onde o estudante cursou o MEDTEC. |
| `comunidade` | `string` (2..120), obrigatório | Comunidade de origem (ribeirinha, rural, indígena, quilombola ou distrito) exibida nos cards e modais (`aluno.comunidade • aluno.municipio`). |
| `resumo` | `text` (20..600), obrigatório ao publicar | Citação/síntese da trajetória exibida nos cards da Home, na grade de `/alunos` e no destaque territorial. |
| `relato_completo` | `text` (40..4000), opcional | Narrativa expandida para o modal de trajetória completa em `/alunos` (quando omitido, exibe `resumo`). |
| `professor_mediador_id` | FK `CmsDocente` (`N`), opcional | Vínculo opcional ao professor mediador que acompanhou o estudante na escola polo. |
| `foto` (`foto_midia_id`) | referência `Midia` (`imagem`), opcional | Fotografia do estudante/premiação com `texto_alternativo` obrigatório; só é entregue no endpoint público se `consentimento_lgpd.autoriza_imagem = true` e vigente. |
| `materiais` (`documento_ids`) | `integer[]`, opcional (máx. 5) | Certificados públicos de premiação, pôster científico ou resumo de feira de ciências (com dados sensíveis tarjados/sanitizados). |
| `destaque_pagina` | `boolean`, padrão `false` | Define explicitamente qual história ocupa o card panorâmico de topo ("Destaque Territorial") em `/alunos`, em vez de depender apenas do índice `students[0]`. |
| `destaque_home` / `posicao_home` | `boolean` / `integer` (1..10) | Controla exibição e ordem na coluna direita de `CommunityMuralSection.tsx` na Home (`#comunidade-escolar`). |
| `posicao` | `integer` (>= 1) | Ordem de exibição na grade de `/alunos`. |

#### 7.2.3 Upload de fotos, materiais e separação de anexos privados

1. **Fotos públicas (`foto_midia_id`):** utilizam o serviço `POST /api/v1/cms/midias` (`N`, especificado em `CMS_CONTRATOS_BACKEND.md` §8), aceitando JPEG, PNG ou WebP até **5 MiB**, com validação de assinatura binária, dimensões mínimas recomendadas (`400x400` para avatar docente; `800x600` para destaque estudantil), `texto_alternativo` obrigatório e `ponto_focal` (`{x, y}`).
2. **Materiais pedagógicos e certificados públicos (`documento_ids`):** utilizam a biblioteca de documentos (`CmsDocumento` / `Midia` tipo `documento`), aceitando PDF até **20 MiB**. Só ficam acessíveis em `/publico/cms/midias/:id/arquivo` quando vinculados a um perfil/história efetivamente `publicado`.
3. **Anexos privados de consentimento (`termo_lgpd_midia_id`):** **jamais** utilizam a biblioteca pública de documentos nem geram URL em `/publico/...`. São enviados com escopo `acesso: "privado_lgpd"` (PDF ou imagem digitalizada assinada, até 10 MiB) e somente podem ser baixados/visualizados por rota autenticada restrita (`GET /api/v1/cms/historias_alunos/:id/termo_autorizacao`) com `Cache-Control: private, no-store` e registro de acesso em log de auditoria.

#### 7.2.4 Município e escola vinculados

- **Município (`g_cidade_id`):** ambos os módulos reutilizam obrigatoriamente o recurso existente e homologado `GCidade` (`E`, `GET /api/v1/g_cidades` via `estadosCidades.service.ts`). O serializer público resolve e devolve `municipio_nome` (ex.: `"Guajará-Mirim"`) e `g_cidade_id` para que os componentes públicos (`TeacherProfiles`, `StudentStories`, `CommunityMuralSection`) mantenham compatibilidade direta com o campo `municipio` sem consultas extras.
- **Escola (`escola_id` e `escola_nome`):** aceita referência opcional ao futuro catálogo `CmsEscola` (`N`, `/cms/escolas`) e exige `escola_nome` textual validado enquanto o catálogo de escolas não estiver integralmente povoado. Para docentes `ministrante`, o formulário oferece preenchimento rápido `"Estúdio Central SEDUC-RO — Porto Velho"`.

#### 7.2.5 Listagem, filtros, busca e paginação

| Escopo | Professores e Mediadores | Alunos que Inspiram |
|---|---|---|
| **Listagem administrativa** (`GET /cms/docentes`, `GET /cms/historias_alunos`) | Paginação no servidor (`page`, `per_page=20`, máx. `100`). Colunas: Avatar/Iniciais, Nome + Código, Função, Disciplina, Escola/Município, Destaque Home, Status Editorial, Última atualização e Ações. | Paginação no servidor (`page`, `per_page=20`, máx. `100`). Colunas: Protagonista + Idade/Menor, Conquista + Categoria, Comunidade/Município, Status Termo LGPD, Destaque (`/alunos` e Home), Status Editorial e Ações. |
| **Filtros e busca no Admin (`q[...]`)** | `q[busca_cont]` (nome, disciplina, escola, resumo), `q[funcao_eq]` (`ministrante` \| `mediador`), `q[g_cidade_id_eq]`, `q[status_eq]`, `q[destaque_home_eq]`, `q[s]` (`posicao asc,id asc` ou `updated_at desc,id desc`). | `q[busca_cont]` (nome, conquista, comunidade, escola), `q[categoria_eq]`, `q[g_cidade_id_eq]`, `q[status_eq]`, `q[status_lgpd_eq]` (`pendente`, `verificado`, `expirado`, `revogado`), `q[destaque_home_eq]`, `q[destaque_pagina_eq]`. |
| **Listagem, busca e filtros públicos** (`GET /publico/cms/docentes`, `GET /publico/cms/historias_alunos`) | Parâmetros: `funcao` (`ministrante` \| `mediador`), `cidade_id`, `busca` (nome, disciplina, escola, município, resumo), `destaque_home` (`true`/`false`), `page` (padrão 1), `per_page` (padrão 12, máx. 50). Retorna somente registros com `status = "publicado"`. | Parâmetros: `categoria` (`Vestibular`, `Olimpíada`, `Robótica`, `Feira de Ciências`), `cidade_id`, `busca` (nome, conquista, comunidade, município, resumo), `destaque_home` (`true`/`false`), `page` (padrão 1), `per_page` (padrão 12, máx. 50). Retorna somente registros com `status = "publicado"` **e** consentimento LGPD ativo. |

#### 7.2.6 Fluxo editorial: rascunho, revisão, aprovação, reprovação e despublicação

Para convergir com o fluxo de moderação já adotado no Painel Gestor (`NNoticia` + revisão de capítulos do CMS), ambos os módulos operam com **5 estados editoriais explícitos** controlados exclusivamente pelo backend Rails:

1. **`rascunho`**: estado inicial ao criar (`POST`) ou ao salvar edições de trabalho (`PATCH`). Permite salvar cadastro parcial (inclusive enquanto aguarda digitalização do termo LGPD). Invisível no portal público.
2. **`em_revisao`** (`PATCH /:id/enviar_revisao`): operador conclui o preenchimento e submete o perfil/história para a Fila de Aprovação (`/admin/kanban`).
   - *Regra de bloqueio no envio de Alunos que Inspiram:* o backend rejeita (`422 validacao_falhou`) a transição para `em_revisao` se os campos obrigatórios de relato ou os metadados e arquivo do termo de autorização LGPD/ECA estiverem ausentes.
3. **`publicado`** (`PATCH /:id/publicar`): gestor/administrador aprova o registro, promovendo um snapshot validado (`revisao_publicada`) para exibição pública imediata.
   - Se um registro já `publicado` sofrer nova edição (`PATCH`), o rascunho é atualizado (`tem_alteracoes_nao_publicadas = true`) sem tirar do ar nem alterar a versão pública até nova aprovação.
4. **`reprovado`** (`PATCH /:id/reprovar`): gestor/administrador recusa a submissão informando obrigatoriamente `motivo_reprovacao` (mínimo 10 caracteres, ex.: *"Termo de autorização ilegível na assinatura do responsável"* ou *"Revisar texto da entrevista"*). O registro retorna para correção do operador com o motivo destacado no topo do editor.
5. **`despublicado`** (`PATCH /:id/despublicar` ou `PATCH /:id/revogar_consentimento`): retira imediatamente o registro das listagens públicas, da Home e invalida o acesso público às mídias associadas, preservando o histórico administrativo.

#### 7.2.7 Permissões por perfil e registro de auditoria

**Matriz de permissões por perfil (`permissoes_efetivas` em `/auth/me`):**

| Perfil no Painel Gestor | Módulo `cms_docentes` | Módulo `cms_historias_alunos` | Acesso ao Termo Privado LGPD (`termo_autorizacao`) |
|---|---|---|---|
| **Administrador** | `index`, `show`, `create`, `update`, `destroy`, `preview`, `enviar_revisao`, `publicar`, `reprovar`, `despublicar` | `index`, `show`, `create`, `update`, `destroy`, `preview`, `enviar_revisao`, `publicar`, `reprovar`, `despublicar`, `revogar_consentimento` | Sim (`gerenciar_consentimento_lgpd`, `visualizar_termo_lgpd`) |
| **Gestor** | `index`, `show`, `create`, `update`, `preview`, `enviar_revisao`, `publicar`, `reprovar`, `despublicar` (conforme concessão) | `index`, `show`, `create`, `update`, `preview`, `enviar_revisao`, `publicar`, `reprovar`, `despublicar`, `revogar_consentimento` | Sim (`gerenciar_consentimento_lgpd`, `visualizar_termo_lgpd`) |
| **Operador de Conteúdo / Editor** | `index`, `show`, `create`, `update`, `preview`, `enviar_revisao` (sem publicar/despublicar direto) | `index`, `show`, `create`, `update`, `preview`, `enviar_revisao` (sem aprovar/publicar direto) | Envio do arquivo no rascunho; leitura de termos de terceiros restrita se não autorizado |
| **Curador de Fotos / Publicador de Avisos** | Somente leitura opcional ou sem acesso (escopo isolado) | Sem acesso | Não (`403 sem_permissao`) |

**Registro de auditoria obrigatório (somente leitura no frontend, gravado pelo Rails):**

- Em cada registro (`CmsDocente` e `CmsHistoriaAluno`): `autor_id`, `autor_nome`, `atualizado_por_id`, `submetido_por_id`, `submetido_em`, `aprovado_por_id`, `aprovado_nome`, `publicado_em`, `reprovado_por_id`, `reprovado_em`, `motivo_reprovacao`, `despublicado_por_id`, `despublicado_em` e, para alunos, `verificado_lgpd_por_id`, `verificado_lgpd_em`, `revogado_lgpd_por_id`, `revogado_lgpd_em`, `motivo_revogacao_lgpd`.
- **Trilha de eventos (`historico_editorial`):** cada transição (`criado`, `enviado_revisao`, `aprovado_publicado`, `reprovado`, `despublicado`, `termo_lgpd_anexado`, `termo_lgpd_verificado`, `consentimento_revogado`, `termo_lgpd_visualizado`) gera um item imutável com `id`, `acao`, `descricao`, `usuario_id`, `usuario_nome`, `created_at` e metadados sanitizados, alimentando a timeline de auditoria na Fila de Aprovação e no próprio editor.

#### 7.2.8 Destaque e ordenação na Home e nas páginas internas

1. **Mural da Comunidade Escolar na Home (`CommunityMuralSection.tsx`, `#comunidade-escolar`):**
   - Exibe até **3 docentes** (`destaque_home = true`, ordenados por `posicao_home asc, id asc`) na coluna esquerda e até **3 histórias de alunos** (`destaque_home = true`, ordenadas por `posicao_home asc, id asc`) na coluna direita.
   - O gestor pode definir os destaques tanto marcando `destaque_home` e `posicao_home` no cadastro do docente/aluno quanto selecionando a coleção ordenada na seção `comunidade-escolar` (`tipo: "colecao"`) do editor da página `home`.
2. **Bloco "Quem Faz Acontecer na Ponta" na Metodologia da Home (`Methodology.tsx`, `#como-funciona`):**
   - Substitui os 3 cards fixos do array `educators` pelos 3 primeiros docentes publicados vinculados à seção `metodologia` (ou com `destaque_metodologia = true`), utilizando `nome`, iniciais, `rotulo_funcao` + `municipio_nome`, `disciplina` e `tag_territorial`.
3. **Destaque Territorial na página `/alunos` (`StudentStories.tsx`):**
   - Atualmente `StudentStories.tsx` usa `students[0]` como card panorâmico ("Destaque Territorial") e `students.slice(1)` para a grade. Com o contrato `N`, o registro marcado com `destaque_pagina = true` (único ativo por vez, ou o de menor `posicao` quando nenhum marcado) é retornado na primeira posição e identificado pelo campo booleano `destaque_pagina`, permitindo ao gestor escolher exatamente qual conquista abre a página `/alunos`.

#### 7.2.9 Proteção de dados pessoais e autorização de divulgação (LGPD e ECA)

Como o módulo **Alunos que Inspiram** divulga nome, história, escola, comunidade, município e fotografia de estudantes da rede pública — em sua maioria adolescentes do Ensino Médio (**menores de 18 anos**) e jovens de comunidades indígenas, ribeirinhas, quilombolas e rurais —, o módulo incorpora controles de privacidade por desenho (*Privacy by Design*) em conformidade com a **Lei nº 13.709/2018 (LGPD, especialmente Art. 14)** e a **Lei nº 8.069/1990 (ECA, Art. 17)**:

1. **Subentidade administrativa obrigatória `consentimento_lgpd`:**
   - `menor_de_idade` (`boolean`, obrigatório): indica se o titular é menor de 18 anos.
   - `nome_signatario` (`string`, obrigatório): nome completo do pai, mãe ou responsável legal (obrigatório quando `menor_de_idade = true`) ou do próprio estudante maior de idade.
   - `vinculo_signatario` (`enum`: `mae`, `pai`, `responsavel_legal`, `titular_maior`, obrigatório).
   - `documento_signatario_mascarado` (`string`, somente leitura no retorno comum, ex.: `"***.456.789-**"`): eventual CPF/RG informado na conferência administrativa é armazenado criptografado no backend e **nunca** retornado em texto aberto nas listagens nem em qualquer endpoint público.
   - `termo_lgpd_midia_id` (FK `Midia` privada, obrigatório para envio à revisão e publicação): digitalização do Termo de Autorização de Uso de Imagem, Voz e Nome assinado.
   - `escopo_autorizacao`: flags booleanas explícitas `autoriza_nome_relato` (obrigatório `true` para publicar), `autoriza_imagem_foto` (obrigatório `true` se `foto_midia_id` estiver presente) e `autoriza_exibicao_home` (controla se pode aparecer na capa do portal).
   - `data_assinatura` (`date`, obrigatória, não futura) e `validade_ate` (`date`, opcional; se vencida, o status LGPD passa para `expirado` e o registro não pode ser publicado ou é sinalizado para renovação).
   - `status_lgpd` (`enum` controlado pelo servidor: `pendente`, `verificado`, `expirado`, `revogado`).
2. **Trava de publicação no servidor (Publication Gate):**
   - `PATCH /api/v1/cms/historias_alunos/:id/publicar` exige que um gestor/administrador confirme a conferência do termo (`verificado_lgpd: true`), validando no banco que `termo_lgpd_midia_id` está `pronto`, `autoriza_nome_relato = true` e `status_lgpd = "verificado"`. Sem isso, o backend responde `422 consentimento_lgpd_invalido` e impede a publicação.
3. **Direito de revogação imediata (`PATCH /:id/revogar_consentimento`):**
   - Caso o estudante ou seu responsável legal solicite a retirada do conteúdo, qualquer usuário com permissão `revogar_consentimento` aciona o endpoint informando o motivo/protocolo. O Rails muda imediatamente o registro para `status = "despublicado"` e `status_lgpd = "revogado"`, bloqueia nova publicação, invalida o cache público da história e da foto associada (`GET /publico/cms/midias/:id/arquivo` passa a responder `404`) e grava o evento na auditoria.
4. **Minimização estrita no DTO público (`/publico/cms/historias_alunos`):**
   - O payload público **jamais** contém data de nascimento, CPF, matrícula escolar (RA/INEP), telefone, endereço residencial, nome do responsável legal, IDs ou URLs do termo de autorização (`termo_lgpd_midia_id`), nem nomes dos operadores internos. O selo público `"✓ Imagem autorizada (LGPD)"` é derivado apenas do booleano público `lgpd_verificado: true`.

### 7.3 Reaproveitamento e Evolução da Fila de Aprovação (`/admin/kanban`)

A auditoria de [src/app/admin/kanban/page.tsx](../src/app/admin/kanban/page.tsx), [EditorialKanban.tsx](../src/components/EditorialKanban.tsx) e [useEditorialNews.ts](../src/components/admin/useEditorialNews.ts) revelou o seguinte diagnóstico técnico:

1. **Acoplamento atual:**
   - `EditorialKanban.tsx` recebe `news: NewsItem[]`, `onApproveNews` e `onRejectNews`, filtrando itens em abas `Pendentes`, `Publicadas`, `Recusadas` e `Todas`, além de exibir a tabela `"Documentos e Anexos Auditados"` e a `"Timeline de Auditoria"`.
   - `useEditorialNews.ts` chama exclusivamente `medtecApi.noticias.list({ page: 'all' })`, `medtecApi.noticias.publicar(id)` e `medtecApi.noticias.reprovar(id, reason)`.
   - `src/types/index.ts` já prevê os tipos conceituais `EtapaEditorial` e `ItemEditorial`, indicando que a fila foi originalmente concebida para múltiplos domínios, embora a implementação atual esteja ligada somente a `NNoticia`.
2. **Compatibilidade e estratégia de reutilização:**
   - A estrutura visual de `EditorialKanban.tsx` (barra de busca, abas de status com contadores, cards com badge de tipo/categoria, resumo, responsável, indicador de anexo, modais de confirmação de aprovação e de recusa com motivo obrigatório, tabela de anexos e timeline de auditoria) é **100% compatível** com os novos módulos **Professores e Mediadores** e **Alunos que Inspiram**.
   - **Evolução planejada para `/admin/kanban` (após homologação dos contratos `N`):**
     - Adicionar um seletor de domínio no topo da Fila de Aprovação: **`Todas as Filas`**, **`Notícias` (`E`)**, **`Professores e Mediadores` (`N`)** e **`Alunos que Inspiram` (`N`)**.
     - Extrair uma interface comum `EditorialQueueItem` que adapta `NNoticia`, `CmsDocente` e `CmsHistoriaAluno` sem quebrar as props existentes de `EditorialKanban` para notícias.
     - Para itens do tipo **Alunos que Inspiram**, o modal de confirmação de aprovação em `EditorialKanban` exibirá um bloco adicional obrigatório: badge do `status_lgpd`, botão autenticado `"Visualizar Termo LGPD/ECA anexado"` e caixa de seleção `"Confirmo que verifiquei o Termo de Autorização de Imagem e Dados assinado pelo responsável legal (LGPD/ECA)"` antes de habilitar o botão `"Sim, aprovar e publicar"`.

#### 7.3.1 Resumo dos endpoints propostos (`N`) para os dois módulos

Os contratos detalhados de requisição, resposta, filtros e erros estão especificados nas seções 5.3, 9.2, 9.4, 11, 12.9, 12.10 e 13 de [CMS_CONTRATOS_BACKEND.md](CMS_CONTRATOS_BACKEND.md):

| Módulo | Endpoints Administrativos (autenticados Bearer + RBAC) | Endpoints Públicos (anônimos, somente publicados) |
|---|---|---|
| **Professores e Mediadores** (`CmsDocente`) | `GET /api/v1/cms/docentes`<br>`GET /api/v1/cms/docentes/:id`<br>`POST /api/v1/cms/docentes`<br>`PATCH /api/v1/cms/docentes/:id`<br>`DELETE /api/v1/cms/docentes/:id`<br>`GET /api/v1/cms/docentes/:id/preview`<br>`PATCH /api/v1/cms/docentes/:id/enviar_revisao`<br>`PATCH /api/v1/cms/docentes/:id/publicar`<br>`PATCH /api/v1/cms/docentes/:id/reprovar`<br>`PATCH /api/v1/cms/docentes/:id/despublicar` | `GET /api/v1/publico/cms/docentes`<br>`GET /api/v1/publico/cms/docentes/:slug` |
| **Alunos que Inspiram** (`CmsHistoriaAluno`) | `GET /api/v1/cms/historias_alunos`<br>`GET /api/v1/cms/historias_alunos/:id`<br>`POST /api/v1/cms/historias_alunos`<br>`PATCH /api/v1/cms/historias_alunos/:id`<br>`DELETE /api/v1/cms/historias_alunos/:id`<br>`GET /api/v1/cms/historias_alunos/:id/preview`<br>`GET /api/v1/cms/historias_alunos/:id/termo_autorizacao`<br>`PATCH /api/v1/cms/historias_alunos/:id/enviar_revisao`<br>`PATCH /api/v1/cms/historias_alunos/:id/publicar`<br>`PATCH /api/v1/cms/historias_alunos/:id/reprovar`<br>`PATCH /api/v1/cms/historias_alunos/:id/despublicar`<br>`PATCH /api/v1/cms/historias_alunos/:id/revogar_consentimento` | `GET /api/v1/publico/cms/historias_alunos`<br>`GET /api/v1/publico/cms/historias_alunos/:slug` |

## 8. Plano incremental do frontend

**O editor em memória dos Quatro Pilares da Home (Fase 1 parcial) já foi implementado em `/admin/institucional`. As demais fases abaixo aguardam autorização explícita e/ou homologação dos contratos Rails.**

| Fase | Escopo e reutilização | Pode ser preparado após autorização, sem backend novo | Depende de Rails / critério de conclusão |
|---|---|---|---|
| 0 — Aceite contratual | Validar taxonomia, fontes, versionamento, permissões, política LGPD/ECA e plano de migração | Revisão destes documentos, matriz conteúdo→campo e composição de templates | Equipe Rails aceita/versiona contratos e informa ambiente, release e evidências de homologação. |
| 1 — Quatro pilares da Home | Tela 1; editor reutilizável de seções/cards (`HomePillarsModule.tsx` concluído em memória); `AdminShell`, navegação e prévia | Concluído em memória em `/admin/institucional`; salvar/publicar permanecem bloqueados até backend | CRUD da página, prévia administrativa e publicação N; integrar a seção pública `TechAdvantages` somente quando o endpoint estiver ativo. |
| 2 — Matrizes e referências | Telas 2–3; P06–P12; catálogos relacionados | Formulários e templates de prévia sem dados oficiais fictícios | Matrizes, áreas, componentes e documentos N; seed validado pela equipe pedagógica; duas abas públicas usam contratos e ordenação reais. |
| 3 — Hero e demais blocos | H01–H15, Tela 4; evoluir Institucional e Banners | UI de seleção de indicadores/mídia e prévia de tipos já aprovados | Indicadores, banners e páginas N; substituir números repetidos; publicar dossiê/metodologia e cabeçalhos sem divergências. |
| 4 — Reaproveitar integrações | Canais, galeria pública, notícias, avisos e FAQ | Adaptadores e testes de componentes isolados conforme contratos | Homologar D; endpoints públicos de canais/galeria e extensões de foto N; retirar defaults que reexibam registros ocultos. |
| 5 — Comunidade Escolar e Projetos | Módulos `/admin/professores`, `/admin/alunos`, evolução de `/admin/kanban` e integração de `ProjectsModule`; depois escolas e transparência | Estruturas visuais de formulário, prévia fiel dos cards/gavetas/modais e checklist LGPD sem persistência falsa | Recursos N (`/cms/docentes`, `/cms/historias_alunos`, `/cms/projetos`), armazenamento privado de termos LGPD/ECA e fila editorial multi-entidade; páginas `/professores`, `/alunos` e Home (`#como-funciona`, `#comunidade-escolar`) passam a consumir a API Rails. |
| 6 — Revisão de cobertura | SEO, aliases/canonical, navegação, sitemap e retirada planejada de legados | Auditoria cruzada dos pontos de consumo | Confirmar que cada conteúdo editorial tem uma fonte Rails única; despublicação ou revogação LGPD retira conteúdo e mídia imediatamente; sem regressões nas rotas atuais. |

Para cada fase integrada: testar carregamento/vazio/erro, 401/403, validação 422, conflito concorrente, submissão para revisão, aprovação/reprovação, publicação/despublicação, revogação de consentimento LGPD, ordem após recarga, expiração de sessão e ausência de rascunhos ou dados sensíveis no público. Conferir desktop/mobile, teclado, leitor de tela e textos longos. Usar testes de contrato para adaptadores e fluxos críticos, sem mocks de produção. Não instalar dependências para esta etapa de documentação.

## 9. Decisões que precisam de aceite antes da implementação

1. Homologação efetiva dos endpoints D e inventário do que já está implantado no Rails; não substituir rotas só porque ainda não foram testadas aqui.
2. Taxonomia oficial de áreas, componentes, eixos, séries, horas e vigência; fontes para os números e alegações técnicas. Definir quem aprova a carga inicial.
3. Publicação por agregado com rascunho separado, fluxo de revisão (`rascunho` → `em_revisao` → `publicado`/`reprovado`/`despublicado`), política de referências e concorrência, conforme proposta de backend. Agendamento genérico não faz parte da primeira entrega.
4. Permissões por ação (`permissoes_efetivas` em `/auth/me`), incluindo `cms_docentes`, `cms_historias_alunos` e a permissão restrita `gerenciar_consentimento_lgpd`.
5. Armazenamento Rails de imagens/PDFs, segregação estrita de bucket/entrega privada para termos de autorização LGPD/ECA (`termo_lgpd_midia_id`), política de retenção jurídica e invalidação imediata de cache/CDN ao despublicar ou revogar consentimento.
6. Uso real dos banners no Hero atual, tratamento de aliases públicos e eventual revisão de navegação. Não presumir carrossel da Home porque o painel menciona “imagens que passam”.

## 10. Validação e preservação desta entrega

Auditoria concluída antes da atualização dos documentos; a disponibilidade em ambiente Rails permanece não verificada. Nesta etapa de expansão para **Professores e Mediadores** e **Alunos que Inspiram**, somente este arquivo (`docs/CMS_MAPEAMENTO_CONTEUDOS.md`) e `docs/CMS_CONTRATOS_BACKEND.md` foram atualizados, preservando integralmente o código-fonte existente na árvore de trabalho.
