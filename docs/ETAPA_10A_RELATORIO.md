# Etapa 10A — Componentização de Projetos

## 1. Diagnóstico inicial

Projeto confirmado por `pwd`: `/home/lennon/medtec-web`. O comando
`git status --short --branch` mostrou a branch `feature/integracao-rotas-noticias`
com árvore limpa. A base estava adequada para iniciar a etapa e a página
principal tinha **3.378 linhas**.

Foram inspecionados `AGENTS.md`, a skill `medtec-architecture`, os guias locais
do Next.js instalado sobre Client Components e preservação de estado, a página
administrativa, tipos, componentes públicos, handlers de dados/upload, serviços
da API e `ROTAS_FRONT.md`/`docs/ROTAS_FRONT_FULL.md`.

Projetos estava diretamente em `admin/page.tsx`: cerca de 1.000 linhas de
interface/filtros/prévia dentro de `renderCmsModule('projetos')`, além de
aproximadamente 120 linhas de estados, valores iniciais e handlers. Não existia
`ProjectsModule` administrativo ou `/admin/projetos`.

Os componentes existentes `ProjectsInteractiveStage`,
`HomeProjectsAccordionSection` e `ReplicationPassportModal` atendem ao portal
público e não substituem o editor administrativo. A fonte administrativa era
`data.projects`, carregado pelo GET `/api/data`. Não há contrato Rails de
Projetos nos documentos e serviços atuais. Salvar e excluir metadados já
estavam bloqueados; o upload de capa usava o POST local `/api/upload`.

A Visão Geral dependia da coleção para KPIs e dos comandos Novo Projeto e
Abrir Lista. Os demais campos/filtros eram exclusivos do módulo. O modal global
`previewModal` é usado por outras seções; Projetos possui prévia própria na
página, sem utilizar esse modal.

O diagnóstico, a permanência da montagem e a distinção entre upload local e
gravação dos dados do projeto foram apresentados antes de editar.

## 2. Arquivos criados e modificados

| Arquivo | Responsabilidade |
| --- | --- |
| `src/components/admin/ProjectsModule.tsx` — criado | Interface, filtros, formulários, prévia, upload e handlers exclusivos de Projetos. |
| `src/app/admin/page.tsx` — modificado | Compõe o módulo, mantém dados/KPIs/autorização e os controles compartilhados dos atalhos. |
| `tests/api-client.test.ts` — modificado | Três testes pontuais de renderização do módulo. |
| `docs/ETAPA_10A_RELATORIO.md` — criado | Diagnóstico, estrutura, resultados, limites e checklist. |

Uma comparação dos hashes de todos os arquivos existentes em `src` apontou
somente a mudança de `src/app/admin/page.tsx`, além do módulo novo. Nenhum
componente público, arquivo de dados, handler de API, serviço Rails, arquivo de
autenticação ou página das nove subrotas foi alterado.

## 3. Estrutura do módulo

`ProjectsModule` é cliente, pois mantém estado e eventos de formulário.
Reutiliza `ProjectMission` e `ReplicationWeek` de `src/types/index.ts`, sem
duplicar contratos. Não foi criado outro hook ou mecanismo global de estado.

```text
ProjectsModule
  rascunho, edição, filtros, competências, materiais e upload
  valores iniciais e cronograma do formulário existentes
  handlers de novo/editar/salvar/excluir e upload
  trilhas, busca derivada e cores de badges
  lista de cards e estado vazio
  formulário com gravação bloqueada
  prévia em tempo real
```

O bloco visual foi transferido preservando seus estilos. A comparação das
classes estáticas e templates dinâmicos encontrou somente a remoção de uma
marcação `font-mono` do caminho hipotético de endpoint no aviso. Não foram
adicionados estilos de layout ou reconstruídos os cards/formulários.

## 4. Estados e handlers transferidos

Passaram ao módulo `editingProject`, `projectSearchTerm`,
`selectedProjectTrack`, `competenciasInput`, `materialsInput`, `projectForm`
e `uploadingImage`, com seus setters. `defaultProjectTimeline` e
`emptyProjectForm` também acompanham o formulário.

Foram transferidos `handleNewProject`, `handleEditProject`,
`handleDeleteProject`, `handleSaveProject` e `handleFileUpload`, além das
opções de trilha, cálculo da coleção filtrada e classes dos badges.

Novo Projeto mantém número sugerido pela quantidade de registros, código,
valores iniciais, limpeza de competências/materiais e cronograma. Editar mantém
o preenchimento existente e a chamada de rolagem. Cancelar e voltar à lista
continuam com suas ações anteriores. O parâmetro `_id` não utilizado da
exclusão foi removido: o handler continua apenas alertando sobre o bloqueio.

O upload deixou de receber um argumento fixo `project`, pois seu único uso
era Projetos; método, endpoint, corpo, feedback e atualização após resposta
continuam iguais. A resposta recebe tipagem explícita de URL/erro.

## 5. Props e dependências compartilhadas

| Dependência | Tipo/finalidade |
| --- | --- |
| `projects` | `ProjectMission[]`, proveniente de `data.projects || []`. |
| `viewMode` | `ProjectViewMode`, lista/editor compartilhado com os atalhos da Visão Geral. |
| `onViewModeChange` | `(mode: ProjectViewMode) => void`, setter desse mesmo estado. |
| `ref` | `React.Ref<ProjectsModuleHandle>`, expõe somente `newProject()`. |

O modo permanece na página porque Abrir Projetos/Gerenciar Projetos também o
controlam. A referência permite aos dois atalhos Novo Projeto chamar o handler
do módulo, sem copiar regras ou manter um segundo formulário no pai. Esse
padrão já existe em `NewsModule` com `NewsModuleHandle`/`useImperativeHandle`;
o componente de Notícias não foi alterado.

O módulo não recebe `DatabaseSchema`, `setData`, `loadData`, `persistData`,
sessão completa ou callbacks de outras seções. A coleção não é copiada para
outro estado. Na página permanecem a leitura global, KPIs, autorização,
modo compartilhado e a referência dos atalhos.

## 6. Fonte real dos dados

O administrador continua lendo `data.projects` recebido de GET `/api/data`,
que lê a estrutura legada por `getDatabase()`. Não houve troca de fonte,
requisição duplicada ou carregamento novo dentro do módulo.

O portal público continua utilizando GET `/api/projects`: o handler existente
retorna coleção vazia e informa a pendência do backend; uma consulta por ID
retorna 404. Esses handlers e componentes públicos ficaram intactos. Não se
substituiu a leitura administrativa por essa coleção pública vazia.

## 7. Situação Rails e upload existente

Não foram encontrados endpoints Rails oficiais de Projetos nos contratos e
serviços atuais. Não foram inventados métodos, payloads, respostas ou permissões.
Os avisos agora mencionam suporte oficial pendente sem sugerir um caminho
hipotético `/p_projetos` como se fosse um contrato disponível.

Salvar permanece desabilitado, e seu handler só previne submissão e alerta.
Excluir continua apenas informando a indisponibilidade, sem remover registros.
Não há sucesso simulado, PUT `/api/data`, escrita em `db.json`, localStorage
ou outra persistência dos dados do projeto introduzida nesta extração.

O upload de capa é uma operação local já existente, distinta do CRUD Rails:

- POST `/api/upload` com `FormData` no campo `file`;
- resposta com URL/nome do arquivo; o rascunho só recebe a URL após HTTP OK;
- erros retornados e falhas de rede mantêm os alertas existentes;
- o arquivo é gravado pelo handler existente em `public/uploads`.

Esse comportamento foi preservado, sem ampliar tipos, permissões ou rotas.
O README e o handler documentam/verificam sessão válida, origem CSRF, limite de
5 MB, formatos JPEG/PNG/WEBP/AVIF, extensão, conteúdo e gravação sem sobrescrita.
Nenhum upload real foi executado nos testes desta etapa.

## 8. Permissões e segurança

Projetos continua exclusivo da condição existente `userSession.isGestor`.
O pai só monta o módulo quando essa condição permite. Não foram ampliados
privilégios, alterados cookies/JWT ou modificados `proxy.ts`, `auth.ts`,
login/logout e serviços de autenticação.

As mutações de metadados não existem nesta interface bloqueada. Quando houver
contrato oficial, a autorização por ação deverá ser verificada no Rails.
O upload existente valida sessão no servidor, além de CSRF e arquivo, não
dependendo apenas da ocultação de botões. Seu handler verifica `auth.valid`,
sem uma exigência adicional de `auth.isGestor`; essa característica preexistente
não foi alterada nem apresentada como autorização específica de Projetos.

## 9. Funcionalidades e ciclo de vida preservados

Permanecem cards, contagem, trilhas, busca por título/título curto/escola/
município/docente/código, limpeza de filtros, estado vazio, Novo, Editar,
Excluir bloqueado e o link público `/projetos`.

O formulário conserva identificação, escola/localidade, docência/turma,
fotografia por upload ou URL, tríade pedagógica, competências, materiais,
dica de replicação, campos obrigatórios e prévia. Não foram adicionadas
tabelas ou modais que não existiam no administrador.

O módulo fica montado para o gestor e seu contêiner usa `hidden` quando outra
seção interna está ativa. Assim, rascunho, filtros e upload em andamento não
são reiniciados pela troca de seções. Os atalhos de lista continuam escolhendo
lista, e Novo continua iniciando um novo rascunho intencionalmente.

Sidebar, identificador `projetos`, links legados, breadcrumbs e responsividade
foram mantidos. `/admin/projetos` não foi criada.

## 10. Limitações mantidas

Carregamento e falha da leitura inicial continuam pertencendo ao painel:
o módulo não consulta uma API nem recebe estados artificiais de uma consulta
inexistente. O tratamento global de `/api/data` não foi redesenhado. O estado
de envio e os alertas de erro do upload continuam internos ao módulo.

Cadastro/edição apenas alteram o rascunho; a persistência continua bloqueada.
Um upload, apesar disso, já pode gravar o arquivo no armazenamento local,
mesmo sem existir um projeto salvo. Essa limitação anterior pode produzir
arquivos sem associação e requer decisão futura, sem novo fluxo nesta etapa.

Os valores padrão e cronograma são os mesmos do formulário anterior, não novos
registros ou mocks usados como fonte oficial da listagem.

## 11. Verificações

| Comando/verificação | Resultado |
| --- | --- |
| TypeScript inicial | `npx tsc --noEmit` passou. |
| TypeScript após extração/testes | `npx tsc --noEmit` passou. |
| `npm test` | 61 testes em 16 suítes, todos passaram; execução ampliada para o executor tsx. |
| `npm run lint` inicial | 12 erros e 48 avisos. |
| `npm run lint` final | 12 erros e 47 avisos; saiu o aviso de `_id` não utilizado. Nenhum diagnóstico novo. |
| ESLint de ProjectsModule | Zero erros e três avisos de `<img>` já existentes no bloco original, agora transferidos. |
| `git diff --check` | Passou. |
| `npm run build` | Turbopack bloqueado por `binding to a port`, `Operation not permitted`. |
| `npm run build -- --webpack` | Passou em execução ampliada; as nove subrotas existentes constam na saída e `/admin/projetos` está ausente. |

Os três novos testes verificam lista vazia sem registros substitutos, cards
recebidos por props e suas ações, e editor/prévia/upload visíveis com envio de
projeto desabilitado e nenhuma requisição iniciada pela renderização.
As respostas e registros sintéticos ficam somente na suíte de testes.

A primeira tentativa de `npm test` não iniciou porque a revisão automática de
permissão excedeu seu prazo; a repetição permitida foi autorizada e passou.
Não houve solicitação de credenciais ou mutações reais.

A comparação dos diagnósticos de lint desconsiderou os números de linha e
associou os três avisos de imagem transferidos ao arquivo original. O único
diagnóstico removido foi o parâmetro sem uso, sem diagnósticos adicionados.
Também foram executados `wc -l`, `git diff --stat` e `git status --short`.
Não houve commit. Os arquivos novos permanecem não rastreados e não entram
no conteúdo do `diff --stat` convencional.

O Webpack concluiu também sua etapa TypeScript. O build registrou os avisos
de conexão já existentes nas páginas públicas de avisos, acervo, galeria e
redes e o aviso sobre lockfile fora do repositório. Essas páginas permaneceram
inalteradas.

## 12. Quantidade de linhas

`src/app/admin/page.tsx`: **3.378 → 2.256 linhas**, redução de **1.122 linhas**.
O módulo novo tem **1.169 linhas**, incluindo suas props e interface tipada
para os atalhos. O código foi transferido com suas responsabilidades, sem
compactação artificial ou movimentação de outros módulos.

## 13. Riscos e pendências

- A leitura administrativa e a fonte pública vazia continuam diferentes.
- É necessário contrato oficial de Projetos antes de habilitar persistência.
- O upload local tem persistência e autorização próprias; uma futura integração
  Rails deve definir armazenamento e vínculo da imagem com o projeto.
- A preservação do rascunho vale para a mesma montagem do painel. F5 e descarte
  da página podem perder estado; não foi criada recuperação persistente.
- Os registros continuam assumindo o formato `ProjectMission` existente.
- Não houve inspeção visual ou teste interativo autenticado. Os testes estáticos
  não verificam digitação, comando por ref, upload nem preservação do ciclo de
  vida entre seções; esses pontos aguardam validação manual.
- Os 12 erros restantes de lint e a restrição local do Turbopack permanecem.

## 14. Checklist manual, sem mutações reais

- [ ] Abrir Projetos pela navegação atual e pelos links legados; conferir
  Sidebar, agrupamento e breadcrumbs.
- [ ] Conferir lista/cards e quantidades nos KPIs da Visão Geral.
- [ ] Conferir busca por cada campo suportado, trilhas e Limpar Filtros.
- [ ] Conferir ausência de resultados e a ação Novo no estado vazio.
- [ ] Usar os dois atalhos Novo da Visão Geral; conferir reset intencional,
  número/código sugeridos e abertura do editor sem salvar.
- [ ] Abrir edição de registro existente, quando houver, sem salvar; conferir
  identificação, localidade, docência, tríade, competências e materiais.
- [ ] Conferir URL da capa e prévia em tempo real sem enviar arquivo.
- [ ] Conferir controles de upload e seu estado inicial; não executar upload
  real apenas para validar a extração.
- [ ] Confirmar envio de projeto desabilitado e exclusão limitada ao alerta,
  sem requisições de escrita de metadados.
- [ ] Conferir Cancelar e Voltar para Lista.
- [ ] Digitar um rascunho, alternar para outra seção interna e retornar pela
  Sidebar; conferir modo, campos, busca e filtro preservados.
- [ ] Conferir que Gerenciar/Abrir Projetos escolhem lista, como anteriormente.
- [ ] Conferir link público, prévia e ausência de modais duplicados.
- [ ] Conferir celular/tablet/desktop e autorização exclusiva de gestor.
- [ ] Conferir os KPIs oficiais Rails e funcionamento das nove subrotas.

## 15. Recomendações para 10B

Após validar a 10A, definir a migração para `/admin/projetos` reutilizando
`AdminShell` e `ProjectsModule`. A futura página deverá fornecer coleção e
modo próprios, manter a restrição existente e tratar carregamento/erro sem
importar a página principal. A leitura pública vazia não pode substituir
silenciosamente a coleção administrativa legada.

Na etapa autorizada, atualizar então os links, compatibilidade e atalhos,
preservando os KPIs. Rever o ciclo de vida dos rascunhos e a situação do upload
local separadamente. Manter gravações de Projetos bloqueadas até existir
contrato Rails documentado e autorização por operação.

Somente a Etapa 10A foi implementada. A 10B aguarda validação do usuário.
