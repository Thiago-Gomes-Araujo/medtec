# MEDTEC — Etapa 6C: subrota de Notícias

## Auditoria e escopo

Checkout confirmado: `/home/lennon/medtec-web`, remoto MEDTEC em
`git.seduc.ro.gov.br/medtec/medtec-web.git`, branch
`feature/integracao-rotas-noticias` (o nome armazenado contém crases literais).
Nenhum outro checkout foi editado. Não houve commit.

Na abertura já existiam alterações locais em `admin/page.tsx`, `AdminShell.tsx`
e `NewsModule.tsx`, além de `admin/noticias/` não rastreado. Essas alterações
foram preservadas e completadas. Portanto, o diff total inclui trabalho anterior
a esta sessão. O HEAD possui 4.131 linhas na página principal; o arquivo local
inicial tinha 4.091; o resultado tem **4.089 linhas**.

Foram inspecionados a página principal, NewsModule, AdminShell, EditorialKanban,
as cinco subrotas existentes, serviços/tipos/cliente HTTP e as seções de notícias
e permissões de `ROTAS_FRONT.md` e `docs/ROTAS_FRONT_FULL.md`. Foram consultados
os guias locais do Next.js sobre navegação, search params e preservação de estado
com Activity, além das skills medtec-architecture e impeccable. O utilitário de
contexto de impeccable não estava instalado; não foram encontrados PRODUCT.md
ou DESIGN.md no projeto.

## Arquivos e responsabilidades

| Arquivo | Resultado |
| --- | --- |
| `src/app/admin/noticias/page.tsx` | Nova rota cliente; AdminShell envolve NewsContent, com Suspense para os parâmetros da URL. Orquestra dados oficiais, permissões, publicação/despublicação e modal de prévia. |
| `src/components/admin/NewsModule.tsx` | Reutiliza o CRUD e a interface existentes. Recebe permissões por ação e valores iniciais do editor; mantém formulário, arquivo de capa, categoria, edição e filtro internos. Diferencia carregamento, erro e vazio válido. |
| `src/components/admin/AdminShell.tsx` | Link oficial de notícias; disponibiliza sua sessão validada por função em children, evitando outra chamada a /auth/me. Inclui Gestor no menu de notícias. A rota de notícias realiza as verificações de ações e a API autoriza as requisições. Sidebar e topbar permanecem únicas. |
| `src/app/admin/page.tsx` | Remove montagem, referência imperativa, modo de tela, categorias exclusivas e toggle de publicação antigos. Atualiza atalhos e compatibilidade legada. Mantém leitura oficial para KPIs/Kanban. |
| `src/components/EditorialKanban.tsx` | Duas correções de expressão: uma coleção recebida como `[]` é válida e não dispara busca interna nem reutiliza coleção anterior. Sem alteração visual ou migração. |
| `docs/ETAPA_6C_RELATORIO.md` | Relatório e checklist manual. |

## Orquestração, integração e sincronização

A subrota possui notícias, categorias, carregamento, erro, permissões e prévia.
O modo de tela deriva da URL. O handler de publicação/despublicação passa para
ela; salvar/excluir e todos os payloads JSON/FormData continuam no NewsModule.
O AdminShell fornece a sessão já consultada, sem provider global.

Serviços existentes e contratos preservados:

- `GET /n_noticias?page=all` e `GET /n_categorias_noticia` com categorias ativas;
  listagens validam `success` e `data.items`, inclusive `items: []`.
- `POST /n_noticias`, `PATCH /n_noticias/:id`, `DELETE /n_noticias/:id`;
  objetos diretos e exclusão 204 tratados pelo cliente existente.
- `PATCH /n_noticias/:id/publicar` e `/despublicar`, sem corpo inventado.
- Reprovação continua no Kanban via `/reprovar`, com motivo obrigatório.
- Autor e status inicial continuam definidos pelo Rails. Não se envia autor ou
  status para criar/editar. Retorno de reprovada para aguardando e agendamento
  por data futura permanecem comportamentos do contrato Rails.

Cada mutação concluída recarrega notícias e categorias da API. A página principal
preserva `apiNews`, adaptação para NewsItem, carregamento/erro, handlers de aprovar
e reprovar e indicadores. Não necessita mais consultar categorias. A contagem de
pendentes continua filtrando exclusivamente `status === 'aguardando'`.
O carregamento existente da página principal relê a API ao montar e ao reativar
os efeitos preservados por Activity. O Kanban usa a coleção oficial do painel,
inclusive quando vazia. Não se criou cache permanente nem segunda persistência.

A subrota não carrega outros módulos ou `/api/data`. Não foram introduzidos
persistData, mocks, fallback JSON ou armazenamento de notícias em localStorage.
Não foram alterados backend, proxy, auth.ts, cookies ou contratos de login/logout.

## Navegação e permissões

- Sidebar e atalhos de listagem: `/admin/noticias`.
- Nova notícia: `/admin/noticias?action=new`.
- Edição: `/admin/noticias?edit=<id>`; permite reconstruir o editor após F5.
- Modos antigos `mode=editor`, `mode=new` e `mode=nova` abrem criação.
- `/admin?tab=noticias` e `/admin?section=noticias` usam replace para a nova
  rota, preservando a intenção explícita de criação e evitando entrada legada
  adicional no histórico. Apenas destinos fixos são construídos.
- Search params determinam o modo em navegações e Voltar/Avançar; inicialização
  do editor não depende mais de temporizador ou referência imperativa.

Criar, editar, excluir, publicar e despublicar possuem verificações independentes.
Quando disponível, `usuarios.getPermissoesExtras` fornece as permissões efetivas
por `do_perfil || extra`, identificando o módulo Noticias/NNoticias normalizado.
Uma matriz válida substitui os padrões de perfil; módulo ausente não concede ações.
Se a consulta administrativa recebe 403, a interface usa os padrões documentados
do perfil atual de `/auth/me`: Administrador possui as ações editoriais; Gestor
possui CRUD. Falhas diferentes de 403 não concedem ações. Sessão apenas local não
concede mutações Rails. Cada operação continua sujeita à autorização do backend,
com erros apresentados e sucesso somente após resposta bem-sucedida.

**Divergência de perfis preexistente:** o menu antigo conhece “Editor de Notícias”,
“Operador de Conteúdo” e heurísticas por IDs. O contrato Rails descreve
Administrador/Gestor e nega Jornalista. A nova rota não usa `isGestor`, ID do
usuário ou ID de perfil para conceder publicação. A revisão geral dos perfis e
das heurísticas do Kanban/painel permanece fora desta etapa.

O estado vazio aparece somente na listagem após sucesso sem registros:
“Nenhuma notícia cadastrada no momento.” Sua ação de criação só aparece com
permissão. Carregamento e falha usam mensagens próprias; erro não vira vazio válido.

## Validação executada

| Comando | Resultado |
| --- | --- |
| `npx tsc --noEmit` | Passou, inclusive após os ajustes finais. |
| `npm test` | 39 testes passaram, 10 suítes, nenhuma falha. A primeira tentativa falhou em DNS ao obter tsx; a execução com acesso ampliado passou. São testes unitários existentes do cliente/serviços, não testes funcionais da tela. |
| `npm run lint` | 12 erros e 49 avisos preexistentes, total compatível com a etapa 6B. A abertura desta sessão tinha 13 erros e 50 avisos; o erro e aviso adicionais da rota em andamento foram eliminados. Sem novo erro de lint da rota. |
| `git diff --check` | Passou. |
| `npm run build` | Falhou por restrição do ambiente: Turbopack não conseguiu abrir porta local ao processar CSS (`Operation not permitted`). Repetição com execução ampliada apresentou a mesma limitação. |
| `npm run build -- --webpack` | Passou com execução ampliada. Confirmou `/admin/noticias`, `/admin/avisos`, `/admin/galeria`, `/admin/redes`, `/admin/institucional` e `/admin/estados-cidades`. Não se alterou a configuração de compilação. |
| `wc -l src/app/admin/page.tsx` | 4.089 linhas. Redução de 42 frente ao HEAD da etapa 6B. |
| `git diff --stat` e `git status --short` | Executados; alterações locais mantidas, rota e relatório novos sem commit. O diff --stat padrão não inclui arquivos não rastreados. |

O build alternativo registrou falhas de conexão nas leituras de páginas públicas
preexistentes (avisos/acervo/galeria/redes), mas concluiu a geração. Houve também
aviso de lockfile externo ao repositório. Não houve login automatizado, exposição
de credenciais ou mutações reais para teste.

## Pendências e checklist manual

Não foram executados testes funcionais autenticados, inspeção visual no navegador
ou testes em dispositivo real. As confirmações abaixo dependem da validação manual:

- [ ] Abrir `/admin/noticias` diretamente, atualizar com F5 e conferir sessão.
- [ ] Conferir sidebar selecionada, grupo Publicações do Site expandido, topbar
  e breadcrumbs, sem duplicação, em desktop e mobile.
- [ ] Testar os dois links legados e seus modos de criação, sem loops.
- [ ] Acionar Nova Notícia na Visão Geral; testar Voltar/Avançar entre lista,
  criação e edição, inclusive F5 no link de edição.
- [ ] Validar matriz real de permissões e nome do módulo retornado pela API;
  conferir Administrador, Gestor e usuário sem permissão, incluindo extras.
- [ ] Confirmar estado vazio com sucesso, carregamento, API indisponível e 401/403.
- [ ] Validar filtros, categorias, prévia, capa por arquivo e por URL e erros 422.
- [ ] Em ambiente apropriado, cadastrar notícia aguardando; editar reprovada e
  conferir retorno à fila; publicar/despublicar; reprovar com motivo obrigatório.
- [ ] Validar notícia com data futura conforme regra de agendamento do Rails.
- [ ] Após cada operação, retornar ao painel/Kanban e conferir dados e pendentes;
  testar exclusão da última notícia para confirmar vazio sem coleção anterior.
- [ ] Conferir navegação das cinco subrotas anteriores.
- [ ] Executar novamente o build padrão em ambiente que permita o processo/porta
  necessários ao Turbopack.

As mutações do checklist não foram executadas pelo agente. Etapa 6C entregue para
validação; nenhuma migração adicional foi iniciada.
