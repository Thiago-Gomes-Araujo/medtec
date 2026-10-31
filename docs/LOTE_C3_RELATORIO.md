# Lote C3 — Dúvidas de visitantes

**Frontend C3 implementado — homologação real pendente do merge do backend.**

## Escopo e endpoints

Implementação conforme `ROTAS_NOVAS_AVISOS_DUVIDAS.md`, consultado em
`/home/lennon/Downloads/ROTAS_NOVAS_AVISOS_DUVIDAS.md`. Não foi exigida nem
consultada a disponibilidade real das novas rotas.

| Método | Endpoint | Resposta |
| --- | --- | --- |
| GET | `/d_duvidas_visitante` | Envelope com `data.items` e `data.pagination` |
| GET | `/d_duvidas_visitante/:id` | Objeto direto com os detalhes |
| PATCH | `/d_duvidas_visitante/:id/responder` | Objeto direto; requisição sem corpo |
| DELETE | `/d_duvidas_visitante/:id` | 204 sem conteúdo |

Todos usam `apiFetch` e o Bearer do usuário conectado. Não há credenciais
administrativas compartilhadas ou persistência alternativa.

## Interface e arquivos

- Novo `src/components/admin/DuvidasVisitanteModule.tsx`: listagem, detalhes,
  filtro de situação, paginação, marcação de atendimento e exclusão confirmada.
- Modificado `src/app/admin/faq/page.tsx`: nova aba Visitantes, montada somente
  quando selecionada. C1/C2 e o rascunho de dúvidas recorrentes permanecem.
- Modificado `src/lib/api/services/duvidas.service.ts`: quatro métodos novos;
  as implementações C1/C2 existentes foram preservadas.
- Modificado `src/lib/api/types.ts`: DTO oficial `DDuvidaVisitante`.
- Modificado `src/lib/api/index.ts`: expõe `medtecApi.duvidasVisitante`.
- Modificado `tests/api-client.test.ts`: imports e 50 testes novos ao final,
  sem reorganizar o arquivo ou alterar os testes anteriores.
- Novo este relatório.

Reutilizados cliente HTTP, erros, contratos de paginação, `AdminShell`,
navegação interna e padrões visuais do FAQ. Nos testes, reutilizado o executor
de componentes já existente, sem alterar seu funcionamento.

O filtro Todas omite os predicados; Não respondidas envia somente
`q[respondida_false]=1`; Respondidas envia somente `q[respondida_true]=1`.
A troca de filtro reinicia a página. Paginação usa `page`, `per_page` e os
totais oficiais, sem filtrar apenas os registros da página atual.

Detalhes são consultados por ID antes de abrir. Telefone e metadados de
atendimento nulos não são substituídos por dados inventados. A situação,
o atendente e a data de atendimento vêm exclusivamente do objeto recebido.

**Marcar como respondida apenas registra atendimento externo.** A interface
explica que o contato é feito fora do sistema por e-mail ou telefone.
Não há envio automático de e-mail, mensagens ou resposta fictícia.

Exclusão exige confirmação. Sucesso de escrita recarrega a página/filtro
vigente, ajustando a última página quando necessário. Falhas preservam o
registro e mostram erro sem sucesso falso. Recarga com falha após escrita
confirmada não repete a escrita. Há proteção contra respostas obsoletas,
desmontagem e operações concorrentes.

## Segurança e permissões

A guarda do FAQ foi preservada integralmente, sem ampliação de perfis.
As regras específicas das operações de visitantes ainda não são identificadas
na matriz oficial disponível. Não foi inventada autorização por nome de perfil,
IDs ou heurísticas. Os controles são tentativas sujeitas à autorização Rails;
sua presença não confirma permissão. A visibilidade por ação depende de
homologação posterior. Erros 401/403/404/422 e de rede são apresentados sem
alteração artificial do registro nem confirmação de operação recusada.

Autenticação, proxy, dashboard, Notícias, Avisos, Kanban e integrações públicas
não foram modificados. Comparações SHA-256 confirmaram a preservação dos 16
arquivos monitorados, incluindo os componentes C1/C2. O serviço anterior foi
comparado como prefixo, descontando apenas o novo import de tipo.

## Validação

| Verificação | Resultado |
| --- | --- |
| Baseline | 761 testes aprovados |
| C3 + regressões C1/C2 direcionadas | 154 testes aprovados |
| Novos testes C3 | 50 aprovados |
| Suíte completa | 811 aprovados, nenhuma falha |
| `npx tsc --noEmit --incremental false` | Aprovado |
| Lint global antes/depois | 10 erros e 34 avisos; diagnósticos idênticos |
| `git diff --check` | Aprovado |
| `npm run build` | Falha ambiental: download de Inter/JetBrains Mono do Google Fonts |
| Visual | Prévias HTML locais em desktop, celular e tema escuro |

Os testes cobrem os quatro endpoints, Bearer, filtros, paginação, DTO/envelope,
nulos, vazio, detalhes, marcação sem corpo, exclusão 204 e confirmação,
401/403/404/422/rede, repetição de leitura, ausência de sucesso fictício,
preservação de C1/C2, concorrência, Strict Mode e desmontagem.

Execução com o CLI `tsx` já presente no cache npm, usando `--test`; a execução
direcionada usou `Visitantes C3|Categorias de Dúvidas C1|Dúvidas C2|C1 preserva`.
Lint comparado por arquivo, regra, severidade e mensagem. Nenhuma dependência
foi instalada. Todas as requisições de teste foram interceptadas; nenhuma
escrita real foi realizada. Prévias visuais e dados sintéticos ficam em `/tmp`
e nos testes, sem mocks permanentes na aplicação. A conferência de prévias
não substitui a homologação da API ou a validação completa em navegador.

## Estado do Git e pendências

Branch inicial/final: `feature/refatoracao-admin-etapa-12`.
HEAD inicial/final: `c3a5a49`, mais recente que o HEAD informado no pedido.
A árvore começou limpa. Ao concluir: cinco arquivos rastreados modificados
e dois arquivos novos, listados acima. Não houve commit ou push.

- [ ] Homologar as quatro rotas após merge do backend.
- [ ] Confirmar permissões e visibilidade por ação com a matriz oficial.
- [ ] Conferir filtros, detalhes, marcação e exclusão com o próprio usuário.
- [ ] Validar atendente/data retornados e recusas de autorização.
- [ ] Concluir o build em ambiente com acesso às fontes.

A API não foi homologada. Lote D não iniciado; aguarda autorização do usuário.
