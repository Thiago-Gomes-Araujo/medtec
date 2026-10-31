# Lote D — FAQ público e envio de dúvidas

**Frontend Lote D implementado — homologação real pendente do merge do backend.**

## Endpoints e contratos

| Método | Endpoint | Contrato utilizado |
| --- | --- | --- |
| GET | `/publico/d_duvidas` | Envelope paginado com perguntas, respostas e categorias |
| GET | `/publico/d_categorias_duvida` | Array não paginado em `data`, somente `nome` e `slug` |
| POST | `/publico/d_duvidas_visitante` | HTTP 201; envelope de sucesso com `data: null` |

As três operações reutilizam `apiFetch`, com `skipAuth: true` e
`credentials: 'omit'`. Nenhum Bearer ou cookie administrativo é enviado.
Um erro público 401 não aciona refresh, retry ou encerramento de sessão.
Não são usadas credenciais administrativas compartilhadas.

Busca, categoria e paginação são enviados em `busca`, `categoria`, `page`
e `per_page`. A busca procura na pergunta, conforme o contrato. Não há
filtragem apenas dos registros da página atual nem contagens inventadas
por categoria. O total vem de `data.pagination.total_count`.

O POST seleciona exclusivamente `nome`, `email`, `telefone` opcional e
`descricao`, sob `d_duvida_visitante`. Telefone vazio é omitido. A confirmação
usa a mensagem de sucesso da API; não inventa protocolo nem envio de e-mail.

## Páginas e componentes

- Modificados `src/app/faq/page.tsx` e `src/app/duvidas/page.tsx`: usam o mesmo
  `FaqCentralSection`, sem injetar uma coleção local de FAQ.
- Modificado `src/components/FaqCentralSection.tsx`: leituras públicas,
  categorias dinâmicas, busca global por pergunta, paginação e acordeão acessível.
- Novo `src/components/DuvidaVisitanteForm.tsx`: envio anônimo, validação
  acessível, erros 422/429, confirmação e bloqueio de envios concorrentes.
- Modificados `src/lib/api/services/duvidas.service.ts`, `src/lib/api/types.ts`
  e `src/lib/api/index.ts`: DTOs públicos e `medtecApi.duvidasPublicas`,
  preservando as implementações administrativas anteriores.
- Modificado `tests/api-client.test.ts`: 51 testes novos e opção anônima no
  executor de interface existente; nenhum teste anterior foi reorganizado.
- Novo este relatório.

Mantidos cabeçalhos, rodapés, metadados e padrões visuais das páginas.
O bloco central conserva busca, categorias e acordeões. Conteúdo fixo de
respostas e filtros antigos de persona/tags/feedback foram retirados desta
interface porque não fazem parte do contrato público. Não há dependência de
FAQ local, JSON, `/api/data` ou mocks permanentes na aplicação.

Carregamento, vazio confirmado e indisponibilidade são distintos. Perguntas
e categorias têm leituras, falhas e repetição independentes. O formulário
continua disponível se uma dessas leituras falhar. Respostas obsoletas e
desmontagem não substituem a consulta vigente.

Nome, e-mail válido e descrição são obrigatórios. Erros locais usam
`aria-invalid` e `aria-describedby`; o resumo recebe foco após falha sem
interromper a correção dos campos. O estado pendente desabilita o formulário
e bloqueia requisições concorrentes. Erros preservam os valores; 422 mostra
as mensagens do Rails e 429 orienta aguardar um minuto. Não há retry automático
do POST nem envio ao montar/reexibir o formulário.

## Legado e preservação

A busca localizada encontrou `/api/faqs` somente como leitura de
`FaqCentralSection`, além da menção em `src/lib/admin-faq.ts`. O componente
também é envolvido por `FaqSection`, que continua compatível e passa a usar
as mesmas leituras públicas. Não há mais consumidor de `/api/faqs` identificado
no código do frontend após a migração. O endpoint foi preservado, sem excluir
arquivos compartilhados nem presumir ausência de consumidores externos.

Comparações SHA-256 confirmaram a preservação dos 18 arquivos monitorados,
incluindo painel gestor, C1/C2/C3, autenticação, proxy, Notícias, Avisos e o
handler `/api/faqs`. O serviço administrativo anterior foi preservado como
prefixo, descontando apenas o novo import dos tipos públicos.

## Validação

| Verificação | Resultado |
| --- | --- |
| Baseline | 811 testes aprovados |
| Novos testes do Lote D | 51 aprovados |
| Suíte completa | 862 aprovados, nenhuma falha |
| `npx tsc --noEmit --incremental false` | Aprovado |
| Lint global comparado ao baseline | 10 erros e 34 avisos; diagnósticos idênticos |
| `git diff --check` | Aprovado |
| `npm run build` | Falha ambiental no download de Inter/JetBrains Mono |
| Visual | Prévias HTML locais em desktop, celular e tema escuro |

Testes executados com o CLI `tsx` já em cache, usando `--test` e, na execução
direcionada, `--test-name-pattern='FAQ público Lote D'`. Não foram instaladas
dependências. O lint foi comparado por arquivo, regra, severidade e mensagem.
Todas as requisições dos testes são interceptadas; nenhuma escrita real foi feita.

A cobertura inclui as três rotas, paginação/filtros, categorias sem IDs,
formulário válido e inválido, telefone opcional, 422/429, rede, vazio,
indisponibilidade, ausência de Bearer/cookies/refresh, isolamento da sessão,
acessibilidade de foco e acordeão, prevenção de duplicatas e preservação
dos lotes anteriores. As prévias usam dados sintéticos somente em `/tmp`
e nos testes; não representam homologação da API ou fluxo completo em navegador.

## Git e homologação

Branch inicial/final: `feature/refatoracao-admin-etapa-12`.
HEAD inicial/final: `fa98d9f`, mais recente que a referência informada no pedido.
A árvore começou limpa. Estado final: sete arquivos rastreados modificados
e dois novos, listados acima. Não houve reset, clean, stash, commit ou push.

- [ ] Após merge do backend, homologar listagem, categorias e envio anônimos.
- [ ] Confirmar filtros/paginação e categorias ativas em `/faq` e `/duvidas`.
- [ ] Validar POST 201 com `data: null`, mensagens 422 e limite 429.
- [ ] Conferir ausência de Bearer/cookies mesmo com usuário administrativo conectado.
- [ ] Confirmar recebimento dos envios no C3 após implantação.
- [ ] Concluir o build em ambiente com acesso às fontes do Google.

A API não foi homologada. Nenhuma tarefa adicional foi iniciada; aguarda autorização.
