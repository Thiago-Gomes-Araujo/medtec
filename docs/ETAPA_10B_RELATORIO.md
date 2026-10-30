# Etapa 10B — Subrota administrativa de Projetos

## 1. Diagnóstico inicial

Projeto confirmado por `pwd`: `/home/lennon/medtec-web`. O comando
`git status --short --branch` mostrou a branch `feature/integracao-rotas-noticias`
com árvore limpa, sem alterações locais pendentes. A página principal tinha
**2.256 linhas**. Não houve descarte ou commit nesta etapa.

Foram consultados `AGENTS.md`, a skill `medtec-architecture`, o relatório 10A,
`ProjectsModule`, a página principal, `AdminShell`, as nove subrotas existentes,
handlers de dados/upload, serviços e contratos `ROTAS_FRONT.md` e
`docs/ROTAS_FRONT_FULL.md`. Foram lidos os guias locais do Next.js instalado
sobre páginas, Client Components, `useSearchParams`, Suspense e preservação
de estado/`bfcacheId`.

O módulo recebia `projects`, `viewMode`, `onViewModeChange` e uma referência
opcional com `newProject()`. Rascunho, filtros, prévia e upload já eram internos.
O pai mantinha modo, referência, leitura `data.projects` e um contêiner oculto
para preservar o componente entre seções. Existiam dois atalhos de lista e
dois de Novo Projeto na Visão Geral. O identificador real é `projetos`.

A leitura ainda era GET `/api/data`, sem contrato Rails de Projetos. A gravação
dos dados estava bloqueada. A capa usava POST local `/api/upload`, iniciado
imediatamente pela seleção do arquivo. O diagnóstico, os limites dos rascunhos
e esse cuidado de upload foram apresentados antes de editar.

## 2. Arquivos criados e modificados

| Arquivo | Mudança na 10B |
| --- | --- |
| `src/app/admin/projetos/page.tsx` — criado | Shell autorizado, leitura própria, estados de carregamento/erro, modo e comando Novo, composição do módulo. |
| `src/lib/admin-projects.ts` — criado | Leitura GET da coleção legada e resolução dos links legados da funcionalidade. |
| `src/components/admin/AdminShell.tsx` — modificado | Destino de Projetos passa a `/admin/projetos`. |
| `src/app/admin/page.tsx` — modificado | Remove montagem/estado/referência antigos; atualiza seleção, atalhos e compatibilidade. |
| `tests/api-client.test.ts` — modificado | Seis testes de montagem, navegação e leitura/falhas. |
| `docs/ETAPA_10B_RELATORIO.md` — criado | Diagnóstico, implementação, resultados, riscos e checklist. |

`ProjectsModule.tsx` e o handler de upload permaneceram integralmente inalterados.
A comparação de hashes de todos os arquivos existentes em `src` apontou somente
mudanças de `admin/page.tsx` e `AdminShell.tsx`, além dos arquivos novos. As nove
subrotas anteriores, FAQ, Notícias, Kanban, Usuários, Banners e autenticação
não foram modificados.

## 3. Estrutura da nova rota

```text
/admin/projetos
  AdminShell(activeSection="projetos")
    sessão e autorização existentes
      Suspense para parâmetros da URL
        ProjectsContent
          readAdminProjects() → GET /api/data → projects
          carregamento, erro e nova tentativa
          modo lista/editor e referência próprios
          ProjectsModule
```

O filho funcional do shell só monta após a autorização da seção. A nova página
não importa `admin/page.tsx` ou depende de seus estados/callbacks. Existe um
único shell com Sidebar, Topbar, breadcrumbs, agrupamento e layout existentes.

O controle lista/editor pertence à rota. `/admin/projetos` abre a lista em uma
nova entrada, enquanto `?action=new` chama o handler existente `newProject()`
após a carga dos dados, preservando número/código sugeridos e valores iniciais.
O comando é aplicado uma vez por entrada/ação, usando uma referência local e o
identificador de entrada do App Router instalado. Recargas da leitura não
reaplicam Novo sobre o rascunho atual. Não há estado global ou nova regra de
formulário.

## 4. Dependências removidas da página principal

Saíram o import de `ProjectsModule` e seus tipos, o import exclusivo de `useRef`,
o estado `projectViewMode`, a referência `projectsModuleRef`, seus comandos nos
atalhos e a montagem oculta antiga. A página principal não monta mais o editor
de Projetos.

Os KPIs continuam usando `data.projects`: total, municípios distintos e resumo
do primeiro registro. Os indicadores oficiais Rails dos outros módulos foram
preservados. `loadData()` da Visão Geral permanece para seus dados; acessos
legados de Projetos retornam antes das consultas globais e são encaminhados
para a nova rota.

## 5. Fonte real dos dados

`readAdminProjects` faz um único GET `/api/data`, com cache desabilitado e
cancelamento por `AbortSignal`. Extrai somente a coleção `projects` para o
estado da nova página. Não consulta `/api/projects` como fallback.

Essa dependência legada foi preservada intencionalmente. O handler de
`/api/data` lê `getDatabase()` e pode consultar usuários Rails para gestores;
a resposta contém outros campos. A rota não depende da carga da Visão Geral,
mas o endpoint continua sendo uma leitura administrativa mais ampla. Nenhum
handler ou arquivo de dados foi alterado para criar uma nova fonte.

HTTP inválido, rede, JSON inválido ou coleção ausente/inválida produzem erro
explícito com nova tentativa. `null` representa ausência de leitura válida;
`[]` é uma resposta vazia legítima. Uma falha posterior mantém a última coleção
válida com aviso, sem converter erro em sucesso vazio.

Os registros continuam utilizando `ProjectMission`. Foi validado o envelope
e a coleção, sem uma migração/saneamento novo de cada registro legado.

## 6. Situação da API Rails

Não há endpoints oficiais de Projetos nos contratos e serviços atuais.
O GET público `/api/projects` continua retornando lista vazia de compatibilidade
e 404 para consulta por ID. Não foi usado para substituir a coleção administrativa.

Cadastro/edição continuam limitados ao rascunho e à prévia. O envio permanece
desabilitado e exclusão apenas informa o bloqueio. Não foram adicionados
endpoints, serviços Rails, payloads de escrita, `persistData`, PUT `/api/data`,
escrita em `db.json`, localStorage ou notificações de sucesso simuladas.

## 7. Upload preservado

O código original do módulo e do servidor de upload não mudou:

- O input de arquivo inicia POST `/api/upload` com `FormData`, campo `file`.
- A URL da capa só entra no rascunho após resposta HTTP OK com URL.
- Estado de envio, prévia e alertas de erro permanecem no módulo.
- O destino continua `public/uploads`, sem serviço novo ou mudança de caminho.
- O servidor mantém sessão válida, CSRF, limite de 5 MB, MIME/extensão,
  verificação do conteúdo e gravação sem sobrescrever arquivos existentes.

O upload de capa já era independente da persistência bloqueada de Projetos;
essa condição foi mantida. O handler exige `auth.valid`, sem uma exigência
adicional de `auth.isGestor`, característica preexistente não alterada aqui.

Selecionar arquivo dispara o envio atual. Por isso, nenhum arquivo real foi
selecionado para testar a migração. O checklist exige interceptar/bloquear o
POST antes de exercitar a seleção, ou cancelar o seletor. Não foi declarado
sucesso de upload real nem executada qualquer gravação de teste.

## 8. Permissões preservadas

O shell continua usando `canAccessProjects = session.isGestor`. Não foi liberado
acesso a qualquer usuário autenticado, nem alterada a matriz de outros módulos.
O conteúdo e a leitura só começam após essa guarda existente.

O proxy mantém a exigência da sessão administrativa Next.js; o GET legado
mantém sua validação de sessão no servidor. JWT e verificações existentes do
shell ficaram intactos. Não foram alterados `proxy.ts`, `auth.ts`, cookies,
login/logout, tokens ou serviços de autenticação.

As operações Rails protegidas continuam sujeitas ao backend. Como ainda não
existem operações Rails de Projetos, nenhuma permissão nova foi inferida para
habilitar gravação.

## 9. Navegação e links legados

- O destino de Projetos no shell e na Sidebar antiga é `/admin/projetos`.
- Gerenciar Projetos/Abrir Projetos apontam à lista.
- Os dois atalhos Novo apontam a `/admin/projetos?action=new`.
- `/admin?tab=projetos` e `/admin?section=projetos` usam `router.replace` para
  a nova rota; quando presente, `action=new` é conservado.
- A prioridade existente de `tab` sobre `section` é mantida pelo resolver.
- Não foram inventados aliases adicionais nem alterados destinos de outros módulos.

O destino não redireciona de volta. `activeSection="projetos"` seleciona o item
e mantém o agrupamento Publicações do Site e seus breadcrumbs.

## 10. Rascunhos e ciclo de vida

O módulo permanece com a mesma identidade durante recargas e falhas da leitura,
depois de uma resposta válida. Não há `key` que reinicie seu formulário ou
estado de upload. Mudanças internas continuam com os handlers da 10A.

O Next.js instalado usa `cacheComponents` e pode reter páginas por Activity,
mas também pode descartá-las. A aplicação do atalho usa o `bfcacheId` documentado
da versão instalada, sem recriar o módulo em cada renderização ou recarga.
Esse controle local evita tratar uma nova leitura como outro pedido de criação.

O editor informa que o rascunho fica apenas em memória e pode ser perdido ao
sair ou atualizar a página. Não há confirmação de saída, persistência local,
API de rascunhos ou mecanismo global novo. Não se afirma preservação garantida
entre rotas: o histórico, descarte de páginas e F5 aguardam validação manual.

## 11. Verificações

| Comando/verificação | Resultado |
| --- | --- |
| TypeScript inicial | `npx tsc --noEmit` passou. |
| TypeScript após implementação/testes | `npx tsc --noEmit` passou. |
| `npm test` | 67 testes em 17 suítes, todos passaram; execução ampliada para o executor tsx. |
| `npm run lint` inicial/final | Mesmos 12 erros e 47 avisos, sem novos diagnósticos após comparar arquivos, mensagens e severidades, descontadas linhas. |
| ESLint da nova rota, helper e testes | Passou sem diagnósticos. |
| `git diff --check` | Passou. |
| `npm run build` | Turbopack bloqueado por `binding to a port`, `Operation not permitted`. |
| `npm run build -- --webpack` | Passou em execução ampliada; as dez subrotas, incluindo `/admin/projetos`, constam na saída. |

Os seis testes novos cobrem montagem antes da autorização sem iniciar leitura
ou upload, links legados e Novo sem capturar outros módulos, GET cancelável da
coleção correta, vazio confirmado, erros HTTP/rede e resposta inválida sem
fallback. Os casos da 10A de editor, seletor e bloqueio de gravação continuam
passando. São testes estáticos/isolados com respostas sintéticas apenas na suíte;
não houve upload ou mutação real.

Também foram executados `wc -l`, `git diff --stat` e `git status --short`.
Os arquivos novos permanecem não rastreados e não aparecem no conteúdo do
`diff --stat` convencional. Não foi feito commit.

O Webpack também concluiu sua verificação TypeScript. Registrou os avisos já
existentes de conexão nas páginas públicas de avisos, acervo, galeria e redes
e o aviso sobre lockfile fora do repositório. Essas páginas ficaram intactas.

## 12. Linhas antes e depois

`src/app/admin/page.tsx`: **2.256 → 2.230 linhas**, redução de **26 linhas**.
A nova rota tem 91 linhas; o helper de leitura/compatibilidade tem 29.
A redução resulta da retirada do estado, referência e montagem antigos,
sem compactar código ou transferir responsabilidades de outras seções.

## 13. Riscos e pendências

- A leitura ainda utiliza o endpoint administrativo legado e sua resposta ampla.
- Ainda falta contrato Rails para persistência de Projetos.
- O upload local pode gerar arquivos sem associação a um projeto salvo, situação
  anterior que não foi redesenhada nesta migração.
- Rascunhos e uploads em andamento ao sair precisam de validação de ciclo de vida;
  não foi introduzido gerenciamento global ou alteração do upload.
- Os registros continuam assumindo o formato legado `ProjectMission`.
- Não foram feitos testes interativos autenticados. Os testes estáticos não
  verificam F5, seleção real, inicialização do atalho após efeito, histórico
  ou retenção de rascunhos pelo framework.
- Permanecem o lint preexistente e a restrição local do Turbopack.

## 14. Checklist manual, sem uploads ou mutações reais

- [ ] Acessar `/admin/projetos` diretamente e conferir autorização de gestor.
- [ ] Atualizar com F5; conferir carregamento independente e eventual perda
  de rascunho conforme o aviso, sem depender da Visão Geral.
- [ ] Conferir Sidebar selecionada, agrupamento e breadcrumbs.
- [ ] Conferir lista/cards e dados recebidos da fonte administrativa.
- [ ] Testar busca, trilhas, limpeza de filtros e estado vazio.
- [ ] Abrir cadastro pelo módulo e pelos dois atalhos Novo da Visão Geral,
  sem salvar; conferir número/código sugeridos e valores iniciais.
- [ ] Abrir edição de registro existente, se houver, sem salvar.
- [ ] Conferir prévia, URL da capa e dados pedagógicos.
- [ ] Para inspecionar o seletor, cancelar o diálogo; para selecionar de fato
  sem enviar, interceptar/bloquear previamente POST `/api/upload`. Não selecionar
  arquivo real com o upload liberado nesta etapa.
- [ ] Confirmar botão de gravar Projeto desabilitado e exclusão limitada ao aviso.
- [ ] Simular falha de leitura e nova tentativa em ambiente controlado;
  conferir erro explícito e preservação de um editor já montado.
- [ ] Testar Voltar/Avançar, abrir lista e Novo, sem presumir recuperação de
  rascunho após descarte da página.
- [ ] Testar os dois links legados e a variante `action=new`, sem loops.
- [ ] Conferir celular, tablet, desktop e Sidebar móvel.
- [ ] Conferir KPIs da Visão Geral e os indicadores oficiais Rails preservados.
- [ ] Conferir as nove subrotas anteriores e bloqueio para perfis sem permissão.

## 15. Recomendações para a próxima etapa

Após validar a 10B, priorizar a definição do contrato oficial de Projetos e
da relação entre imagem e projeto: leitura, permissões, métodos, payloads,
validações e respostas. Manter escrita bloqueada até essa confirmação.

Definir separadamente os requisitos de recuperação de rascunhos e de upload
em andamento entre rotas, sem introduzir persistência local como efeito colateral.
Qualquer novo módulo ou integração deve ser uma etapa autorizada pelo usuário.

Somente a Etapa 10B foi implementada. Próximos trabalhos aguardam validação.
