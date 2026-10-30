# Etapa 12A — Auditoria e isolamento dos dados da Visão Geral

## 1. Diagnóstico inicial

Confirmados `/home/lennon/medtec-web`, a branch
`` `feature/integracao-rotas-noticias` `` e a árvore limpa, com as etapas
anteriores commitadas. Não foi feito commit nesta etapa.

Foram lidos integralmente `src/app/admin/page.tsx`, a skill `medtec-architecture`,
`AGENTS.md`, o guia local de Server/Client Components do Next.js instalado,
o shell, os hooks de notícias/usuários, serviços, tipos, handler legado e
contratos `ROTAS_FRONT.md`/`docs/ROTAS_FRONT_FULL.md`. A cópia inicial e hashes
de `src` foram preservados em `/tmp/medtec-12a-baseline`.

O diagnóstico e o plano foram apresentados antes da edição. As responsabilidades
identificadas foram:

| Responsabilidade | Situação inicial e decisão |
| --- | --- |
| Dados e KPIs | Coleções Rails, contagens, total de usuários e dados legados misturados à página; extraídos para hook específico. |
| Interface do resumo | JSX inline, seis cards superiores e oito cartões de módulos; preservados na página. |
| Navegação | Sidebar própria, configurações, busca, atalhos e redirecionamentos; preservados. |
| Autenticação/autorização | Verificação Rails ou sessão administrativa, heurística de gestor e encaminhamento por perfil; continuam na página. |
| Estados compartilhados | Avisos e dados legados ainda usados por blocos antigos; mantidos com uma única fonte de estado e setters de compatibilidade. |
| Código legado | Renderizadores de Avisos/Galeria/Redes/Institucional/Estados e estados de seus formulários ainda têm referências; não removidos. |
| Dependências externas | Serviços Rails existentes, GET `/api/data`, roteador, tema e componentes existentes; sem dependência nova. |

Hooks iniciais: `useState`, `useEffect`, `useCallback`, `useSyncExternalStore`,
`useRouter`, `useEditorialNews` e `useAdminUsers`. Os dois últimos deixaram de
ser usados **somente nesta página**, substituídos por `useAdminOverview`.
Os hooks compartilhados e seus demais consumidores não foram modificados.

## 2. Inventário dos KPIs e resumos

Todos os elementos abaixo continuam em `AdminDashboardPage`, sem novo componente
visual. Sua Visão Geral só é mostrada quando a sessão existente é gestora e
`currentSection === 'visaoGeral'`. As autorizações Rails de leitura continuam
sendo verificadas pelo backend; o resumo não autoriza operações de gestão.

| Nome exibido / elemento | Fonte e campo utilizado | Transformação e total |
| --- | --- | --- |
| Notícias e Matérias — card superior, cartão de módulo e badge | Rails `/n_noticias`, `data.pagination.total_count` | Total oficial; antes era `items.length` de `page=all`. |
| “no ar” e “rascunhos” | Mesma leitura, `items[].status` | Conta `publicada` e `aguardando`, respectivamente; não inclui `reprovada` entre pendentes. |
| Fila de Aprovação — pendentes, texto e badge | Mesma contagem `status === 'aguardando'` | Reutiliza os dados de notícias; nenhuma leitura adicional de Kanban. O botão conserva a guarda de Administrador editorial. |
| Última publicação no ar | Primeiro item de `/n_noticias`: `titulo`, `data_publicacao`, `autor_nome` | Mantém a ordem recebida e a seleção anterior do primeiro item, sem novo filtro por status. |
| Avisos e Comunicados — card, cartão e badge | Rails `/a_avisos`, `data.pagination.total_count` | Total oficial; antes era `items.length` de `page=all`. |
| Avisos ativos | `items[].ativo` | Conta os ativos recebidos na coleção completa solicitada. |
| Classificados urgentes | `ativo` e `a_tipo_aviso.slug/nome` | Ativo e slug `urgente` ou nome contendo `urgente`, sem diferenciar maiúsculas; regra anterior preservada. |
| Último comunicado urgente ativo | Mesma coleção de avisos | Primeiro ativo urgente encontrado; se ausente, primeiro aviso; mesma regra e textos anteriores. |
| Galeria de Fotos — card, cartão e badge | Rails `/fotos_galeria`, `data.pagination.total_count` | Total oficial, com `page=1&per_page=1`; não usa quantidade recebida. |
| Categorias de acervo escolar | Rails `/categorias_galeria`, `data.pagination.total_count` | Total oficial, com página mínima. |
| Gerenciar Equipe e Senhas / operadores | Rails `/usuarios`, `data.pagination.total_count` | Total oficial preservado em card, cartão, link e badge; página mínima, sem armazenar lista de usuários. |
| Projetos Escolares / missões | GET legado `/api/data`, `projects` | Quantidade da coleção legada; sem contrato Rails de Projetos nesta etapa. |
| Municípios com práticas | `projects[].municipality` | `Set` dos valores recebidos, sem normalização nova. |
| Prática em destaque | `projects[0].title/school/municipality` | Primeiro registro e valores padrão de apresentação existentes. |
| Dúvidas Frequentes / dúvidas catalogadas | GET legado `/api/data`, `faqs` | Quantidade da coleção; não foi introduzido filtro de ativo. |
| Banners / banners ativos | GET legado `/api/data`, `banners` | Quantidade da coleção; o modelo não possui campo de ativação. Não há card superior separado de Banners. |
| Estados — somente badge da Sidebar | Rails `/g_estados`, `data.pagination.total_count` | Total oficial com página mínima; zero continua sem badge. Não há KPI de Estados no corpo do resumo. |

### Permissões e estados de apresentação

| Grupo | Permissão de interface | Carregamento | Erro | Zero confirmado |
| --- | --- | --- | --- | --- |
| Notícias / pendentes | Resumo gestor; botão Kanban exige a guarda editorial existente | “Carregando API...”, “Carregando...” ou “...” conforme o elemento; badges omitidos | “Indisponível” / texto de falha; badges omitidos | Mostra 0; “Nenhuma matéria cadastrada” e zero pendentes. |
| Avisos | Resumo gestor | Apresentações anteriores de carregamento; badge omitido | “Indisponível” / falha da API | Mostra 0; ativos/urgentes em zero e texto de ausência de urgente. |
| Galeria/categorias | Resumo gestor | Apresentações anteriores de carregamento; badge omitido | “Galeria Indisponível” ou texto de falha; categoria e fotos compartilham o erro desse KPI | Mostra 0 e “Nenhuma fotografia catalogada”. |
| Usuários | Resumo gestor; a rota de gestão conserva sua autorização própria mais restrita | `...` | “Indisponível”; badge omitido | Exibe 0, sem substituir por travessão ou tamanho da lista. |
| Projetos/FAQ/Banners | Resumo gestor, dados da leitura administrativa legada | Tela global aguarda dados legados | Falha legada agora tem mensagem explícita na mesma tela global | Coleções vazias mostram 0; textos vazios anteriores preservados. |
| Estados | Item de Sidebar de gestor | Sem badge até leitura válida | Sem badge, sem inventar zero | Badge omitido, como antes. |

Em recarga, a última leitura válida é retida em memória. Carregamento e erro
têm prioridade sobre o valor anterior nos elementos que já possuem essas
condições. Um erro não substitui silenciosamente dados válidos por `[]` ou 0.

Os textos “52 Municípios”, “4 trilhas de conhecimento” e “4 categorias” são
literais preexistentes, não KPIs consultados da API. Foram preservados, sem
inventar uma fonte oficial. Não há gráfico ou tabela dinâmica adicional no
resumo, nem KPI exibido de visualizações de notícias.

## 3. Endpoints e parâmetros após o isolamento

Todas as leituras de negócio usam os serviços existentes e GET:

| Endpoint | Parâmetros | Necessidade |
| --- | --- | --- |
| `/n_noticias` | `page=all` | Total, estados editoriais e primeiro registro. |
| `/a_avisos` | `page=all` | Total, ativos, urgentes e primeiro urgente. |
| `/fotos_galeria` | `page=1&per_page=1` | Apenas total oficial. |
| `/categorias_galeria` | `page=1&per_page=1` | Apenas total oficial. |
| `/usuarios` | `page=1&per_page=1` | Apenas total oficial; não consulta perfis. |
| `/g_estados` | `page=1&per_page=1` | Total do badge da Sidebar. |
| `/api/data` | GET com `cache: 'no-store'` | Projetos, FAQ, Banners e compatibilidade dos dados institucionais compartilhados. |

Autenticação conserva GET Rails `/auth/me` quando existe token e o fallback
administrativo GET `/api/auth`, conforme o fluxo anterior. Login/logout,
cookies, JWT, refresh e os serviços de autenticação não foram modificados.
DELETE de logout e a escrita de canais do bloco antigo continuam existindo,
mas não são disparados pelo carregamento nem pelos testes desta etapa.

## 4. Fonte oficial e validação dos totais

Os contratos documentam `data.items`, `data.pagination.total_count`, resposta
vazia com total 0, paginação e `page=all`. Os serviços não foram alterados.
Todos os totais Rails preparados pelo hook usam o metadado oficial, sem
fallback para `array.length`. Envelope sem sucesso, coleção inválida ou total
ausente, negativo, fracionário ou não numérico resulta em erro explícito.

O teste de paginação recebe **50 usuários e total oficial 120** e confirma 120.
Também verifica discrepâncias entre itens e total de notícias, avisos, fotos,
categorias e estados. Total 0 permanece válido e não ativa um valor alternativo.

Contagens por status e de ativos/urgentes mantêm as transformações anteriores
sobre a coleção solicitada com `page=all`. Não há novo endpoint agregado. Se
o backend não cumprir a coleção completa, esses subtotais representam os
itens recebidos; o total principal ainda conserva o metadado oficial. Isso
exige validação do contrato real, sem inventar subtotais de paginação.

Projetos/FAQ/Banners continuam legados. O handler `/api/data` usa `getDatabase()`
e conserva suas normalizações/fallbacks anteriores no servidor. A nova camada
valida o envelope mínimo utilizado e expõe falha HTTP/JSON/formato, sem adicionar
fallback ou migrar cada registro. O banco completo ainda é compartilhado com
o bloco institucional antigo; seus usuários não são fonte do KPI de equipe.

## 5. Carregamentos identificados e condicionados

Antes, uma carga gestora fazia dez leituras diretas de negócio: sete no
`loadApiData`, usuários e perfis no hook de gestão, e GET `/api/data`. Depois,
o resumo faz sete: seis serviços Rails e o GET legado. Essa contagem exclui
autenticação, refresh e chamadas internas do handler legado.

`useAdminUsers` carregava até 50 contas e todos os perfis, mas o resumo usava
somente o total. Foi retirado desta página, sem alterar sua implementação
ou a rota de Usuários. Não se consultam mais perfis ao abrir o resumo.

Tipos de aviso e canais não alimentam KPIs. As listas completas de fotos,
categorias e estados alimentavam formulários/listagens antigos; no resumo,
apenas seus totais são necessários. As leituras completas ficaram em um efeito
local condicionado à seção antiga, sessão confirmada e gestor. Os estados e
consumidores antigos continuam presentes, com carregamento próprio para a
Galeria. Avisos e dados legados continuam compartilhados, sem coleção duplicada.

Todos os caminhos de seleção e links que já encaminhavam às onze subrotas
continuam iguais. Não foi removido um componente antigo só por ser improvável
alcançá-lo pela navegação atual.

## 6. Duplicações e coordenação das requisições

Um carregador por instância compartilha a promessa em andamento. Chamadas
concorrentes autorizadas não iniciam outro conjunto de leituras; após concluir,
uma nova chamada pode atualizar os indicadores. A carga é paralela, com erro
isolado por grupo, sem bloquear os demais grupos por uma rejeição.

O hook não dispara leitura por efeito. A página o chama somente depois da
autenticação e do encaminhamento por perfil já existentes, passando a decisão
gestora confirmada naquele fluxo. A decisão negativa não inicia requisições.
Não há cache global ou compartilhamento de dados entre sessões.

Permanece uma duplicação indireta: GET `/api/data` pode consultar
`/usuarios?page=all` no servidor para gestores, além do contador oficial
consultado diretamente pelo resumo. Eliminar essa chamada exigiria alterar o
handler ou sua resposta compartilhada, fora desta etapa. Não foi usado o array
de usuários legado para evitar a consulta do total oficial.

A verificação de sessão da página continua com seus efeitos anteriores;
não se afirma eliminar repetições de autenticação em Strict Mode ou remount.
A deduplicação adicionada é das leituras de dados concorrentes do mesmo dono.

## 7. Arquivos criados e modificados

| Arquivo | Responsabilidade |
| --- | --- |
| `src/components/admin/useAdminOverview.ts` — novo | Estados, carregamento, erros, atualização, métricas e setters de compatibilidade de dados compartilhados. |
| `src/lib/admin-overview.ts` — novo | Leituras específicas do resumo, validação de totais/envelope, coordenação e preparação de indicadores; sem JSX. |
| `src/app/admin/page.tsx` | Usa o hook; mantém autenticação, permissões e interface; condiciona leituras dos blocos antigos e usa totais oficiais nos elementos existentes. |
| `tests/api-client.test.ts` | Sete testes novos de dados, autorização, paginação, erros e coordenação. |
| `docs/ETAPA_12A_RELATORIO.md` — novo | Inventário, decisões, validação e checklist. |

A comparação de hashes dos arquivos existentes em `src` identificou somente
`admin/page.tsx` alterado. Shell, onze subrotas, módulos, hooks compartilhados,
serviços, handlers, autenticação, dados e área pública ficaram intactos.
Arquivos novos permanecem não rastreados e não entram no `diff --stat` convencional.

## 8. Lógica extraída e remoções comprovadas

O hook concentra o carregamento do resumo, estados por grupo, preservação da
última leitura válida, totais oficiais, contagens editoriais/avisos, números
legados, municípios distintos e rótulo de usuários. Seu callback `reload`
permite atualização dos indicadores sem implementar uma ação visual nova.

Foram removidos da página os estados e preparações transferidos, o carregador
antigo substituído e os imports exclusivos dos hooks de gestão. Não foram
transferidos estados de Sidebar, tema, navegação, modal, sessão ou formulários.

Também foram retirados dois símbolos cuja ausência de consumidores foi
confirmada por todas as referências no arquivo: `isMounted` era atribuído
no efeito, mas nunca lido; `totalNewsViews` só era declarado e não aparecia em
qualquer indicador. O mapeamento `effectiveNews` era usado exclusivamente nesse
cálculo morto, portanto não é mais preparado para o resumo.

## 9. Dependências, permissões e interface preservadas

Auth Rails e sessão Next.js continuam distintos. As heurísticas gestoras,
o perfil editorial confirmado e os redirecionamentos de Editor/Curador/
Publicador continuam na página. A guarda Kanban continua exigindo o perfil
editorial Administrador; a rota de Usuários mantém sua guarda própria de
Administrador ativo confirmado, mais restrita que o acesso ao resumo.

Não foram alterados proxy, `auth.ts`, cookies, JWT, login/logout ou serviços
de autenticação. Não há ampliação de privilégios ou autorização Rails substituída
por contagem/checagem de frontend.

Uma comparação estrutural com o TypeScript instalado confirmou a mesma
sequência de classes JSX e destinos administrativos na página. Os textos JSX
normais permanecem iguais. A frase global de carregamento foi preservada em
uma expressão que, em caso de falha legada, exibe a mensagem de erro com
`role="alert"` na mesma posição e estilo. Isso evita a falha silenciosa anterior
sem redesenhar a tela. Não foi introduzido botão ou componente visual novo.

## 10. Código legado identificado e não removido

Permanecem `renderCmsModule`, os cinco blocos administrativos antigos e seus
imports/estados, a escrita de canais, o modal compartilhado, a configuração de
seções, o renderizador de Sidebar próprio e os redirecionamentos. Possuem
referências concretas e alguns compartilham dados/props; a avaliação de remoção
ou componentização pertence a uma próxima etapa autorizada.

A Sidebar duplicada em relação a `AdminShell`, ícones/imports já sinalizados
pelo lint e os demais diagnósticos anteriores não foram alvo de limpeza geral.
Não foram criadas rotas, endpoints ou persistência. Nenhum `persistData`, PUT
`/api/data`, escrita em JSON ou localStorage de negócio foi introduzido.

## 11. Resultados dos testes

| Verificação | Resultado |
| --- | --- |
| `npx tsc --noEmit` inicial e final | Passou. |
| `npm test` | 85 testes em 20 suítes passaram. |
| `npm run lint -- --format json` inicial/final | 12 erros/44 avisos → 12 erros/42 avisos; nenhum diagnóstico novo. |
| `git diff --check` | Passou. |
| `npm run build` | Turbopack falhou por `binding to a port` / `Operation not permitted`. |
| `npm run build -- --webpack` | Passou, incluindo verificação TypeScript e as onze subrotas existentes. |
| `wc -l`, `git diff --stat`, `git status --short` | Executados. |

Os sete testes novos cobrem: ausência de consultas antes da autorização e
montagem inicial; total oficial versus quantidade recebida; zero confirmado;
deduplicação e atualização posterior; carregamento com última leitura válida,
erros e isolamento por grupo; metadados inválidos sem fallback por tamanho;
falhas legadas HTTP/JSON/formato sem apagar resultados oficiais válidos.

As primeiras execuções detectaram fixtures sem o Content-Type JSON obrigatório
do cliente existente e uma expectativa que não considerava sua mensagem de
erro de rede. Corrigidos esses testes, a suíte passou sem alterar o protocolo
ou o tratamento do cliente. As requisições são interceptadas com respostas
sintéticas na suíte, sem upload ou mutação real.

O lint foi comparado por arquivo, regra, severidade e mensagem, descontando
linhas movidas/contexto. Os dois avisos removidos correspondem aos símbolos
sem consumidores descritos acima. A execução de testes usou ampliação do
sandbox para o executor tsx, sem mudança de dependências/configuração.

O Webpack passou em execução ampliada e registrou os avisos anteriores de
lockfile externo e falhas de conexão das páginas públicas de avisos, acervo,
galeria e redes. Essas páginas permaneceram intactas. Foram confirmadas na
saída `/admin/noticias`, `/admin/kanban`, `/admin/usuarios`, `/admin/faq`,
`/admin/projetos`, `/admin/banners`, `/admin/avisos`, `/admin/galeria`,
`/admin/redes`, `/admin/institucional` e `/admin/estados-cidades`.

## 12. Linhas antes e depois

`src/app/admin/page.tsx`: **2.170 → 2.108 linhas**, redução de **62 linhas**.
O hook possui 48 linhas e o helper específico 131. A redução resulta da
separação de dados, compensada pela carga condicional dos blocos antigos.
A interface inteira continua na página para a Etapa 12B.

## 13. Riscos e pendências

- Leituras legadas continuam com normalização/fallback do servidor; o cliente
  não consegue identificar que uma resposta válida veio desse fallback.
- A falha inicial legada ainda impede a montagem do resumo, mas agora é
  explicitada na tela existente. Não foi criada uma experiência visual de
  repetição; F5 ou uma futura ação de recarga poderão solicitar novamente.
- Notícias/Avisos ainda precisam de `page=all` para os subtotais atuais. A
  completude deve ser validada no backend real; não foram inventados filtros
  agregados para reduzir essas coleções.
- A consulta indireta de usuários no handler legado permanece.
- Os textos de “ativos” para FAQ/Banners e de última publicação mantêm suas
  limitações anteriores, sem uma nova interpretação de status.
- A home fixa e as integrações/escritas bloqueadas das etapas anteriores
  permanecem como estavam. Não foi iniciado trabalho de backend ou publicação.
- Leituras em andamento podem concluir após sair da página; não se criou
  cancelamento de serviços compartilhados ou infraestrutura global nova.
- Não foram feitos testes interativos autenticados, com contas reais ou de
  responsividade. O checklist abaixo permanece pendente.

## 14. Checklist manual, sem mutações reais

- [ ] Acessar `/admin` com conta gestora autorizada e conferir sessão e resumo.
- [ ] Conferir carregamento e totais oficiais; comparar usuários com
  `pagination.total_count`, mesmo com lista parcial.
- [ ] Conferir total e subtotais de Notícias e Avisos com `page=all` completo.
- [ ] Conferir fotos, categorias e badge de Estados pelos metadados oficiais.
- [ ] Conferir Projetos, municípios distintos, FAQ e Banners na leitura legada.
- [ ] Inspecionar Network: sete leituras diretas por carga autorizada, sem
  `/perfis`, `/a_tipos_aviso` ou `/canais_contato` no resumo; distinguir chamadas
  internas do servidor e verificações de sessão do navegador.
- [ ] Simular zero e falhas com respostas controladas; conferir diferença
  entre carregar, indisponibilidade e zero real, sem dados fictícios.
- [ ] Simular falha legada; conferir erro explícito na tela global e F5.
- [ ] Verificar atalhos de Notícias, Nova Notícia, Usuários, Avisos, Galeria,
  Projetos/Novo Projeto e Banners, sem gravar ou selecionar arquivos.
- [ ] Verificar FAQ, Kanban, Institucional, Redes e Estados/Municípios.
- [ ] Conferir Sidebar desktop/mobile, busca, breadcrumbs, tema e atalhos
  públicos sem mudança visual.
- [ ] Conferir celular, tablet e desktop.
- [ ] Se houver contas de teste autorizadas, conferir encaminhamento de
  Editor, Curador e Publicador, sem consultas de resumo para esses perfis.
- [ ] Conferir acesso negado e sessão expirada no fluxo já existente.
- [ ] Abrir as onze subrotas e conferir navegação/acesso, sem mutações ou uploads.

## 15. Recomendações para a Etapa 12B

Após validar a 12A, extrair o JSX do resumo com props tipadas baseadas nos
estados/indicadores preparados. Manter autenticação, guardas, links e classes
atuais. Avaliar separadamente os blocos antigos e a duplicação do shell,
confirmando consumidores antes de removê-los.

A eventual experiência de nova tentativa, a eliminação da consulta indireta
de usuários e um contrato agregado de estatísticas exigem escopo próprio.
Não misturar essa evolução visual com migração de fontes ou persistência.

Somente a Etapa 12A foi implementada. A Etapa 12B aguarda validação do usuário.
