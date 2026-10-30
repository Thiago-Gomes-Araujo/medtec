# Etapa 9B — Subrota administrativa de FAQ

## 1. Diagnóstico inicial e preservação da base

Projeto confirmado por `pwd`: `/home/lennon/medtec-web`. Antes de editar,
`git status --short --branch` mostrou a branch `feature/integracao-rotas-noticias`
com as alterações da 9A ainda sem commit:

- Modificados: `src/app/admin/page.tsx` e `tests/api-client.test.ts`.
- Não rastreados: `src/components/admin/FaqModule.tsx` e
  `docs/ETAPA_9A_RELATORIO.md`.

Esses arquivos e alterações foram preservados. `FaqModule.tsx` e o relatório
9A não foram editados na 9B. A página principal começou com **3.394 linhas**.

Foram inspecionados a skill `medtec-architecture`, `AGENTS.md`, o relatório 9A,
o módulo, a página principal, `AdminShell`, as oito subrotas, tipos, handlers
de leitura e os contratos `ROTAS_FRONT.md`/`docs/ROTAS_FRONT_FULL.md`.
Foram consultados os guias locais do Next.js instalado sobre páginas,
Client Components e preservação de estado com Activity.

O módulo recebe três props: `faqs`, `viewMode` e `onViewModeChange`. Seus estados
de formulário, edição, busca, categoria e tags já eram internos. A página
principal fornecia `data.faqs`, controlava lista/editor e mantinha o módulo
oculto para preservar estado entre seções. Os atalhos também alteravam esse modo.

O identificador real da navegação é `duvidas`; o pedido também exige o alias
`faq`. A leitura administrativa era `GET /api/data`. Não há contrato Rails de
leitura ou escrita de FAQ nos documentos/serviços atuais. `/api/faqs` é um
handler público de compatibilidade que retorna lista vazia, portanto não pode
substituir a fonte administrativa. Esse diagnóstico foi apresentado antes de
alterar o código.

## 2. Arquivos criados e modificados na 9B

| Arquivo | Responsabilidade |
| --- | --- |
| `src/app/admin/faq/page.tsx` — criado | Shell autorizado, leitura própria, carregamento/erro, nova tentativa, modo lista/editor e composição do FaqModule. |
| `src/lib/admin-faq.ts` — criado | Leitura GET da fonte legada e resolução dos identificadores de links legados de FAQ. Não é serviço Rails nem hook duplicado. |
| `src/components/admin/AdminShell.tsx` — modificado | Destino da seção `duvidas` passa a `/admin/faq`. |
| `src/app/admin/page.tsx` — modificado | Remove montagem, modo e imports do FAQ; atualiza atalhos, seleção e compatibilidade; preserva indicadores. |
| `tests/api-client.test.ts` — modificado | Seis testes novos de montagem, links, leitura e falhas, preservando os 52 existentes. |
| `docs/ETAPA_9B_RELATORIO.md` — criado | Diagnóstico, implementação, verificações, limites e checklist. |

Nenhuma página das oito subrotas, componente público, arquivo de autenticação,
handler de API, serviço Rails ou arquivo de dados foi alterado. Uma comparação
de hashes dos arquivos existentes em `src` antes/depois da 9B apontou somente
`admin/page.tsx` e `AdminShell.tsx` como modificados, além dos arquivos novos.

## 3. Estrutura da nova rota

```text
/admin/faq
  AdminShell(activeSection="duvidas")
    verificação existente de sessão e autorização da seção
      FaqContent
        readAdminFaqs() → GET /api/data → somente faqs no estado local
        carregamento / erro com nova tentativa
        modo lista/editor local
        aviso sobre rascunhos em memória no editor
        FaqModule(faqs, viewMode, onViewModeChange)
```

O filho funcional do shell só é invocado após a autorização da seção. A nova
rota não importa a página principal nem chama seu `loadData`, `loadApiData`
ou carrega módulos editoriais. Usa um único shell com Sidebar, Topbar,
breadcrumbs e layout responsivo existentes.

A leitura tem cancelamento por `AbortController` e ignora resultados de uma
requisição cancelada. `null` indica que ainda não existe leitura válida;
`[]` representa uma lista vazia recebida com sucesso. Erro HTTP, rede,
JSON inválido ou coleção ausente/inválida são falhas explícitas, com nova
tentativa. Não são convertidos em lista vazia.

Uma recarga posterior preserva a última coleção válida e mantém o mesmo
`FaqModule` montado, inclusive diante de erro. Não há `key` que reinicie o
editor nem efeito que redefina seu modo automaticamente.

## 4. Fonte real dos dados e dependência legada

`readAdminFaqs` executa exclusivamente GET `/api/data`, com cache desabilitado,
e extrai `faqs` da resposta. Essa é a mesma fonte administrativa da 9A.
O formato dos registros continua sendo `FaqItem`, sem migração de dados.
A função verifica a resposta HTTP, o JSON e a presença da coleção; não foi
introduzido um novo saneamento de cada registro legado.

A rota renderiza shell, carregamento e erro independentemente da Visão Geral.
Para exibir os registros, ainda depende desse endpoint legado, que retorna uma
estrutura maior. O handler existente lê `getDatabase()` e pode também consultar
usuários Rails para gestores. Portanto, esta etapa remove a dependência do
carregamento da página principal, mas não transforma `/api/data` em uma leitura
exclusiva de FAQ. O handler e seus comportamentos legados permaneceram intactos.

Não se consultou `/api/faqs` como fallback, nem se usaram mocks ou dados locais
novos como fonte oficial. O portal público continua com seu handler vazio
existente, sem alteração nesta etapa.

## 5. Dependências removidas e preservação dos KPIs

Saíram da página principal o import de `FaqModule`/`FaqViewMode`, o estado
`faqViewMode`, seus setters nos atalhos e o contêiner `hidden` que mantinha a
montagem antiga. O modo agora pertence à nova rota.

Os KPIs e badges de FAQ continuam lendo `data.faqs` na Visão Geral. Sua fonte
não foi promovida artificialmente a um endpoint Rails. Os indicadores oficiais
Rails dos outros módulos, inclusive o total de usuários, não foram alterados.
Projetos, Banners e seus estados/callbacks permaneceram intactos.

## 6. Endpoints Rails e gravações

Os contratos e serviços atuais não oferecem endpoint oficial de FAQ para
leitura ou gravação. Não foi criada integração Rails nem endpoint local.
O `FaqModule` permanece integralmente igual ao da 9A: cadastro/edição são
rascunhos e prévia, envio fica desabilitado e exclusão apenas informa o bloqueio.
Os handlers não persistem alterações nem simulam sucesso.

Não foram introduzidos `persistData`, PUT `/api/data`, escrita em `db.json`,
localStorage, requisições não documentadas ou mutações reais de teste.

## 7. Permissões preservadas

A seção ativa continua sendo `duvidas`. O shell conserva sua regra existente:
`session.isGestor || session.profileType === 'Operador de Conteúdo'`.
Não foi liberado acesso para qualquer sessão autenticada nem criados novos
perfis ou permissões. O conteúdo e sua leitura só montam após essa guarda.

O proxy continua exigindo a sessão administrativa Next.js. O GET legado
continua validando a sessão no servidor. A validação JWT do shell e os fluxos
de autenticação existentes permanecem separados e inalterados. Quando houver
operações Rails oficiais de FAQ, elas precisarão de autorização por ação no
backend; não se presumiu uma matriz inexistente nesta etapa.

Não foram alterados `proxy.ts`, `auth.ts`, cookies, login/logout, JWT ou serviços
de autenticação. Não foram adicionados logs de dados pessoais ou credenciais.

## 8. Navegação e links legados

O item de FAQ em `AdminShell.SECTION_CONFIG.duvidas` abre `/admin/faq`.
A seleção pela Sidebar antiga encaminha à mesma rota; os dois atalhos da
Visão Geral agora são links para ela. O identificador `duvidas`, agrupamento
Publicações do Site, título e breadcrumbs foram preservados.

São reconhecidos e encaminhados com `router.replace`:

- `/admin?tab=duvidas`;
- `/admin?section=duvidas`;
- `/admin?tab=faq`;
- `/admin?section=faq`.

A carga antiga retorna antes das consultas globais nesses acessos. O resolver
usa a prioridade existente de `tab` sobre `section`; não captura outros módulos.
O destino não contém parâmetros legados e não redireciona de volta.

## 9. Comportamento dos rascunhos

Durante a montagem da nova rota, rascunho, filtros e modo ficam em memória
React. Recargas e falhas da leitura não desmontam o módulo que já recebeu
uma resposta válida. As ações internas continuam com as regras da 9A,
incluindo o reset intencional ao escolher Nova Dúvida.

O projeto usa `cacheComponents: true`. A documentação da versão instalada do
Next.js descreve preservação de algumas páginas com Activity e descarte após
o limite de retenção. Isso não é persistência de rascunhos. O editor informa:
“O rascunho fica apenas em memória e pode ser perdido ao sair desta rota ou
atualizar a página.”

Não há confirmação de saída, estado global, gravação local ou API de rascunhos.
Não se afirma preservação garantida entre rotas: o comportamento real de
Voltar/Avançar, descarte de páginas e F5 aguarda validação interativa. Ao ser
desmontado ou recarregado, o estado da rota é perdido.

## 10. Verificações

| Comando/verificação | Resultado |
| --- | --- |
| TypeScript inicial | `npx tsc --noEmit` passou. |
| TypeScript após implementação/testes | `npx tsc --noEmit` passou. |
| `npm test` | 58 testes em 15 suítes, todos passaram; execução ampliada para o executor tsx. |
| `npm run lint` inicial/final | 12 erros e 48 avisos, mesmos arquivos, severidades e mensagens, descontados deslocamentos de linhas. |
| ESLint da rota, helper e testes | Passou sem diagnósticos. |
| `git diff --check` | Passou. |
| `npm run build` | Turbopack bloqueado por `binding to a port`, `Operation not permitted`. |
| `npm run build -- --webpack` | Passou em execução ampliada; as nove subrotas, incluindo `/admin/faq`, constam na saída. |

Os seis novos casos verificam montagem do shell sem leitura restrita anterior
à autenticação, quatro aliases legados e isolamento dos outros módulos,
GET cancelável da coleção correta, lista vazia válida, erros 401/403/500/rede
e resposta inválida sem fallback. Os testes da 9A continuam verificando estado
vazio e bloqueio de envio. A montagem é testada com renderização estática e
contextos do App Router da versão instalada, sem credenciais ou chamadas reais.

Os testes de renderização não verificam o ciclo completo de efeitos e navegação
no navegador. Também foram executados `wc -l`, `git diff --stat` e
`git status --short`. O diff do Git acumula a 9A sem commit e não inclui
conteúdo de arquivos não rastreados. Não houve commit ou descarte de alterações.

O build Webpack concluiu também sua etapa TypeScript. Registrou os avisos já
existentes de conexão nas páginas públicas de avisos, acervo, galeria e redes,
além do aviso sobre o lockfile fora do repositório; essas páginas não foram
modificadas na 9B.

## 11. Linhas antes e depois

`src/app/admin/page.tsx`: **3.394 → 3.378 linhas**, redução de **16 linhas**
nesta etapa. A nova página tem 66 linhas e o helper de leitura/compatibilidade,
30. A redução vem da retirada da montagem e do estado antigos, sem compactar
ou mover código de outras seções.

## 12. Riscos e pendências

- A leitura ainda depende do GET administrativo legado e de sua estrutura
  completa; uma leitura exclusiva de FAQ exige um contrato futuro aprovado.
- Os registros continuam assumindo o formato `FaqItem` adotado anteriormente.
- A fonte pública vazia e a leitura administrativa legada continuam diferentes.
- Rascunhos podem se perder após saída, F5 ou descarte da página pelo framework.
- O redirecionamento legado segue o mecanismo cliente já usado no painel;
  seu comportamento no histórico precisa de validação manual.
- Permanecem os 12 erros/48 avisos preexistentes de lint e a restrição local
  do Turbopack. Não houve teste ponta a ponta autenticado ou inspeção visual.

## 13. Checklist manual, sem mutações reais

- [ ] Abrir `/admin/faq` diretamente com uma sessão autorizada.
- [ ] Atualizar com F5; conferir shell, carregamento e leitura independente.
- [ ] Conferir item FAQ selecionado, pasta Publicações do Site e breadcrumbs.
- [ ] Conferir listagem de perguntas/respostas e o total nos KPIs da Visão Geral.
- [ ] Conferir busca por pergunta, resposta, tag e índice e filtros de categoria.
- [ ] Abrir cadastro sem salvar; conferir campos, públicos e tags.
- [ ] Abrir edição sem salvar, quando houver registro; conferir campos e link.
- [ ] Conferir prévia em tempo real e aviso de rascunho em memória.
- [ ] Conferir lista vazia válida, falha de rede/401/403 e nova tentativa.
- [ ] Confirmar envio bloqueado e exclusão limitada ao aviso; não executar
  requisições reais de escrita para validar a migração.
- [ ] Testar Voltar/Avançar, retorno à Visão Geral e os dois atalhos.
- [ ] Testar os quatro links legados com `faq` e `duvidas`, sem loops.
- [ ] Conferir celular, tablet, desktop e Sidebar móvel.
- [ ] Digitar um rascunho, sair e retornar; registrar o comportamento de retenção
  do Next.js sem presumir recuperação. Repetir com F5 e após visitar outras rotas.
- [ ] Confirmar que gestor/Operador de Conteúdo mantêm o acesso existente e
  que perfis sem autorização não iniciam a leitura restrita pela nova página.
- [ ] Conferir as oito subrotas anteriores e seus indicadores oficiais Rails.

## 14. Recomendações para a próxima etapa

Após a validação da 9B, priorizar o contrato oficial de FAQ: leitura, formato,
permissões por ação, métodos e respostas de gravação. Somente então substituir
a fonte legada e habilitar persistência, alinhando administrador e portal público.

Se a recuperação de rascunhos entre rotas for necessária, definir requisitos
e uma solução aprovada separadamente. Não ampliar estado global nem adicionar
persistência local como efeito colateral desta migração.

Somente a Etapa 9B foi implementada. Próximas alterações aguardam validação.
