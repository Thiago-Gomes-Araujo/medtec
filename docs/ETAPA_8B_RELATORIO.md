# Etapa 8B — Subrota de Usuários e Acessos

## Auditoria e preservação da base

Projeto confirmado por `pwd`: `/home/lennon/medtec-web`. Antes das alterações,
`git status --short --branch` apontava a branch `feature/integracao-rotas-noticias`
com o trabalho da 8A ainda sem commit:

- Modificados: `src/app/admin/page.tsx`, `src/components/UserManager.tsx` e
  `tests/api-client.test.ts`.
- Não rastreados: `src/components/admin/useAdminUsers.ts` e
  `docs/ETAPA_8A_RELATORIO.md`.

Essas alterações foram preservadas. `UserManager`, `useAdminUsers` e o relatório
8A não foram editados nesta etapa. Foram conferidos os arquivos das sete
subrotas, `AdminShell`, a página principal, serviços/tipos de usuários e perfis,
o contrato de `/auth/me`, `ROTAS_FRONT.md`, `docs/ROTAS_FRONT_FULL.md`, o relatório
8A e as instruções da skill `medtec-architecture`. Foram consultados os guias
locais da versão instalada do Next.js para páginas, Client Components e Link.

A prop real necessária ao gerenciador é `management: AdminUsersData`. O hook
existente recebe `{ enabled: boolean }` e fornece todos os dados, erros,
carregamentos e recargas. Não há necessidade de copiar lógica da página antiga.

## Arquivos da 8B

| Arquivo | Mudança nesta etapa |
| --- | --- |
| `src/app/admin/usuarios/page.tsx` — criado | Página cliente de 20 linhas, com shell e conteúdo autorizado que reutiliza hook e gerenciador. |
| `src/components/admin/AdminShell.tsx` — modificado | Destino de usuários passa à nova rota; guarda de usuários exige Administrador ativo confirmado pelo Rails. |
| `src/app/admin/page.tsx` — modificado | Remove montagem/import antigos; atualiza navegação e atalhos; redireciona links legados e evita carga institucional para esses acessos. |
| `tests/api-client.test.ts` — modificado | Acrescenta quatro testes de autorização e configuração da navegação aos 45 testes da base. |
| `docs/ETAPA_8B_RELATORIO.md` — criado | Registra implementação, verificações, limitações e checklist. |

## Estrutura e reutilização

```text
/admin/usuarios
  AdminShell(activeSection="usuarios")
    verificação existente da sessão
    canAccessAdminUsers(session)
      UsersContent(session)
        useAdminUsers({ enabled: canAccessAdminUsers(session) })
        UserManager(management)
```

O shell só invoca seu filho funcional após autenticação e autorização da seção.
Assim, o conteúdo que usa o hook não é montado para uma sessão recusada.
O hook ainda recebe a mesma condição explícita de habilitação.

Há um único shell, com Sidebar, Topbar, breadcrumbs e comportamento responsivo
existentes. `activeSection="usuarios"` seleciona o item correto e inicia o
agrupamento Usuários e Acessos expandido. A página não importa `admin/page.tsx`,
não consulta `/api/data` e não carrega notícias, Kanban, projetos, FAQ, galeria
ou dados institucionais.

O `UserManager` da 8A permanece integralmente preservado: listagem, busca local,
Ativos, cadastro/associação de perfil, ativação/desativação, senha, exclusão,
CRUD de perfis, matrizes, exceções, validações, confirmações e mensagens.
Não foram adicionados nem removidos formulários ou operações.

## Integração Rails e autorização

Os serviços existentes não foram alterados:

| Fluxo | Contrato utilizado |
| --- | --- |
| Identidade atual | GET `/auth/me`, pelo shell; envelope com usuário e perfil atual. |
| Usuários | GET `/usuarios?page=1&per_page=50`; envelope paginado. |
| Perfis | GET `/perfis?page=all`; envelope paginado. |
| Cadastro/alteração de conta | POST `/usuarios` e PATCH `/usuarios/:id`; corpo de usuário com campos permitidos, respostas 201/200 com objeto direto. |
| Exclusão de conta | DELETE `/usuarios/:id`; 204. |
| CRUD de perfis | POST/PATCH com `{ perfil: ... }`, objetos diretos; DELETE com 204. |
| Matrizes e exceções | GET/PUT de `/perfis/:id/permissoes` e `/usuarios/:id/permissoes_extras`; PUT com lista final `{ regra_ids }`, 204. |

As operações continuam no componente original e usam `medtecApi`/`apiFetch`,
com Bearer JWT e autorização independente no Rails. Sucesso e recarga continuam
dependendo de resposta confirmada do backend. Não há endpoint novo, escrita
local, fallback de usuários, dados fictícios de produção ou mutação real de teste.

O contrato documenta que o perfil Administrador sempre possui todas as
permissões e é imutável. Não fornece uma matriz completa para outros perfis.
A guarda específica de usuários, compartilhada entre shell e nova página,
retorna verdadeiro somente com:

- `session.isGestor === true`, preservando a restrição administrativa anterior;
- `session.apiUser.ativo === true`;
- `session.apiUser.perfil_nome === 'Administrador'`, vindo da leitura de `/auth/me`.

Sessão local isolada, nome em `profileType`, IDs legados de usuário/perfil e
perfil operador não liberam a rota. Em particular, as heurísticas existentes
`id === 1`/`perfil_id === 3` do shell não bastam para administrar contas.
Essa diferença em relação à guarda legada `isGestor` é intencional e restrita
a usuários. Não foram alteradas as guardas dos outros módulos.

Não se presumem permissões de usuários para Gestor, Operador ou outros nomes.
Perfis diferentes de Administrador, inclusive eventuais delegações específicas,
permanecem bloqueados nesta nova guarda até validação oficial de sua matriz.
Não foi feita consulta autenticada à matriz de uma conta real, nem identificada
uma divergência real entre nome e permissões. Toda operação continua sujeita
a 401/403/422 do Rails, independentemente da interface.

O proxy existente continua exigindo a sessão administrativa Next.js; o shell
valida a identidade Rails para liberar usuários; o backend autoriza cada ação.
`proxy.ts`, `auth.ts`, login/logout, cookies, tokens e serviços de autenticação
não foram modificados. Não foram adicionados logs de dados pessoais ou tokens.

## Navegação, limpeza e KPIs

- O destino de usuários em `AdminShell.SECTION_CONFIG` é `/admin/usuarios`.
- A seleção da seção na Sidebar antiga usa `router.push('/admin/usuarios')`.
- Os dois atalhos da Visão Geral usam `Link` para a nova rota.
- `/admin?tab=usuarios` e `/admin?section=usuarios` usam `router.replace` para
  a subrota. A carga inicial antiga retorna antes das consultas globais nesses
  acessos, como já ocorria para Kanban. A nova rota não redireciona de volta.
- O import e o bloco de montagem antiga do `UserManager` foram removidos.
  Não havia outros estados/callbacks exclusivos de usuários a retirar da página;
  a 8A já havia eliminado a ligação com `loadData` após operações.
- `useAdminUsers`, `usersManagement`, `usersCountLabel`, a condição de acesso
  dos indicadores e os badges foram preservados na Visão Geral.
- Os KPIs continuam usando `pagination.total_count` do Rails, inclusive quando
  esse total excede os 50 itens carregados. Não usam `data.users` do JSON local.

A página principal passou de **4.013 para 4.009 linhas**, redução de quatro.
Não houve refatoração das demais seções. Os arquivos das sete subrotas foram
comparados com os hashes anteriores à 8B e permaneceram idênticos.

## Verificações

| Verificação | Resultado |
| --- | --- |
| TypeScript inicial | `npx tsc --noEmit` passou. |
| TypeScript após implementação | `npx tsc --noEmit` passou. |
| `npm test` | 49 testes em 13 suítes, todos passaram; execução ampliada para acesso ao executor tsx. |
| `npm run lint` | 12 erros e 49 avisos antes e depois. Comparação por arquivo, severidade e mensagem confirmou os mesmos diagnósticos, descontados números de linhas. |
| ESLint da nova página e testes | Passou sem diagnósticos. |
| ESLint incluindo AdminShell | Aponta os mesmos dois erros preexistentes de `set-state-in-effect` na verificação da sessão e no fechamento do drawer. |
| `git diff --check` | Passou. |
| `npm run build` | Turbopack bloqueado pela restrição local: `binding to a port`, `Operation not permitted`. |
| `npm run build -- --webpack` | Passou em execução ampliada; `/admin/usuarios` e as sete subrotas anteriores constam na saída. |
| `wc -l src/app/admin/page.tsx` | 4.009 linhas. |

Os quatro testes novos cobrem recusa de sessão local, recusa de operador mesmo
com IDs legados, exigência de Administrador ativo/restrição administrativa, e
destino/agrupamento do item no shell. Não substituem testes interativos ou
autenticados. Nenhum teste fez mutações reais.

O build Webpack registrou os avisos já existentes de conexão nas páginas
públicas de avisos, acervo, galeria e redes, além do aviso sobre o lockfile fora
do repositório. A compilação e sua etapa TypeScript concluíram com sucesso.

Também foram executados `git diff --stat` e `git status --short`. O diff do Git
é cumulativo com a 8A sem commit e não inclui o conteúdo dos arquivos não
rastreados. Não foi feito commit, descarte ou sobrescrita de alterações locais.

## Riscos e pendências

- Paginação continua como melhoria futura: busca e filtros cobrem somente os
  primeiros 50 usuários, enquanto os KPIs usam o total oficial.
- Autorização por operação é do Rails. A guarda visual é conservadora para
  perfis cuja matriz administrativa não está completamente documentada.
- O fallback de sessão local existente não habilita a nova rota sem identidade
  Rails confirmada. Problemas de sessão/JWT precisam ser resolvidos pelo fluxo
  de autenticação existente, que ficou fora do escopo.
- O hook completo foi mantido na Visão Geral para preservar seus indicadores;
  não foi criado outro hook nem otimizada a leitura de perfis nessa tela.
- A interface existente não oferece edição geral de nome/CPF nem troca de
  perfil de uma conta já cadastrada. Oferece edição de perfis e redefinição de
  senha; não foi criado um formulário de edição de usuário nesta etapa.
- Acesso direto autenticado, F5, histórico, responsividade e fluxos interativos
  aguardam a validação manual abaixo. Não houve inspeção em navegador nem
  teste ponta a ponta com contas reais.

## Checklist manual, sem mutações reais

- [ ] Abrir `/admin/usuarios` diretamente com uma sessão permitida.
- [ ] Atualizar com F5 e confirmar retorno à mesma rota e carregamento Rails.
- [ ] Conferir item selecionado, pasta Usuários e Acessos expandida, Topbar
  única e breadcrumbs Usuários e Acessos / Gerenciar Equipe e Senhas.
- [ ] Conferir acesso de Administrador ativo; conferir bloqueio para operador,
  sessão local isolada e perfil não confirmado pelo Rails, sem iniciar consultas
  de usuários/perfis nesses casos.
- [ ] Conferir GET de usuários/perfis e ausência de consultas institucionais
  ou de outros módulos no painel de rede da nova rota.
- [ ] Conferir carregamento, lista oficial, busca e Ativos, sem alterar contas.
- [ ] Conferir formulário de cadastro e seus perfis disponíveis, sem enviar.
- [ ] Abrir edição de perfil e modal de senha, sem salvar. Edição geral de
  usuário: não aplicável, pois esse formulário não existe na interface atual.
- [ ] Abrir e fechar os modais de matrizes/exceções, sem salvar permissões.
- [ ] Voltar para `/admin` pelo shell e conferir os KPIs com o total Rails.
- [ ] Abrir os dois atalhos de usuários da Visão Geral e o item da Sidebar.
- [ ] Abrir `/admin?tab=usuarios` e `/admin?section=usuarios`; confirmar destino
  `/admin/usuarios`, sem loops ou carga institucional anterior ao redirecionamento.
- [ ] Usar Voltar e Avançar entre a Visão Geral, usuários e outras subrotas.
- [ ] Conferir celular/tablet/desktop, Sidebar móvel e formulários sem salvar.
- [ ] Conferir falha de rede/401/403 em ambiente controlado, sem mensagens de
  sucesso indevidas e sem fallback local.
- [ ] Conferir acesso às sete subrotas anteriores.

Somente a Etapa 8B foi implementada. Próximas etapas aguardam validação do usuário.
