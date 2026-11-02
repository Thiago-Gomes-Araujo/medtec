# Projetos Pedagógicos: mapeamento do front para a API

Contrato: [ROTAS_PROJETOS.md](ROTAS_PROJETOS.md). Regra de escopo: o que o front tem e a API não tem sai do painel e do site, e o que a API tem e o front não tem é implementado.

**Ação:** `manter` usa o campo com o nome da API, `remover` tira o campo e `criar` adiciona o que não existia.

## Projeto no painel

| Campo do front (`ProjectMission`) | Campo da API | Ação |
|---|---|---|
| `id` (texto) | `id` (número) | manter |
| `title` | `titulo` | manter |
| `track` (lista fixa no código) | `pj_tema_id`, `tema_nome` | manter, com temas vindos da API |
| `school` (texto livre) | `escola_id`, `escola_nome` | manter, com select de `GET /escolas` |
| `municipality` (texto livre) | `cidade_nome`, somente leitura | manter; a cidade vem da escola e o select só filtra escolas |
| `image` | `imagem` (arquivo) ou `imagem_url` (link) | manter |
| `desafioLocal`, `praticaMedtec`, `impactoGerado` | `relato` | remover os três; o texto do projeto é só `relato` |
| `number`, `missionCode` | sem campo | remover |
| `shortTitle` | sem campo | remover |
| `territory`, `typology` | sem campo | remover |
| `mediatorName`, `mediatorRole`, `mediatorInitials` | `membros[].nome`, `membros[].funcao` | remover; docentes passam a ser membros |
| `studentCohort` | sem campo | remover |
| `seal` | sem campo | remover |
| `initialApplause` | sem campo | remover |
| `competencias` | sem campo | remover |
| `quote` | sem campo | remover |
| `replicationGuide` (materiais, cronograma, dica) | sem campo | remover |
| sem campo | `anexos[]` | criar, com envio múltiplo e remoção por rota própria |
| sem campo | `pj_projeto_membros_attributes`, `membros[]` | criar, com edição por diferença |
| sem campo | `status`, `status_nome` | criar, com filtro e moderação |
| sem campo | `autor_nome`, `avaliado_por_nome` | criar, na listagem do painel |

## Telas e dados do painel

| Item do front | Na API | Ação |
|---|---|---|
| `ProjectsModule` (editor bloqueado, "Aguardando Endpoint da API") | `POST` e `PATCH /pj_projetos` | remover e substituir por `ProjetosPanel` |
| "Simulação no Portal Público" (prévia ao vivo) | sem campo | remover |
| "Cronograma de replicação" e `defaultProjectTimeline` | sem campo | remover |
| Upload de capa em `/api/upload` | `pj_projeto[imagem]` em multipart | remover a chamada; a capa vai direto para a API |
| Leitura em `/api/data` (`readAdminProjects`) | `GET /pj_projetos` | remover |
| Busca local por título, escola, município e docente | `q[titulo_cont]`, `q[escola_id_eq]`, `q[escola_g_cidade_id_eq]`, `q[pj_membros_id_eq]` | manter, com filtros da API |
| Filtro local de trilhas | `q[pj_tema_id_eq]` | manter, com filtro da API |
| sem tela | `q[n_status_noticia_slug_eq]` | criar |
| sem tela | `publicar`, `reprovar`, `despublicar` | criar, na lista e na Fila de Aprovação |
| sem tela | CRUD `/pj_temas` | criar `/admin/projetos/temas` |
| sem tela | CRUD `/pj_membros`, `q[nome_cont]`, `q[cpf_eq]` | criar `/admin/projetos/membros` |
| Indicador "Indisponível — sem integração oficial" no Início | `GET /pj_projetos` | manter, com totais da API |

## Site

| Item do front | Na API | Ação |
|---|---|---|
| `ProjectsInteractiveStage` | `GET /publico/pj_projetos` | remover e substituir por `ProjetosView` |
| `ReplicationPassportModal` ("Roteiro Pedagógico") | sem campo | remover e substituir por `/projetos/[id]` |
| `/api/projects` (lista vazia) | `GET /publico/pj_projetos` | remover |
| Trilhas fixas no código | `GET /publico/pj_temas`, filtro `tema` | manter, com temas da API |
| Selo "52 Municípios Atendidos" na lista | sem campo | remover |
| Lâminas da home: `typology`, `territory`, `number`, `shortTitle`, `quote`, `mediatorName` | sem campo | remover |
| Lâminas da home: `title`, `image`, `school`, `municipality` | `titulo`, `imagem`/`imagem_url`, `escola_nome`, `cidade_nome` | manter |
| Lâminas da home: orientação pedagógica | `relato` | manter, usando `relato` |
| sem tela | `GET /publico/pj_projetos/:id` | criar `/projetos/[id]` |
| sem tela | `membros[].nome`, `membros[].funcao` | criar na página do projeto |
| sem tela | `anexos[]` | criar para download na página do projeto |
| sem filtro | `busca` | criar |
| sem filtro | `cidade` | criar; veja a limitação abaixo |

## Mocks e dados locais

| Item | Ação |
|---|---|
| `ProjectMission` e `ReplicationWeek` em `src/types/index.ts` | remover |
| `projects` em `DatabaseSchema`, `src/lib/db.ts`, `db.json` e `initialData.json` | remover |
| Validação e limpeza de `projects` em `/api/data` | remover |
| Chamada a `/api/upload` feita pelo módulo de projetos | remover |

## Limitações do contrato

- **Filtro `cidade` no site:** a API pede o id, mas o objeto público traz só `cidade_nome` e `GET /g_cidades` exige login. Como em `/alunos`, as opções e o recorte usam `cidade_nome` da própria lista. Os filtros `tema` e `busca` vão para a API.
- **Capa enviada por arquivo:** não há rota para removê-la. O painel pode trocá-la por outro arquivo ou por um link.
- **Publicação:** `Gestor` e `Administrador` criam o projeto já publicado, então a criação feita por eles não passa pela Fila.
