# Etapa 8A — Desacoplamento de Usuários e Acessos

## 1. Auditoria inicial e diagnóstico

Trabalho restrito a `/home/lennon/medtec-web`. O comando
`git status --short --branch` mostrou a branch
`feature/integracao-rotas-noticias` acompanhando sua origem, sem alterações locais.
A página `src/app/admin/page.tsx` tinha 4.013 linhas.

Foram lidos `AGENTS.md`, a skill `medtec-architecture`, o guia local de Server e
Client Components do Next.js instalado, a página administrativa, `UserManager`,
`AdminShell`, `useEditorialNews`, os serviços, tipos, cliente HTTP e erros da API,
e os contratos `ROTAS_FRONT.md`, `docs/ROTAS_FRONT_FULL.md` e
`docs/rotas_front.md`. O diagnóstico foi apresentado antes das alterações.

O `UserManager` já consultava usuários e perfis no Rails. A prop opcional `users`,
tipada como `UserAccount[]` local, era ignorada. A prop `onRefreshUsers` chamava
`loadData()` após cadastro, ativação/desativação e exclusão, repetindo autenticação,
leituras de outros módulos e `GET /api/data`, além de poder selecionar novamente
a Visão Geral. Os indicadores de equipe usavam `data.users` do JSON local.

O componente mantinha formulários, modais, validações e operações Rails. Suas
leituras iniciais se repetiam ao trocar o perfil selecionado no cadastro. As
falhas eram ocultadas ou convertidas em listas vazias, sem indicador inicial de
carregamento de usuários. A busca local cobria nome, CPF e nome do perfil; os
filtros de nome/ativo enviados ao Rails só eram usados em recargas posteriores
a operações, causando resultados diferentes da leitura inicial.

Não havia `useAdminUsers` ou abstração equivalente. `useEditorialNews` forneceu
a referência de leitura oficial compartilhada com indicadores, recarga específica
e erro explícito. `AdminShell` foi inspecionado e preservado integralmente.

## 2. Arquivos criados e modificados

| Arquivo | Responsabilidade |
| --- | --- |
| `src/components/admin/useAdminUsers.ts` — criado | Leituras oficiais, estados de carregamento/erro, total da API e recargas de usuários/perfis. |
| `src/components/UserManager.tsx` — modificado | Recebe o contrato tipado do hook; preserva interface e operações; usa recargas específicas e erros compartilhados. |
| `src/app/admin/page.tsx` — modificado | Instancia o hook com a condição de acesso existente, compartilha a leitura e usa o total Rails nos indicadores. |
| `tests/api-client.test.ts` — modificado | Três testes de renderização dos estados de leitura e disponibilidade do cadastro. |
| `docs/ETAPA_8A_RELATORIO.md` — criado | Auditoria, contratos, resultados, limites, checklist e plano para 8B. |

## 3. Estados e callbacks desacoplados

`useAdminUsers({ enabled })` concentra `apiUsers`, `profiles`, `totalUsers`,
`loadingUsers`, `loadingProfiles`, `errorUsers` e `errorProfiles`. Expõe
`reloadUsers()` e `reloadProfiles()` com retorno `Promise<void>` e o tipo
`AdminUsersData`, consumido pelo gerenciador.

A primeira leitura ocorre após habilitação pelo proprietário. Não depende de
`loadData()`, de `DatabaseSchema`, da seleção do perfil no formulário ou de
dados institucionais. Não há estado global. Identificadores de requisição
impedem que respostas antigas substituam leituras mais recentes ou atualizem
estado depois da desmontagem/desabilitação. Cada recarga pós-operação inicia
uma nova leitura; não reaproveita uma requisição anterior à operação.

Cadastro, ativação/desativação e exclusão confirmados recarregam usuários.
Salvar/excluir perfil recarrega perfis e usuários, atualizando também o nome
associado ao perfil na listagem. Senha e matrizes de permissões continuam com
seus fluxos existentes, sem recarregar o painel inteiro.

## 4. Preservação do UserManager

O componente original foi reutilizado. Permanecem abas, layout responsivo,
cadastro com associação de perfil, status das contas, exclusão com confirmação,
redefinição de senha, CRUD de perfis e modais de permissões de perfil e extras.
Permanecem as validações de CPF com 11 dígitos, confirmação de senha e mínimo
de oito caracteres, complementadas pelas validações oficiais do Rails.

Busca por nome, CPF e perfil e filtro Ativos são aplicados à mesma coleção
carregada, inclusive após operações. O filtro Ativos passa a valer imediatamente.
A janela inicial existente de 50 usuários foi mantida; não foi criada paginação.
Falhas de leitura recebem mensagem e tentativa de recarga. A última resposta
válida fica disponível com o erro explícito; não se transforma falha em lista
vazia legítima. O cadastro fica indisponível enquanto os perfis carregam,
falham ou estão vazios. As mensagens usam `ApiError.getFriendlyMessage`.
O erro de perfil Administrador imutável usa a propriedade real `erroBruto`.

A interface atual não possui edição geral de nome/CPF de usuário nem troca de
perfil de uma conta existente. O contrato permite essas alterações via PATCH,
mas elas não foram acrescentadas nesta etapa.

## 5. Contratos e serviços Rails reutilizados

Nenhum serviço, endpoint, payload, tipo da API ou backend foi alterado.
As rotas abaixo são relativas à base Rails v1 configurada no cliente existente.

| Operação | Serviço/contrato existente |
| --- | --- |
| Listar usuários | `usuarios.list`, GET `/usuarios?page=1&per_page=50`; envelope `success/data.items/data.pagination`. |
| Cadastrar | `usuarios.create`, POST `/usuarios`; corpo com `nome`, `cpf`, `password`, `perfil_id`, `ativo`; 201 com objeto direto. |
| Ativar/desativar, trocar senha | `usuarios.update`, PATCH `/usuarios/:id`; campos parciais `ativo` ou `password`; 200 com objeto direto. |
| Excluir usuário | `usuarios.delete`, DELETE `/usuarios/:id`; 204 sem corpo. |
| Listar perfis | `perfis.list`, GET `/perfis?page=all`; envelope paginado. |
| Criar/editar perfil | `perfis.create/update`, POST `/perfis` e PATCH `/perfis/:id`; corpo `{ perfil: { nome, descricao, ativo } }`; 201/200 com objeto direto. |
| Excluir perfil | `perfis.delete`, DELETE `/perfis/:id`; 204 sem corpo. |
| Permissões do perfil | `perfis.getPermissoes/savePermissoes`, GET/PUT `/perfis/:id/permissoes`; GET com envelope; PUT com lista final `{ regra_ids }`, 204. |
| Exceções do usuário | `usuarios.getPermissoesExtras/savePermissoesExtras`, GET/PUT `/usuarios/:id/permissoes_extras`; GET com envelope; PUT com lista final `{ regra_ids }`, 204. |

O indicador de equipe utiliza `pagination.total_count`, sem confundir o total
oficial com o tamanho da primeira página. Carregamento e erro não mostram zero
como se fosse uma resposta válida.

## 6. Permissões e segurança

Os documentos oficiais exigem JWT e permissão do perfil para cada operação
de usuários/perfis, incluindo listagem. `apiFetch` continua responsável pelo
Bearer token, renovação existente e conversão dos erros HTTP. As operações
continuam aguardando a resposta do backend antes de informar sucesso ou
recarregar dados. Não há concessão local de autorização.

| Operação | Regra documentada |
| --- | --- |
| Listar usuários/perfis | Token e autorização de listagem no Rails. |
| Criar usuário | Token e autorização de criação no Rails. |
| Editar conta, senha, perfil ou status | Token e autorização de atualização no Rails. |
| Excluir | Token e autorização de exclusão; vínculos podem produzir 422. |
| Alterar matriz de perfil | Autorização Rails; Administrador imutável retorna 422. |
| Alterar exceções | Autorização Rails; alterar as próprias exceções retorna 403. |

Os contratos não fornecem uma matriz completa dos perfis Operador, Gestor etc.
por ação. Não foi inventada uma matriz nem inferida autorização pelo acesso à
rota. A restrição visual existente `isGestor` foi preservada; ela usa heurísticas
legadas e não substitui a decisão do Rails. O hook só inicia leituras quando
`isLoggedIn && canAccessUsers`. Um operador não recebe poderes novos.
Não foi feita validação autenticada desses perfis em ambiente real.

Sessão Next.js, JWT e autorização Rails permanecem separados. Não foram
alterados `auth.ts`, `proxy.ts`, login/logout, cookies, tokens ou permissões.
Não foram adicionados logs de usuários ou dados sensíveis, persistência local,
fallback de usuários, mocks de produção ou chamadas reais de mutação.

## 7. Dependências removidas e dependência residual

Foram removidas as props `users={data.users || []}` e
`onRefreshUsers={loadData}`, as três chamadas de atualização global e todas as
referências dos indicadores administrativos a `data.users`. A atualização de
usuários não dispara mais `GET /api/data` ou autenticação do painel.

O contêiner legado ainda executa `loadData()` na montagem e sua condição global
`!isLoggedIn || !data` ainda depende da carga institucional para renderizar o
painel. Isso não integra o hook nem o contrato do gerenciador. Eliminar essa
dependência de montagem deve ocorrer na subrota em 8B, preservando agora as
outras seções. O `persistData` legado de outras seções não foi alterado nem
conectado ao fluxo de usuários.

Nenhuma subrota, Sidebar ou destino foi alterado. O acesso permanece em
`/admin?tab=usuarios` e na seção interna atual. `/admin/usuarios` não foi criada.

## 8. Quantidade de linhas

`wc -l src/app/admin/page.tsx`: **4.013 antes e 4.013 depois**. A redução líquida
é zero: a composição do hook e dos indicadores compensou a remoção das props.
O propósito foi eliminar dependências reais, sem mover código por contagem.

## 9. Verificações

| Comando | Antes | Depois |
| --- | --- | --- |
| `npx tsc --noEmit` | Passou na repetição sem concorrência com build. | Passou. |
| `npm test` | 42 testes, 11 suítes, nenhuma falha, em execução ampliada. | 45 testes, 12 suítes, nenhuma falha, em execução ampliada. |
| `npm run lint` | 12 erros e 49 avisos. | 12 erros e 49 avisos. Mesmos arquivos, mensagens, severidades e ocorrências, descontados deslocamentos de linhas. |
| ESLint de `UserManager`, hook e arquivo de testes | — | Passou sem diagnósticos. |
| `git diff --check` | Árvore inicialmente limpa. | Passou. |
| `npm run build` | Falhou no Turbopack por restrição local de processo/porta. | Mesma restrição: `binding to a port`, `Operation not permitted`. |
| `npm run build -- --webpack` | Passou em execução ampliada. | Passou em execução ampliada; as sete subrotas permanecem na saída e `/admin/usuarios` está ausente. |

A primeira verificação TypeScript foi executada concorrentemente com o build,
que regenerou `.next/types`: houve TS6053 de arquivos gerados ausentes. A
repetição antes de editar passou. As verificações finais TypeScript e build
foram executadas sem essa concorrência.

As tentativas restritas de `npm test` dependem da obtenção de `tsx` pelo npx e
encontram `EAI_AGAIN` no registro npm. A execução ampliada resolveu isso sem
alterar dependências. O Webpack restrito também encontrou falha ao interpretar
`TypeScript --showConfig`; foi usada execução ampliada. Os builds inicial e final
passaram, com avisos de conexão nas leituras públicas de avisos/galeria/redes
já existentes.
Nenhum teste executou mutações na API real; os novos casos usam dados sintéticos
somente em renderização estática, seguindo a suíte existente.

Também foram executados `git diff --stat`, `git status --short` e `wc -l`.
Os arquivos novos permanecem sem rastreamento e não aparecem no `diff --stat`
convencional. Não houve commit.

## 10. Riscos e limitações

- Listagem e busca continuam limitadas aos primeiros 50 registros. O total
  exibido no painel pode ser maior, por vir da paginação oficial.
- A guarda global do painel ainda depende da carga institucional até a 8B.
- A sessão/heurística `isGestor` existente não foi redesenhada. A matriz efetiva
  de permissões precisa ser validada com contas autorizadas em ambiente de teste.
- A última lista válida pode ficar desatualizada após falha de recarga; o erro
  permanece visível e não há fallback para dados locais.
- A seleção inicial de perfil no cadastro permanece com o valor legado 1.
  Nenhuma regra de atribuição de perfil foi criada nesta etapa.
- Não foi feita inspeção visual em navegador, teste interativo dos modais ou
  teste ponta a ponta autenticado. Os testes de renderização não verificam o
  ciclo de efeitos, concorrência de requisições ou o backend em execução.
- Falhas preexistentes de lint e a restrição do Turbopack permanecem.

## 11. Checklist de validação manual

- [ ] Com sessão administrativa permitida, abrir a seção pelo menu atual e por
  `/admin?tab=usuarios`; conferir que a URL e a navegação foram preservadas.
- [ ] Conferir no painel de rede as leituras GET de usuários/perfis e os
  indicadores baseados no total Rails; alternar abas sem novas cargas globais.
- [ ] Conferir busca por nome/CPF/perfil, Ativos, estado vazio e carregamento.
- [ ] Simular falha de rede/401/403 em ambiente controlado; conferir erro,
  preservação da última leitura e botão de nova tentativa.
- [ ] Conferir layout em tela estreita, abas, formulários e abertura/fechamento
  dos modais, sem enviar alterações de contas reais.
- [ ] Com perfil operador sem permissão, conferir bloqueio de navegação e 403
  das leituras protegidas, sem tentar mutações em produção.
- [ ] Em ambiente de teste autorizado, com contas descartáveis, validar cadastro,
  status, exclusão, senha, CRUD de perfis, matrizes e exceções; verificar que
  somente respostas confirmadas atualizam a tela e que não ocorre recarga de
  sessão, de outros módulos ou `GET /api/data` após essas ações.
- [ ] Nesse ambiente, conferir 422 de perfil Administrador/vínculos e 403 de
  alteração das próprias exceções; nunca executar essas mutações em contas reais
  apenas para validar a refatoração.
- [ ] Conferir que as sete subrotas existentes mantêm seus destinos.

## 12. Plano técnico recomendado para 8B

Após validação da 8A pelo usuário, criar `/admin/usuarios` com `AdminShell` e um
componente de conteúdo montado apenas para a sessão administrativa permitida.
Esse conteúdo instancia `useAdminUsers` e passa `management` ao mesmo
`UserManager`. Não deve importar a página antiga nem chamar seu `loadData()`.

Manter JWT e autorização Rails por ação. Confirmar em ambiente autorizado a
matriz efetiva de usuários/perfis antes de qualquer mudança nas guardas visuais.
Só então atualizar o destino no shell, a navegação antiga e a compatibilidade
de `?tab=usuarios`/`?section=usuarios`, preservando os indicadores da Visão Geral
com a leitura oficial apropriada. Verificar acesso direto, navegação, erros,
perfis sem autorização, build e todas as sete rotas existentes.

Paginação e edição geral de usuário são decisões futuras separadas; não são
pré-requisitos introduzidos por esta extração. A Etapa 8B não foi iniciada.
