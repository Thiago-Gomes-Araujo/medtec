# Etapa 9A — Componentização do FAQ administrativo

## 1. Auditoria e diagnóstico anterior

Projeto confirmado por `pwd`: `/home/lennon/medtec-web`. O comando
`git status --short --branch` mostrou a branch `feature/integracao-rotas-noticias`
com árvore limpa. A página administrativa tinha **4.009 linhas**.

Foram consultados `AGENTS.md`, a skill `medtec-architecture`, os guias locais
do Next.js instalado sobre Client Components e preservação de estado, a página
administrativa, os tipos de FAQ, os componentes/páginas públicos, os handlers
de leitura existentes e `ROTAS_FRONT.md`/`docs/ROTAS_FRONT_FULL.md`.
O diagnóstico e a estratégia de montagem foram apresentados antes de editar.

O FAQ estava dividido entre estados e handlers no topo de `admin/page.tsx` e
um bloco de aproximadamente 560 linhas dentro de `renderCmsModule('duvidas')`.
Esse bloco reunia categorias, filtros, cards, editor e prévia. Os estados no
componente pai sobreviviam à troca de seções internas.

A fonte administrativa é `data.faqs`, recebida de `GET /api/data`. Esse GET
administrativo lê a estrutura existente por `getDatabase()`. Os contratos Rails
atuais e os serviços em `src/lib/api` não documentam CRUD de FAQ. Salvar já
estava desabilitado; os handlers de salvar/excluir apenas explicavam o bloqueio.
Não existiam modais de edição/confirmação próprios do FAQ: há editor na página,
prévia e alertas de indisponibilidade.

Havia textos contraditórios prometendo publicação imediata, apesar do bloqueio.
Foram corrigidos somente esses textos e as referências a caminhos hipotéticos
de endpoints, preservando a apresentação e as ações existentes.

## 2. Arquivos criados e modificados

| Arquivo | Responsabilidade |
| --- | --- |
| `src/components/admin/FaqModule.tsx` — criado | Interface, estados locais, handlers, categorias, filtros e prévia do FAQ. |
| `src/app/admin/page.tsx` — modificado | Compõe o módulo, fornece FAQs/modo de visualização e preserva sua montagem; remove a implementação extraída. |
| `tests/api-client.test.ts` — modificado | Três testes pontuais de renderização do FAQ. |
| `docs/ETAPA_9A_RELATORIO.md` — criado | Auditoria, resultados, limitações, checklist e plano recomendado para 9B. |

Nenhum componente público, tipo compartilhado, serviço, backend, arquivo de
autenticação, Sidebar ou página das oito subrotas foi alterado. A comparação
dos hashes de todos os arquivos existentes em `src` apontou somente a mudança
em `src/app/admin/page.tsx`, além do componente novo.

## 3. Estrutura do FaqModule

O componente é cliente porque mantém formulários e eventos React. Não possui
efeitos, consultas HTTP ou mecanismo de persistência. Reutiliza `FaqItem` e
`FaqCategory` de `src/types/index.ts`; exporta `FaqViewMode` para o controle
compartilhado do modo de visualização. Não foi criado outro hook.

```text
FaqModule
  estados locais e handlers do FAQ
  categorias e busca derivadas da coleção recebida
  aviso de gravação indisponível
  navegação lista/editor
  lista, filtros e estado vazio
  formulário com envio bloqueado
  prévia em tempo real
```

As classes estáticas e dinâmicas do bloco visual original foram comparadas com
as do componente extraído. Não há classes novas ou removidas de layout; foram
retiradas somente duas marcações `font-mono` dos caminhos hipotéticos no aviso.

## 4. Estados e handlers extraídos

Passaram ao módulo:

- `editingFaq` e seu setter;
- `faqSearchTerm` e `selectedFaqCategory`;
- `faqTagsInput`;
- `emptyFaqForm`, `faqForm` e seu setter;
- `handleNewFaq`, `handleEditFaq`, `handleDeleteFaq`,
  `handleToggleFaqPersona` e `handleSaveFaq`;
- opções de categoria, cores de badges e cálculo de `filteredFaqs`.

O novo cadastro mantém o índice sugerido pela quantidade de FAQs, os públicos
iniciais e as tags existentes. A edição mantém a cópia dos arrays e do link,
evitando alterar a coleção recebida durante a digitação. A lista é derivada
das props, sem outro estado que duplique os dados da página.

O parâmetro `_id` do handler de exclusão foi retirado porque não era usado:
esse handler continua apenas informando que a operação está indisponível.

## 5. Dados e props que permanecem na página

O módulo recebe somente:

| Prop | Tipo | Origem/finalidade |
| --- | --- | --- |
| `faqs` | `FaqItem[]` | `data.faqs || []`, preservando a leitura administrativa atual. |
| `viewMode` | `FaqViewMode` | Estado `faqViewMode`, compartilhado com os atalhos da Visão Geral. |
| `onViewModeChange` | `(mode: FaqViewMode) => void` | Setter do mesmo estado, usado pelo módulo. |

O modo lista/editor foi mantido no pai porque os dois atalhos existentes também
o selecionam. Não há dois estados para esse modo. O módulo não recebe
`DatabaseSchema`, `setData`, `loadData` ou funções de gravação.

O carregamento institucional, o tratamento existente de sua falha, os KPIs de
FAQ e a autorização `canAccessFaqs` permanecem na página principal. Não foram
inventados estados de carregamento/erro independentes para uma consulta que
o módulo não executa.

## 6. Situação real da integração Rails

Não foram encontrados endpoints oficiais de CRUD de FAQ nos contratos atuais.
Não foi criada integração Rails nesta etapa. O módulo não importa `medtecApi`,
não executa fetch e não grava em `/api/data`, `db.json` ou localStorage.

O GET local `/api/faqs`, utilizado pelo componente público, é um handler de
compatibilidade que retorna uma lista vazia e informa a pendência no backend.
As páginas públicas `/faq` e `/duvidas` fornecem lista inicial vazia e o
`FaqCentralSection` consulta esse GET. Isso difere da leitura administrativa de
`data.faqs`; não foi unificado ou alterado nesta extração.

Os avisos agora mencionam suporte oficial do backend sem sugerir nomes de
rotas inexistentes. O botão de envio permanece desabilitado, e mesmo uma
submissão programática encontra um handler que só impede o envio e alerta
sobre o bloqueio. Excluir continua exibindo o alerta, sem remover registros.
Não há mensagem de sucesso ou mutação simulada.

## 7. Funcionalidades e permanência da montagem

Permanecem listagem, categorias, busca por pergunta/resposta/tag/índice, filtro
por categoria, cards com públicos/tags/link, criação e edição de rascunhos,
validação HTML dos campos obrigatórios, cancelamento e prévia. A responsividade,
ícones, cores e organização visual foram mantidos.

A página mantém `FaqModule` montado para quem possui `canAccessFaqs` e oculta
seu contêiner com `hidden` quando outra seção interna está selecionada. Não há
`key` de remontagem nem efeito que limpe o formulário ao alternar seções.
Assim, rascunho, busca e filtros permanecem em memória, como antes da extração.
O conteúdo oculto não fica disponível na navegação por teclado.

Os atalhos da Visão Geral continuam escolhendo a lista, como no código original.
A navegação normal pela Sidebar preserva o modo anterior. A perda de estado
ao recarregar a página ou ao descartar sua montagem não foi substituída por
persistência local.

## 8. Limitações mantidas e limpeza da página

Salvamento e exclusão oficiais continuam indisponíveis. O editor permite somente
rascunho e prévia; o cartão que dizia “Disponibilidade Imediata” agora explica
“Prévia sem publicação”. Não foram acrescentadas ações ou modais.

O FAQ continua na seção `duvidas` e na navegação atual. `/admin/faq` não foi
criada. Breadcrumbs, Sidebar, atalhos e oito subrotas existentes não mudaram.
O renderer compartilhado deixou de conter FAQ; `duvidas` saiu apenas de
`CmsSubTab`, permanecendo em `AdminSection` e nos controles de navegação.

Foram retirados os estados/handlers exclusivos transferidos, os imports dos
tipos de FAQ e o import de `ArrowUpRight` que passou a ser usado no novo módulo.
Todos os estados e callbacks de Projetos, Banners e demais seções permaneceram.

## 9. Verificações

| Comando/verificação | Resultado |
| --- | --- |
| TypeScript inicial | `npx tsc --noEmit` passou. |
| TypeScript após extração e testes | `npx tsc --noEmit` passou. |
| `npm test` | 52 testes em 14 suítes, todos passaram; execução ampliada para o executor tsx. |
| `npm run lint` inicial | 12 erros e 49 avisos. |
| `npm run lint` final | 12 erros e 48 avisos; removido o aviso do `_id` não utilizado do antigo handler FAQ. A comparação não identificou novos diagnósticos. |
| ESLint do módulo e arquivo de testes | Passou sem diagnósticos. |
| `git diff --check` | Passou. |
| `npm run build` | Turbopack bloqueado pela restrição local: `binding to a port`, `Operation not permitted`. |
| `npm run build -- --webpack` | Passou em execução ampliada; as oito subrotas anteriores constam na saída e `/admin/faq` está ausente. |

Os testes novos verificam o estado vazio com aviso de indisponibilidade, a
renderização dos dados recebidos e o botão de envio bloqueado com prévia sem
promessa de publicação. Não houve inclusão de dados fictícios em produção,
operações de escrita reais ou testes apenas para aumentar contagem.

O build Webpack também concluiu sua etapa TypeScript. Registrou os avisos já
existentes de conexão nas páginas públicas de avisos, acervo, galeria e redes,
além do aviso sobre o lockfile fora do repositório. Essas páginas não foram
alteradas pela extração.

Também foram executados `wc -l`, `git diff --stat` e `git status --short`.
Os arquivos novos permanecem não rastreados e seu conteúdo não aparece no
`diff --stat` convencional. Não foi feito commit.

## 10. Linhas antes e depois

`src/app/admin/page.tsx`: **4.009 → 3.394 linhas**, redução de **615 linhas**.
`FaqModule.tsx` tem 654 linhas, com estados, handlers, tipagem e interface
legível. A redução decorre da transferência de responsabilidades, sem compactar
artificialmente o código ou mover conteúdo de outras seções.

## 11. Riscos e pendências

- A leitura administrativa continua dependente de `GET /api/data` e da guarda
  global do painel. Sua falha pode manter o carregamento global existente;
  não foi redesenhado o tratamento de erros institucionais.
- O portal público ainda recebe uma lista vazia do handler de compatibilidade,
  enquanto o administrador lê a estrutura legada. A futura fonte oficial precisa
  resolver essa diferença, sem substituição silenciosa de dados.
- Tipos e filtros continuam assumindo registros válidos com os campos definidos
  em `FaqItem`; não houve uma migração ou saneamento de dados nesta etapa.
- A preservação vale para a mesma montagem do painel; não há garantia de
  recuperação de rascunho após F5 ou descarte da página.
- Não foram executados testes interativos em navegador. Os testes de
  renderização não verificam digitação, troca de seções ou preservação de estado
  no ciclo de vida React; esses casos estão no checklist abaixo.
- Os 12 erros restantes de lint e a restrição local do Turbopack permanecem.

## 12. Checklist de validação manual

- [ ] Abrir FAQ pela Sidebar, pelos dois atalhos e pelos links legados da seção
  `duvidas`; conferir que a navegação e breadcrumbs permanecem atuais.
- [ ] Conferir quantidade de FAQs nos cards, na Sidebar e na lista, usando os
  mesmos dados de leitura existentes.
- [ ] Conferir busca por pergunta, resposta, tag e índice, filtros pelo select
  e pelas categorias rápidas, incluindo ausência de resultados.
- [ ] Abrir Nova Dúvida; conferir índice sugerido, categoria, públicos iniciais,
  tags, campos obrigatórios e prévia durante a digitação.
- [ ] Abrir edição de uma FAQ existente, quando houver; conferir campos,
  públicos, tags e link, sem salvar nem alterar a coleção exibida.
- [ ] Com um rascunho digitado, alternar para outra seção interna e retornar
  pela Sidebar; conferir preservação do modo, campos, busca e categoria.
- [ ] Voltar pela Visão Geral usando um atalho; conferir retorno à lista,
  conforme o comportamento anterior.
- [ ] Conferir abas lista/editor, Voltar para a Lista e Cancelar.
- [ ] Confirmar envio desabilitado, aviso visível e exclusão limitada ao alerta;
  conferir ausência de requisições de escrita no painel de rede.
- [ ] Conferir no celular, tablet e desktop a lista, filtros, formulário,
  prévia e Sidebar, sem mudança de layout.
- [ ] Conferir autorização administrativa existente e ausência do FAQ oculto
  na navegação por teclado quando outra seção estiver aberta.
- [ ] Conferir os KPIs da Visão Geral e navegação das oito subrotas anteriores.
- [ ] Não realizar mutações reais para validar esta extração.

## 13. Plano técnico recomendado para 9B

Após validação desta etapa, confirmar o objetivo da 9B e definir a fonte de
leitura da futura página independente. O GET público `/api/faqs` atualmente
vazio não pode substituir silenciosamente `data.faqs` do administrador.

Se autorizada a migração para `/admin/faq`, compor a nova página com `AdminShell`,
um estado local `FaqViewMode` e o mesmo `FaqModule`, mantendo a regra de acesso
existente e somente a leitura necessária. Atualizar então navegação e links
legados, preservando KPIs e compatibilidade da seção `duvidas`.

Manter criação/edição/exclusão sem gravação até existir contrato Rails oficial.
A integração futura deve confirmar autenticação, permissões, métodos, payloads,
validações e respostas antes de habilitar qualquer operação. Nenhum endpoint
ou fluxo de escrita é pressuposto por esta componentização.

A Etapa 9B não foi iniciada e aguarda validação do usuário.
