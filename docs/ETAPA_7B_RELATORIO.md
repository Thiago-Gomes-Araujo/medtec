# MEDTEC — Etapa 7B: subrota do Kanban Editorial

## Auditoria e escopo

Projeto confirmado em `/home/lennon/medtec-web`, remoto
`https://git.seduc.ro.gov.br/medtec/medtec-web.git`, branch
`feature/integracao-rotas-noticias` (com crases literais no nome armazenado).
A árvore Git estava limpa na abertura. A página principal tinha 4.023 linhas.
Nenhum outro checkout foi utilizado, nenhuma alteração local foi descartada e
nenhum commit foi feito.

Foram inspecionados a página principal, EditorialKanban, useEditorialNews,
AdminShell, as seis subrotas existentes, serviços Rails e os contratos em
`ROTAS_FRONT.md` e `docs/ROTAS_FRONT_FULL.md`. Aplicada a skill medtec-architecture
e consultados os guias locais do Next.js sobre useRouter e preservação de estado
com Activity.

## Arquivos criados e modificados

| Arquivo | Alteração |
| --- | --- |
| `src/app/admin/kanban/page.tsx` — criado | Página cliente de 44 linhas. Usa o shell e monta a orquestração do Kanban apenas após autorização. |
| `src/components/admin/AdminShell.tsx` — modificado | Destino do item Kanban passa a `/admin/kanban`; guarda visual exige Administrador retornado pela API Rails, como na etapa 7A. |
| `src/app/admin/page.tsx` — modificado | Remove a montagem antiga, import e callbacks editoriais não utilizados. Atualiza navegação/atalho e redireciona acessos legados, preservando leitura e indicadores. |
| `docs/ETAPA_7B_RELATORIO.md` — criado | Relatório, resultados e checklist manual. |

EditorialKanban e useEditorialNews permanecem sem alterações. Também permanecem
intactos os arquivos das seis subrotas anteriores, os serviços Rails, configurações
globais, Projetos, FAQ, Banners e Usuários.

## Estrutura e reutilização

```text
/admin/kanban/page.tsx
└── AdminShell activeSection="kanban"
    ├── sessão e autorização existentes
    ├── sidebar, topbar e breadcrumbs existentes
    └── KanbanContent — montado somente quando autorizado
        ├── useEditorialNews
        └── EditorialKanban
```

A função interna KanbanContent apenas conecta o hook à interface. Não copia sua
implementação. O hook recebe permissões explícitas de aprovação e reprovação;
fornece a coleção adaptada, carregamento, erro, reload e os dois callbacks.
A página chama reload na montagem autorizada e na reativação dos efeitos ao
retornar à rota. A inicialização é adiada por uma microtarefa e verifica se o
componente continua ativo, evitando uma busca iniciada por um efeito já limpo.

A lista, busca, filtros, indicadores, modais, motivo obrigatório, feedback e
responsividade são os mesmos do EditorialKanban da etapa 7A. Não houve alteração
de cartões, layout, arrastar e soltar ou fluxo editorial. Existe uma única sidebar
e uma única topbar, fornecidas pelo AdminShell. O activeSection existente seleciona
Fila de Aprovação e expande Aprovação e Revisão; títulos e breadcrumbs usam sua
configuração atual. O menu existente permite abrir Notícias e voltar ao painel.

## Estados e callbacks

A montagem do Kanban e a conexão com approveNews/rejectNews saíram da página
principal e passaram à subrota. Seus estados de interface continuam internos ao
EditorialKanban; dados, adaptação e mutações continuam no hook existente.

O dashboard preserva useEditorialNews para leitura dos KPIs, agora sem conceder
permissões de mutação e sem consumir os callbacks editoriais. apiNews,
effectiveNews, loadingNews, errorNews e reload continuam disponíveis aos usos
existentes. A guarda editorial do dashboard continua necessária para sidebar e
atalho, portanto não foi removida. Nenhuma refatoração geral da Visão Geral foi feita.

## Integração Rails, autorização e sincronização

Contratos confirmados nos serviços e nos dois documentos de rotas:

- `GET /n_noticias?page=all`: envelope com success e data.items.
- `PATCH /n_noticias/:id/publicar`: sem corpo, resposta com objeto da notícia.
- `PATCH /n_noticias/:id/reprovar`: corpo `{ motivo: texto.trim() }`, resposta com
  objeto da notícia; motivo obrigatório, inclusive na validação do serviço.

O hook continua aguardando a confirmação da mutação antes de reler a coleção.
Não há atualização otimista com dados inventados. Erros, carregamento, vazio
válido (`[]`) e registros continuam distintos. Não foram introduzidos persistData,
API de persistência local, db.json, mocks, dados de negócio em localStorage ou
mensagens de sucesso sem confirmação Rails.

O AdminShell só monta o conteúdo quando a sessão validada por `/auth/me` possui
perfil Administrador e satisfaz a guarda administrativa existente. isGestor
isolado, IDs ou autorização para editar notícias não concedem acesso. O fallback
de sessão local não fornece apiUser e não autoriza esse módulo. Durante a validação
de sessão o shell mostra seu carregamento; sem autorização, mostra Acesso Restrito.

Como KanbanContent é um filho montado condicionalmente pelo shell, seu hook e seu
efeito de leitura não executam antes dessa autorização. Há também verificação
defensiva da mesma condição no início da leitura e nas permissões passadas ao hook.
Os endpoints Rails continuam validando a autorização final de cada operação.
Não foram modificados proxy.ts, auth.ts, cookies, login/logout ou o cliente HTTP.

A subrota carrega somente notícias, além da verificação de sessão do shell.
Não carrega categorias, galeria, avisos, geografia, projetos, FAQ, banners ou
usuários; não consulta `/api/data`.

Notícias e Kanban continuam lendo a mesma API oficial. Uma decisão bem-sucedida
recarrega o Kanban pelo hook. A próxima leitura de `/admin/noticias` e do dashboard
consulta o estado oficial novamente. O fluxo existente de reativação de efeitos
com Activity foi preservado. A contagem pendente da Visão Geral continua filtrando
exclusivamente `status === 'aguardando'`, sem incluir reprovadas. Não há coleção
permanente nem provider global compartilhado entre páginas.

## Navegação legada

Sidebar do shell, seleção da sidebar antiga do dashboard e atalho da Visão Geral
agora navegam para `/admin/kanban`. Os acessos `/admin?tab=kanban` e
`/admin?section=kanban` usam router.replace com destino fixo. O carregamento antigo
retorna antes de consultar a sessão e os demais módulos nesses acessos, deixando
a verificação para a nova rota. A nova página não redireciona de volta ao link
legado, evitando um ciclo. O histórico dos acessos normais usa a navegação de rotas
do Next.js. Notícias mantém seu destino `/admin/noticias` e seu comportamento.

## Validações executadas

| Comando | Resultado |
| --- | --- |
| `npx tsc --noEmit` | Passou. O build complementar também concluiu sua etapa TypeScript. |
| `npm test` | 42 testes passaram em 11 suítes, sem falhas. A primeira tentativa restrita falhou em DNS ao obter tsx; a execução ampliada passou. |
| `npm run lint` | 12 erros e 49 avisos, iguais à execução inicial desta sessão. Sem regressões novas. |
| ESLint da nova página | Passou sem erros ou avisos. |
| `git diff --check` | Passou. |
| `npm run build` | Falhou ao processar CSS no Turbopack: criação de processo/abertura de porta local negada, `Operation not permitted`. A repetição ampliada apresentou a mesma restrição. |
| `npm run build -- --webpack` | Passou com execução ampliada. A saída inclui `/admin/kanban` e as seis rotas `/admin/noticias`, `/admin/avisos`, `/admin/galeria`, `/admin/redes`, `/admin/institucional`, `/admin/estados-cidades`. |
| `wc -l src/app/admin/page.tsx` | 4.013 linhas; antes 4.023, redução de 10 linhas. |
| `git diff --stat` e `git status --short` | Executados. Dois arquivos existentes modificados, nova rota e relatório não rastreados; sem commit. O stat padrão não inclui arquivos não rastreados. |

O build complementar registrou falhas de rede em leituras de páginas públicas
preexistentes e aviso de lockfile externo, mas terminou com código zero. Nenhuma
configuração global foi alterada para contornar essas condições.

## Riscos, pendências e checklist manual

Não foram realizados testes funcionais autenticados ou inspeção visual no navegador
nesta etapa. Os testes automatizados existentes cobrem cliente/serviços e estados
renderizados do Kanban; não substituem o exercício da nova navegação. Não houve
aprovação/reprovação real, login automatizado ou exposição de credenciais.

O build padrão precisa ser confirmado em ambiente que permita a porta/processo
do Turbopack. A guarda segue o Administrador documentado e validado na etapa 7A;
não expande acesso para perfis com edição ou eventuais concessões extras. O histórico
de auditoria da interface continua sendo histórico da sessão, conforme o componente
existente. Se uma mutação confirmar e a leitura seguinte falhar, o erro de leitura
continua sendo apresentado, sem tratar a coleção como vazia.

- [ ] Abrir `/admin/kanban` diretamente com Administrador Rails.
- [ ] Atualizar com F5 e conferir sessão e carregamento da fila.
- [ ] Conferir sidebar selecionada, Aprovação e Revisão expandido, topbar e breadcrumbs.
- [ ] Verificar Acesso Restrito para Gestor, editor e sessão somente local; no painel
  de rede, confirmar ausência de GET /n_noticias e outras consultas administrativas
  da subrota antes da autorização.
- [ ] Validar fila vazia legítima, carregamento, registros e erros 401/403/rede.
- [ ] Testar busca por título/autor/categoria e filtros por situação.
- [ ] Conferir modais de aprovação/reprovação e a exigência de motivo; sem executar
  decisões reais apenas para testar a migração.
- [ ] Navegar pela sidebar para `/admin/noticias` e conferir seu funcionamento.
- [ ] Navegar para `/admin` e conferir KPIs e contagem somente de aguardando.
- [ ] Testar Voltar e Avançar entre painel, Kanban e Notícias.
- [ ] Testar `/admin?tab=kanban` e `/admin?section=kanban`, sem loops ou carregamento
  dos outros módulos antes do redirecionamento.
- [ ] Conferir responsividade desktop/mobile, menu e modais.
- [ ] Conferir as seis subrotas anteriores e a ausência de alterações nas demais seções.

Etapa 7B entregue para validação; nenhuma migração adicional foi iniciada.
