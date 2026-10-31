# Lote C1 — Categorias de Dúvidas

**Implementação frontend concluída — homologação real pendente do merge do backend.**

## Escopo e contrato

Implementação conforme `ROTAS_NOVAS_AVISOS_DUVIDAS.md`, consultado em
`/home/lennon/Downloads/ROTAS_NOVAS_AVISOS_DUVIDAS.md`.
Nenhum endpoint do backend foi consultado para concluir esta entrega.
Não há exigência de disponibilidade antes do merge de `feature/avisos`.

| Método | Endpoint | Resposta utilizada |
| --- | --- | --- |
| GET | `/d_categorias_duvida` | `data.items` e `data.pagination` oficiais |
| GET | `/d_categorias_duvida/:id` | Objeto direto para edição |
| POST | `/d_categorias_duvida` | Objeto direto, 201 |
| PATCH | `/d_categorias_duvida/:id` | Objeto direto, 200 |
| DELETE | `/d_categorias_duvida/:id` | 204 sem corpo; erro 422 se houver dúvidas vinculadas |

POST/PATCH usam a raiz `d_categoria_duvida` com os campos contratuais
`nome`, `slug` e `ativo`. Na criação, nome é obrigatório, slug vazio é
omitido para geração pelo servidor e o formulário inicia ativo. O serviço
também aceita a omissão de slug/ativo, conservando os padrões do Rails.
A ativação/desativação envia somente `ativo` por PATCH.

## Arquivos e reutilização

- Novo: `src/lib/api/services/duvidas.service.ts`, serviço de categorias com
  os cinco métodos, cancelamento das leituras e validação das respostas usadas.
- Novo: `src/components/admin/DuvidaCategoriesManager.tsx`, listagem paginada,
  formulários, ativação/desativação, confirmação de exclusão e erros/sucesso.
- Modificado: `src/lib/api/types.ts`, DTO e input oficiais de categorias;
  os tipos de Avisos do Lote B foram preservados.
- Modificado: `src/lib/api/index.ts`, expõe `medtecApi.categoriasDuvida`.
- Modificado: `src/app/admin/faq/page.tsx`, aba Categorias dentro da guarda
  existente. A leitura legada das dúvidas não bloqueia a nova aba.
- Modificado: `tests/api-client.test.ts`, 44 testes C1, mantendo os anteriores.
- Novo: este relatório.

Reutilizados `apiFetch`, `ApiError`, `ApiResponse`, `PaginatedData`,
`PaginationMeta`, `QueryParams`, `AdminShell` e o vocabulário visual do painel.
`FaqModule` e o editor legado permanecem intactos; o rascunho das dúvidas
é preservado ao alternar para a aba Categorias. Nenhum CRUD de dúvidas foi
implementado, e não existe persistência alternativa de categorias em
`/api/data`, JSON, localStorage ou listas sintéticas na aplicação.

## Autenticação e permissões

As chamadas utilizam o Bearer do usuário pelo cliente HTTP existente,
sem `skipAuth` nem credenciais administrativas compartilhadas. Login,
logout, refresh, proxy e a arquitetura de sessão não foram alterados.

A guarda do FAQ continua sendo a do `AdminShell`: gestor ou perfil
`Operador de Conteúdo`. Não foi ampliada para novos perfis.

O projeto representa regras por `ModuloPermissoes.regras` (`acao`,
`marcada`) e `ModuloPermissoesExtras.regras` (`do_perfil`, `extra`).
O contrato novo não identifica o módulo/regras correspondentes às
operações de categorias. Portanto, não foi inventada uma matriz por perfil,
IDs ou nomes de ações para conceder permissões no frontend.

**Limitação de visibilidade:** os controles são apresentados a quem já tem
acesso à rota FAQ. A presença de um controle não confirma autorização para
a operação: a decisão efetiva permanece no Rails. Erros 403 são exibidos e
não produzem atualização local nem sucesso fictício. Após o merge, é preciso
confirmar a matriz efetiva para ajustar a visibilidade por ação em outro lote.

## Estados e integridade

Carregamento, vazio confirmado e falha são distintos. As operações são
serializadas, e os envios concorrentes não duplicam a criação. Formulários
abertos bloqueiam ações que descartariam seu conteúdo sem salvar/cancelar.
Falhas de gravação preservam o formulário; erro 422 ao excluir preserva a
categoria e mostra a mensagem recebida. Não são removidos itens otimisticamente.

Sucesso de escrita solicita uma nova listagem da página atual. Se a exclusão
esvaziar a última página, consulta-se a última página válida. Se a recarga
falhar após escrita confirmada, o sucesso e a falha de leitura são apresentados
separadamente; a escrita não é repetida. Respostas de operações desmontadas
não disparam recargas, e leituras canceladas/obsoletas não alteram a lista.

## Validação executada

| Verificação | Resultado |
| --- | --- |
| Baseline da suíte | 657 testes aprovados |
| Testes C1 isolados | 44 aprovados |
| Suíte completa final | 701 aprovados, nenhuma falha |
| `npx tsc --noEmit --incremental false` | Aprovado |
| Lint global JSON antes/depois | 10 erros e 34 avisos; diagnósticos idênticos |
| `git diff --check` | Aprovado |
| `npm run build` | Falha ambiental: download de Inter/JetBrains Mono do Google Fonts |
| Conferência visual | Prévias estáticas locais em desktop, celular e tema escuro |

Testes executados pelo CLI do `tsx` já disponível no cache npm,
`/home/lennon/.npm/_npx/69f9afb961c37556/node_modules/tsx/dist/cli.mjs`,
com `--test` e, na execução isolada, o padrão
`Categorias de Dúvidas C1|C1 preserva`. Nenhuma dependência foi instalada.

Os testes simulam todas as requisições e cobrem os cinco endpoints, Bearer,
paginação, opcionais, vazio, formato inválido, 401/403/404/422, rede,
formulário inválido, recargas, exclusão com vínculo, concorrência, desmontagem,
Strict Mode e a guarda do FAQ para cinco perfis. Nenhuma escrita real foi feita.
As prévias visuais são artefatos de teste em `/tmp`, com dados sintéticos,
sem acrescentar mocks à aplicação e sem homologar a API ou o fluxo em navegador.

## Git e preservação

Branch inicial/final: `feature/refatoracao-admin-etapa-12`.
HEAD inicial/final: `22a2628`. Sem commit ou push.
O estado inicial tinha sete arquivos modificados do Lote B; todos foram
preservados. O C1 acrescenta mudanças em `admin/faq/page.tsx`, `api/index.ts`,
`api/types.ts` e testes, além dos três arquivos novos listados acima.

Comparações SHA-256 confirmaram a preservação dos 12 arquivos monitorados,
incluindo `admin/page.tsx`, `AdminShell`, Avisos públicos, CRUD de Avisos,
cliente HTTP, serviço de autenticação, tokens e helper de retorno administrativo.

## Homologação após implantação

- [ ] Confirmar disponibilidade das cinco rotas após merge do backend.
- [ ] Verificar permissões por operação com perfis permitidos e proibidos.
- [ ] Validar listagem alfabética, paginação e geração de slug pelo Rails.
- [ ] Criar, editar, ativar e desativar uma categoria usando o próprio usuário.
- [ ] Conferir exclusão 204 e bloqueio 422 com dúvidas vinculadas.
- [ ] Conferir mensagens 401/403/404/422, recarga e ausência de sucesso falso.
- [ ] Concluir o build em ambiente com acesso às fontes.

A API não foi homologada. Lote C2 não iniciado; depende de autorização.
