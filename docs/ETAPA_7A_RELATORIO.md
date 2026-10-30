# MEDTEC — Etapa 7A: integração do Kanban Editorial

## Auditoria

Projeto confirmado em `/home/lennon/medtec-web`, remoto
`https://git.seduc.ro.gov.br/medtec/medtec-web.git`, branch
`feature/integracao-rotas-noticias` (com crases literais no nome armazenado).
A árvore Git estava limpa no início. Não houve alteração de outro checkout,
descarte de alterações ou commit. A página principal tinha 4.089 linhas.

Foram inspecionados `admin/page.tsx`, `EditorialKanban.tsx`, a subrota de Notícias,
`NewsModule.tsx`, serviços/tipos Rails e os contratos de notícias/permissões em
`ROTAS_FRONT.md` e `docs/ROTAS_FRONT_FULL.md`. Aplicada a skill medtec-architecture
e consultado o guia local do Next.js sobre componentes cliente/servidor.

## Diagnóstico das dependências

Antes, o painel possuía a coleção Rails, carregamento/erro, adaptação para NewsItem
e callbacks de aprovação/reprovação. O Kanban recebia a lista e esses callbacks,
mas também implementava busca própria, chamadas diretas de decisão editorial e
alterações otimistas de sua coleção interna. Existiam dois caminhos de execução
para as mesmas operações. Sua busca própria limitava os registros a 50.

Os callbacks do painel chamavam `loadApiData` após cada decisão, recarregando
avisos, galeria, canais e estados, além de notícias. A autorização usava a
identificação ampla `isGestor`, e o Kanban assumia `isGestor = true` quando omitido.
O carregamento e o erro da leitura do painel não eram transmitidos ao Kanban.

## Arquivos e responsabilidades após a mudança

| Arquivo | Responsabilidade |
| --- | --- |
| `src/components/admin/useEditorialNews.ts` — criado | Hook local de integração: coleção Rails, adaptação para NewsItem, carregamento/erro, leitura e operações editoriais. Não carrega automaticamente nem instala provider global. |
| `src/app/admin/page.tsx` — modificado | Monta uma instância do hook, compartilha seus dados com KPIs e Kanban e mantém o carregamento inicial existente. Informa a autorização editorial a partir do perfil Rails. |
| `src/components/EditorialKanban.tsx` — modificado | Mantém interface, filtros, busca, modais, progresso, motivo e histórico da sessão. Recebe lista, carregamento/erro e callbacks obrigatórios. Não busca nem persiste notícias por conta própria. |
| `tests/api-client.test.ts` — modificado | Acrescenta três testes de renderização para permissões negadas por padrão, independência das ações e distinção entre vazio/erro/carregamento. |
| `docs/ETAPA_7A_RELATORIO.md` — criado | Diagnóstico, validações, riscos e plano da próxima etapa. |

Não foram alteradas as seis subrotas existentes, o AdminShell, a configuração do
Next.js ou os serviços Rails. Não foi criada `/admin/kanban`. A navegação continua
na seção atual do painel, inclusive `/admin?tab=kanban` e `?section=kanban`.

## Estados e callbacks desacoplados

Saíram do corpo de `admin/page.tsx` os estados `apiNews`, `loadingNews`, `errorNews`,
a adaptação `effectiveNews`, o carregamento específico de notícias e os callbacks
de decisão editorial. O hook fornece esses valores e as funções `reload`,
`approveNews` e `rejectNews`. O painel ainda calcula seus indicadores a partir da
mesma coleção oficial e chama `reload` no ponto de carregamento já existente.

O hook não possui efeito de busca automática: montar o Kanban não gera uma segunda
requisição. Leituras simultâneas na mesma instância compartilham a requisição em
andamento. Após uma mutação, aguarda-se qualquer leitura anterior e inicia-se uma
leitura posterior à decisão, evitando reutilizar uma resposta iniciada antes dela.
Somente notícias são recarregadas após publicar ou reprovar.

O Kanban deixa de manter a coleção paralela interna e de produzir alterações
otimistas de status/data. `news=[]` é uma coleção oficial válida, sem fallback.

## Contrato Rails e sincronização

- Leitura: `GET /n_noticias?page=all`, validando `success` e `data.items`.
- Aprovação: `medtecApi.noticias.publicar`, `PATCH /n_noticias/:id/publicar`,
  sem corpo; resposta é o objeto da notícia.
- Reprovação: `medtecApi.noticias.reprovar`, `PATCH /n_noticias/:id/reprovar`,
  corpo `{ motivo: texto.trim() }`; resposta é o objeto da notícia.
- Motivo obrigatório permanece validado no modal, no hook e no serviço existente.
- Falhas das mutações chegam ao feedback do Kanban via ApiError, sem alerta
  duplicado da página principal e sem registrar sucesso após rejeição da API.
- Falha de leitura mantém a última coleção válida e expõe erro. O Kanban não
  apresenta o estado vazio nem permite decisões enquanto houver erro/carregamento.

Os KPIs continuam contando pendências exclusivamente por `status === 'aguardando'`.
O adaptador preserva a distinção publicada/reprovada/aguardando, os dados de capa,
autor, categoria, data e motivo. Não foram acrescentados contadores fictícios.

A página de Notícias continua usando os serviços oficiais e seu ciclo de releitura.
Não houve alteração de seu CRUD. A volta de reprovada para aguardando após editar
continua sendo responsabilidade do Rails. Ao recarregar/reativar o painel, seu
carregamento existente consulta novamente a fonte oficial e atualiza os indicadores
e a fila. Não há store global nem cache persistente compartilhado entre páginas.

## Permissões e limites da confirmação

As duas cópias locais do contrato Rails confirmam que Administrador/Gestor podem
editar, mas publicar e reprovar são permissões distintas, atualmente concedidas
apenas a Administrador; Gestor recebe 403. A documentação também informa que o
perfil Administrador é imutável e possui todas as permissões.

A guarda do Kanban agora exige o perfil **Administrador retornado por `/auth/me`**,
além da guarda administrativa preexistente. O nome do campo `editorialProfile`
apenas registra a origem Rails desse dado. O fallback de sessão local não preenche
esse campo e não concede aprovação. IDs de usuário/perfil, permissão para editar
ou o valor amplo `isGestor` isolado não autorizam decisões editoriais.

O componente e o hook recebem `canApprove` e `canReject` independentemente, ambos
com padrão `false`. Guardas existem nos botões, nas confirmações e nos callbacks.
O atalho da Visão Geral é desabilitado sem autorização; abrir diretamente a seção
sem autorização apresenta uma mensagem. Nenhuma permissão foi ampliada.

As demais heurísticas legadas do painel permanecem fora do escopo. Os termos
“gestor” que ainda aparecem em títulos/textos do Kanban são cópia legada, não a
regra de autorização. As descrições dos modais foram alinhadas a permissão editorial.

A confirmação desta etapa é documental e por inspeção do cliente. Não foi feita
auditoria de um backend Rails em execução nem login automatizado; a autorização
final continua sendo a validação do banco em cada requisição Rails. Perfis com
eventuais concessões extras devem ser reavaliados antes de expandir a guarda;
esta etapa mantém a restrição ao perfil oficial documentado.

Não foram alterados login, logout, cookies, proxy.ts ou auth.ts. Não houve exposição
de credenciais ou publicação/reprovação real para teste.

## Validações executadas

| Comando | Resultado |
| --- | --- |
| `npx tsc --noEmit` | Passou após as alterações, incluindo os novos testes. |
| `npm test` | 42 testes passaram em 11 suítes; nenhuma falha. A tentativa restrita falhou ao resolver registry.npmjs.org para obter tsx; a execução ampliada passou. |
| `npm run lint` | 12 erros e 49 avisos, exatamente o total da auditoria anterior à edição nesta sessão. Nenhuma regressão de lint. |
| ESLint nos arquivos do hook/Kanban | Passou sem erros ou avisos. |
| `git diff --check` | Passou. |
| `npm run build` | Falhou no Turbopack ao criar processo/abrir porta local para processar CSS: `Operation not permitted`. A repetição ampliada apresentou a mesma restrição. |
| `npm run build -- --webpack` | Passou com execução ampliada, incluindo as seis subrotas existentes. Nenhuma mudança global de configuração. |
| `wc -l src/app/admin/page.tsx` | 4.023 linhas; antes 4.089, redução de 66 linhas. |
| `git diff --stat` / `git status --short` | Executados; alterações limitadas aos arquivos descritos, sem commit. O stat padrão não inclui o hook e este relatório enquanto não rastreados. |

O build alternativo registrou falhas de rede em leituras de páginas públicas
preexistentes e aviso de lockfile externo, mas concluiu com código zero.
Os novos testes renderizam o componente com dados de teste e callbacks que falham
se acionados: nenhuma decisão real é feita. Os testes não equivalem a um teste
funcional no navegador nem exercitam o ciclo completo de rede do hook.

## Riscos e checklist manual

O build padrão ainda precisa ser executado em ambiente que permita a porta/processo
do Turbopack. Não foi realizada inspeção visual em desktop/mobile ou validação
funcional autenticada. O histórico exibido continua sendo histórico da sessão,
conforme o comportamento anterior, não um log de auditoria persistente do Rails.
Se uma decisão persistir e sua releitura falhar, o Kanban exibe o erro de leitura;
é necessário recarregar os dados antes de continuar.

- [ ] Acessar a seção Kanban pela navegação atual com Administrador Rails.
- [ ] Conferir acesso negado para Gestor, perfil de edição e sessão apenas local.
- [ ] Conferir aprovação e reprovação separadamente, incluindo eventual 403 Rails.
- [ ] Testar busca por título/autor/categoria e os quatro filtros de situação.
- [ ] Conferir contagem pendente sem incluir reprovadas.
- [ ] Validar lista vazia, carregamento, erro de rede, 401 e 403 sem falso vazio.
- [ ] Conferir modais e exigir motivo não vazio antes de reprovar.
- [ ] Em ambiente de teste autorizado, aprovar/reprovar e conferir uma releitura
  somente de notícias, atualização de KPIs, feedback e histórico da sessão.
- [ ] Editar reprovada em Notícias e voltar/recarregar a fila, conferindo aguardando.
- [ ] Validar notícia futura sem substituir sua data por uma data local inventada.
- [ ] Conferir comportamento responsivo, progresso e prevenção de ação repetida.
- [ ] Conferir ausência de `/admin/kanban` e funcionamento das seis subrotas.

As mutações desse checklist não foram executadas pelo agente.

## Plano específico para a etapa 7B — somente após validação

1. Criar `/admin/kanban` com AdminShell e uma instância de useEditorialNews,
   reutilizando EditorialKanban e sua interface de props controladas.
2. Resolver a autorização editorial usando a sessão Rails do shell, mantendo
   guardas por ação e a restrição oficial; revisar a guarda legada do shell antes
   de mudar seu link. Validar a matriz real caso seja necessário suportar extras.
3. Carregar a fila diretamente pelo `reload` do hook na nova rota, sem montar
   Visão Geral ou carregar outros módulos.
4. Atualizar sidebar e atalhos, preservando redirecionamento explícito dos links
   legados `?tab=kanban` e `?section=kanban`, sem loops.
5. Remover apenas a montagem antiga. O painel continuará usando a coleção de
   leitura do hook para KPIs, sem tornar Notícias ou Kanban dependentes dele.
6. Validar acesso direto, F5, Voltar/Avançar, permissões, sincronização de decisões,
   estados de erro/vazio, desktop/mobile, seis subrotas anteriores e comandos de
   qualidade. Não executar mutações reais sem ambiente e autorização apropriados.

Nenhuma parte da etapa 7B foi implementada nesta entrega.
