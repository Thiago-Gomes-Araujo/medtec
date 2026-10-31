# Lote C2 — CRUD e aprovação de dúvidas recorrentes

**Frontend C2 implementado — homologação real pendente do merge do backend.**

## Entrega

O módulo `/admin/faq` passa a usar o contrato Rails de Dúvidas, substituindo
a leitura legada `/api/data` e o editor com persistência desabilitada.
A aba Categorias, seu componente e seus cinco métodos do C1 foram preservados.
Não há dependência de endpoints implantados para validar esta implementação.

| Método | Endpoint | Contrato |
| --- | --- | --- |
| GET | `/d_duvidas` | Envelope paginado |
| GET | `/d_duvidas/:id` | Objeto direto para edição |
| POST | `/d_duvidas` | Objeto direto, 201 |
| PATCH | `/d_duvidas/:id` | Objeto direto, 200 |
| DELETE | `/d_duvidas/:id` | 204 sem corpo |
| PATCH | `/d_duvidas/:id/publicar` | Objeto direto, sem corpo de requisição |
| PATCH | `/d_duvidas/:id/reprovar` | Objeto direto, sem corpo e sem motivo |
| PATCH | `/d_duvidas/:id/despublicar` | Objeto direto, sem corpo de requisição |

Criação e edição serializam exclusivamente `d_categoria_duvida_id`, `pergunta`
e `resposta`, sob a raiz `d_duvida`. Autor, situação, motivo, tags, personas
e links não são enviados, mesmo que uma chamada JavaScript passe campos extras.
As situações `aguardando`, `reprovada` e `publicada` são lidas da API.
O resultado de edição/revisão não é presumido pelo botão acionado.

A interface oferece busca por pergunta, filtros por categoria e situação,
paginação, cadastro, edição, confirmação de exclusão e decisões editoriais.
Filtros usam `q[pergunta_cont]`, `q[d_categoria_duvida_id_eq]` e
`q[n_status_noticia_slug_eq]`, com `page` e `per_page`. São aplicados no backend,
sem filtragem local da página recebida. Aplicar ou limpar filtros retorna à página 1.

O formulário reutiliza `medtecApi.categoriasDuvida.list({ page: 'all' })` do C1.
Falhas do catálogo não apagam a listagem de dúvidas. Ao retornar da aba Categorias,
o catálogo é atualizado e o rascunho da dúvida permanece montado.
Não há duplicação do CRUD de categorias nem reutilização do Kanban de Notícias.

Operações bem-sucedidas recarregam a lista com os filtros vigentes. A exclusão
do último item da última página ajusta a paginação. Erros preservam o formulário
ou a confirmação e não produzem sucesso fictício. Falha de recarga após escrita
confirmada é informada separadamente, sem repetir a escrita. Requisições obsoletas,
desmontagem e envios concorrentes são tratados.

## Arquivos

- `src/lib/api/types.ts`: DTO, input e situações oficiais de Dúvidas.
- `src/lib/api/services/duvidas.service.ts`: oito métodos novos; C1 intacto.
- `src/lib/api/index.ts`: exporta `medtecApi.duvidas`.
- `src/components/admin/FaqModule.tsx`: formulário e gerenciamento Rails;
  campos legados incompatíveis foram retirados deste módulo administrativo.
- `src/app/admin/faq/page.tsx`: monta o módulo autenticado e conserva a aba C1.
- `tests/api-client.test.ts`: 60 testes novos, três testes legados adaptados
  à migração e reaproveitamento do executor de interface C1.
- Este relatório.

## Autenticação e permissões

Reutilizados `apiFetch`, Bearer do usuário, `ApiError`, contratos de paginação,
`AdminShell`, catálogo C1 e padrões visuais existentes. Não há credenciais
compartilhadas, persistência alternativa ou mocks na aplicação.

A guarda do FAQ permanece inalterada: gestor ou `Operador de Conteúdo`.
`AuthUser` não informa permissões por operação. As estruturas de perfil/extras
disponíveis usam módulos e regras, mas o contrato de Dúvidas não identifica
seus IDs ou ações na matriz. Portanto, não foram inventadas regras por perfil.

**Pendência de visibilidade:** os controles são tentativas sujeitas à autorização
Rails; sua presença não confirma permissão. Sua apresentação considera a situação
do registro, sem conceder permissão por isso. Respostas 403 exibem a recusa sem
alterar dados ou mostrar sucesso. A visibilidade por permissão efetiva deve ser
validada após identificar as regras oficiais. Login, logout, refresh, proxy e
guarda do Shell não foram alterados.

## Validação

| Verificação | Resultado |
| --- | --- |
| Baseline | 701 testes aprovados |
| Direcionados C2 + migração + regressões C1 | 107 aprovados |
| Suíte completa | 761 aprovados, nenhuma falha |
| TypeScript sem emissão/incremento | Aprovado |
| Lint global | 10 erros e 34 avisos; mesmos diagnósticos do baseline |
| `git diff --check` | Aprovado |
| `npm run build` | Falha ambiental no download de Inter e JetBrains Mono |
| Visual | Prévias HTML locais em desktop, celular e tema escuro |

Executados testes com o CLI `tsx` já em cache, sem instalar dependências,
usando `--test` e o padrão direcionado `Dúvidas C2|FAQ administrativo migrado|Categorias de Dúvidas C1|C1 preserva`.
TypeScript: `npx tsc --noEmit --incremental false`.
Lint comparado: `npm run lint -- --format json`, por arquivo, regra, severidade e mensagem.

As 60 adições cobrem os oito endpoints, filtros, paginação, corpos permitidos,
reprovação sem motivo, situações oficiais, categorias C1, vazio, 401/403/404/422,
rede, formulários, confirmação, recarga, concorrência, Strict Mode e desmontagem.
Os 44 testes C1 continuam aprovados. Os três testes antigos do editor desabilitado
foram adaptados explicitamente ao novo contrato; não foram descartados.

Todas as requisições dos testes foram interceptadas. Não houve consultas nem
escritas reais no backend. Prévias visuais usam dados sintéticos somente em `/tmp`
e não constituem homologação da API ou validação completa em navegador.

## Git e próximos passos

Branch inicial/final: `feature/refatoracao-admin-etapa-12`; HEAD: `22a2628`.
Comparações SHA-256 confirmaram a preservação dos 16 arquivos monitorados,
incluindo dashboard, Shell, gerenciador C1, autenticação, proxy, Avisos,
serviço de Notícias e Kanban. O bloco do serviço de categorias C1 foi preservado.
Estado final: dez arquivos rastreados modificados e quatro não rastreados,
incluindo as alterações anteriores. Não houve commit, push, reset, stash ou clean.

- [ ] Após merge do backend, homologar as oito rotas com o próprio usuário.
- [ ] Confirmar matriz oficial e visibilidade das ações por permissão.
- [ ] Verificar criação publicada/aguardando e edição de reprovada pelo autor.
- [ ] Homologar filtros, categorias, decisões, exclusão e recusas de autorização.
- [ ] Concluir o build com acesso às fontes.

A API não foi homologada. C3 não iniciado; aguarda autorização e validação do usuário.
