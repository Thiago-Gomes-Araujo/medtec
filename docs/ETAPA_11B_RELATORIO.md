# Etapa 11B — Rota independente de Banners

## 1. Diagnóstico inicial

Confirmados `pwd` em `/home/lennon/medtec-web` e `git status --short --branch`.
Foram lidos `AGENTS.md`, a skill `medtec-architecture`, o relatório da 11A,
os guias locais de páginas e Server/Client Components do Next.js instalado,
o gerenciador, o shell, as dez subrotas, os tipos, serviços e contratos.

Já existiam mudanças das etapas 10B e 11A em `admin/page.tsx`,
`SitePhotosManager.tsx`, `AdminShell.tsx` e testes, além de relatórios, rota e
helper de Projetos não rastreados. Todas foram preservadas. A cópia inicial e
os hashes de `src` estão em `/tmp/medtec-11b-baseline`.

O diagnóstico foi apresentado antes de editar: `SitePhotosManager` já reunia
formulários, carrossel, simulador e prévia. O pai fornecia dados de GET
`/api/data` e `saving`. A seleção de arquivo iniciava POST `/api/upload` e
só depois acionava o alerta de persistência bloqueada. Não havia contrato
Rails de Banners. A navegação usava a seção `fotos`, inclusive para Curador de
Fotos, e um atalho na Visão Geral. Os KPIs dependiam da leitura compartilhada.

## 2. Arquivos criados e modificados nesta etapa

| Arquivo | Mudança |
| --- | --- |
| `src/app/admin/banners/page.tsx` — criado | Shell autorizado, leitura própria, carregamento, erro, nova tentativa e composição do gerenciador. |
| `src/lib/admin-banners.ts` — criado | Tipos reduzidos, leitura legada validada, links legados e preparação de imagem exclusivamente local. |
| `src/components/SitePhotosManager.tsx` | Seleção de Banners passa a prévia local sem upload; estado, erro e informação explícita de indisponibilidade. |
| `src/components/admin/AdminShell.tsx` | Destino de `fotos` passa a `/admin/banners`. |
| `src/app/admin/page.tsx` | Retira montagem antiga e estado exclusivo; atualiza atalho, seleção e compatibilidade. |
| `tests/api-client.test.ts` | Oito testes novos e ajuste do rótulo da seleção no teste da 11A. |
| `docs/ETAPA_11B_RELATORIO.md` — criado | Diagnóstico, resultados, limites e checklist. |

A comparação de hashes dos arquivos existentes em `src` identificou somente
as três fontes modificadas acima. As dez subrotas anteriores e seus módulos,
autenticação, handlers, serviços de upload e dados permaneceram como estavam
no início da 11B. O diff convencional acumula também as etapas anteriores;
arquivos novos não rastreados não aparecem no seu conteúdo. Nenhum commit foi feito.

## 3. Estrutura da nova rota

```text
/admin/banners
  AdminShell(activeSection="fotos")
    sessão e autorização existentes
      BannersContent
        readAdminBanners(signal) → GET /api/data
        carregamento, erro e nova tentativa
        SitePhotosManager com dados reduzidos e saving=false
          carrossel, simulador e modal existentes
          seleção de banner → FileReader → prévia local
```

O conteúdo funcional é filho de função do shell e só monta após sua guarda.
Não há consulta restrita de Banners antes disso. Não foram duplicados Sidebar,
Header, Topbar ou breadcrumbs. Não foi criado outro módulo ou hook.
A nova página não importa a página principal nem seus estados/callbacks.

## 4. Dependências removidas da página principal

Saíram o import e a montagem de `SitePhotosManager`, a ramificação `fotos`
do renderizador CMS, o bloco de manutenção da seção e os estados `saving`
e `saveSuccess`. A função `persistData` não tinha chamadas no código e era
o único lugar que alterava esses estados. Foi removida junto com seu PUT
legado, sem conectar qualquer fluxo novo de escrita.

Os estados de dados e as leituras da Visão Geral permanecem, assim como os
KPIs de Banners e demais módulos. `savingCanais` e os handlers oficiais de
outros módulos não foram alterados. O identificador `fotos` continua na
configuração de navegação e nos breadcrumbs, mas não monta mais Banners no pai.

## 5. Fonte real dos dados

`readAdminBanners` faz um único GET `/api/data` por carga, sem cache e com
`AbortSignal`. Não carrega os serviços do dashboard. Valida HTTP, JSON,
envelope, imagens institucionais e os campos utilizados de cada coleção.
Retém apenas `banners`, `siteInfo.heroImage/studioImage`, identificação/título/
imagem de capas e fotos. Não armazena o banco completo no estado da rota.

`null` representa ausência de leitura válida; `banners: []` é vazio confirmado.
Falhas de rede, HTTP ou resposta inválida produzem erro explícito com nova
tentativa. Não são convertidas em lista vazia ou dados fictícios. O efeito
cancela sua leitura ao desmontar; uma falha posterior mantém a última leitura
válida e o componente montado.

O endpoint legado ainda devolve uma resposta ampla e pode consultar usuários
Rails para gestores. Isso é comportamento do handler existente, não uma
requisição adicional da nova página. A origem continua `getDatabase()` e
`src/data/db.json`; suas normalizações e fallback para dados iniciais continuam
no servidor. Não foi criado endpoint mais estreito nem outro fallback.

## 6. Situação da API Rails

`ROTAS_FRONT.md`, `docs/ROTAS_FRONT_FULL.md` e `src/lib/api` continuam sem
endpoints oficiais de Banners. Não existem métodos, payloads, respostas e
permissões Rails documentados no projeto para habilitar sua persistência.

Adicionar por URL, salvar links, ordenar e remover continuam limitados ao
alerta de gravação bloqueada, sem alterar a coleção ou alegar sucesso.
Não foram adicionados endpoints Rails, integração, PUT `/api/data`, escrita
em `db.json`, mocks oficiais ou localStorage de negócio.

## 7. Upload antes e depois

**Antes:** o seletor de Banners chamava `replace('banner-novo', ...)`, que
enviava `FormData` para POST `/api/upload`. Após receber uma URL válida,
o callback recusava a persistência. O arquivo podia ficar sem associação.

**Depois:** esse seletor chama `selectLocalBanner` e
`prepareLocalBannerPreview`. O arquivo é lido com `FileReader.readAsDataURL`
no navegador; não passa por `replace`, `upload`, `fetch` ou outro serviço de
envio. A imagem abre no modal existente e passa a ser a referência do simulador,
sem entrar na coleção persistida. Não é criado arquivo no servidor nesse caminho.

O seletor continua disponível. Seu rótulo informa prévia local e a leitura usa
“Lendo imagem...”. Um aviso explica que o envio está indisponível e que a imagem
local não foi salva nem publicada. Falhas de leitura são exibidas como erro.

## 8. Proteções implementadas e limite do escopo

- A seleção de Banners é sempre local enquanto a persistência continuar bloqueada;
  não há um parâmetro que habilite acidentalmente o upload nesse caminho.
- Aceita JPEG, PNG, WEBP ou AVIF com conteúdo e até 5 MB, alinhado aos limites
  de formato/tamanho do serviço existente. É validação para prévia local,
  sem afirmar validação de conteúdo pelo servidor.
- Cancelar a seleção mantém a prévia anterior. Seleções sucessivas possuem
  identificador local para evitar que uma leitura anterior substitua a mais nova.
- Data URLs ficam em memória e dispensam URLs de objeto e sua revogação.
- Nenhuma confirmação de envio, gravação ou publicação é simulada.

Os seletores de estúdio, capas de notícias e cartões da galeria presentes no
gerenciador continuam com seus fluxos anteriores de `replace` e upload.
O handler global `/api/upload`, destinos, formatos e uploads dos módulos
independentes não foram modificados, conforme o limite solicitado.
Não se afirma que todo seletor desta tela esteja sem envio: a proteção nova
é específica do seletor do carrossel de Banners. Os outros fluxos legados
continuam sujeitos ao risco anterior de associação, pendência separada.

## 9. Permissões preservadas

`activeSection="fotos"` reutiliza a regra existente do shell: gestor,
`Curador de Fotos` ou `Operador de Conteúdo`. Perfis sem acesso não montam o
conteúdo. Não foi liberado Banners para todo usuário autenticado.

Proxy, `auth.ts`, cookies, JWT, login/logout e serviços de autenticação ficaram
inalterados. A fonte legada mantém sua validação de sessão no servidor.
A autorização definitiva de operações Rails protegidas permanece no backend;
não foram inferidas permissões de escrita para um contrato inexistente.

## 10. Navegação e links legados

- Sidebar do shell: `SECTION_CONFIG.fotos.href = '/admin/banners'`.
- Sidebar da página principal: sua seleção de `fotos` navega à nova rota.
- Atalho “Trocar Banners da Home”: Link para `/admin/banners`.
- Entradas do Curador de Fotos que selecionavam a seção antiga agora encaminham
  à nova rota e retornam antes da carga global do dashboard.
- `/admin?tab=fotos` e `/admin?section=fotos` usam `router.replace`.
- As variantes `tab=banners` e `section=banners` mencionadas no pedido também
  encaminham para a mesma rota.

O resolver respeita a prioridade existente de `tab` sobre `section` e não
captura os identificadores de outras seções. A página antiga retorna antes
de sua carga global nesses links. O destino não redireciona de volta.
Agrupamento Publicações do Site, título e breadcrumbs continuam usando `fotos`.

## 11. Rascunhos e ciclo de vida

Campos de links, imagem local, simulador e modal pertencem ao gerenciador.
Interações internas não o recriam. Recargas e falhas posteriores da leitura
não o desmontam nem apagam a última coleção válida ou a prévia local.

A rota informa que esses dados existem apenas em memória e podem ser perdidos
ao sair ou atualizar a página. O framework pode reter uma página ao navegar,
mas pode também descartá-la. Não há garantia de recuperação após outra rota,
histórico ou F5. Não foram criados estado global, persistência local ou APIs
de rascunho. A validação manual do histórico permanece pendente.

## 12. Resultados dos testes e verificações

| Comando/verificação | Resultado |
| --- | --- |
| `npx tsc --noEmit` inicial/após implementação | Passou. |
| `npm test` | 78 testes em 19 suítes passaram, incluindo os oito novos. |
| `npm run lint -- --format json` inicial/final | 12 erros/46 avisos → 12 erros/44 avisos, sem novos diagnósticos. |
| `git diff --check` | Passou. |
| `npm run build` | Turbopack falhou por `binding to a port` / `Operation not permitted`. |
| `npm run build -- --webpack` | Passou e compilou as onze subrotas, incluindo `/admin/banners`. |
| `wc -l`, `git diff --stat`, `git status --short` | Executados; mudanças anteriores preservadas. |

Os testes novos verificam montagem antes da autorização sem requisições,
destino/grupo da Sidebar, links legados e prioridade de parâmetros, GET
cancelável com projeção dos dados, vazio confirmado e erros HTTP/rede/
cancelamento/JSON/registros inválidos sem fallback.

A ação de preparação local usada pelo seletor é executada com um arquivo
sintético e `FileReader` controlado: comprova leitura local, geração da imagem
da prévia e **zero chamadas a `fetch`**, abrangendo upload e gravação.
O resultado também é renderizado no simulador existente. Há testes de seleção
cancelada, tipo/tamanho inválidos e falha de leitura. Os testes anteriores
preservam a cobertura estática dos controles e bloqueio de gravação.

São testes isolados/de renderização estática, sem navegador autenticado; não
simulam o diálogo nativo ou os cliques completos. A ligação do input ao handler
local foi revisada no código e aguarda a conferência Network do checklist.
Não foi realizado upload ou mutação real. A execução da suíte e do Webpack
usou ampliação do sandbox, sem alterar configuração ou dependências.

Os avisos removidos eram `saveSuccess` e `persistData` sem uso. A comparação
de lint considerou arquivo, regra, severidade e mensagem, descontando localização
e contexto de linhas movidas. O Webpack ainda registrou os avisos anteriores
de lockfile externo e conexão das páginas públicas de avisos, acervo, galeria
e redes; concluiu sua verificação de tipos e a geração das páginas.

Subrotas compiladas: `/admin/banners`, `/admin/noticias`, `/admin/kanban`,
`/admin/usuarios`, `/admin/faq`, `/admin/projetos`, `/admin/avisos`, `/admin/galeria`,
`/admin/redes`, `/admin/institucional` e `/admin/estados-cidades`.

## 13. Linhas antes e depois

`src/app/admin/page.tsx`: **2.204 → 2.170 linhas**, redução de **34 linhas**.
A nova rota possui 62 linhas e o helper 86. A redução decorre da montagem
removida, estados exclusivos e função morta associada, compensada pelos
encaminhamentos necessários. Não houve compactação ou refatoração geral.

## 14. Riscos e pendências

- A leitura permanece legada e o endpoint ainda responde dados mais amplos.
- O leitor do servidor possui normalização/fallback anterior; a nova página
  não consegue distinguir uma resposta desse fallback de dados originais.
- A home pública continua usando `/hero.jpg` fixo, sem consumir `banners`.
  Prévia administrativa não comprova publicação no site.
- Não há contrato Rails ou persistência de Banners, nem ordem gravada.
- Outros seletores de imagem foram preservados e podem enviar arquivos;
  não devem ser usados com envio liberado nesta validação sem mutações.
- Navegação, F5, diálogo nativo, prévia interativa e responsividade ainda
  dependem do checklist manual. Os erros de lint anteriores permanecem.

## 15. Checklist manual — sem uploads ou mutações reais

- [ ] Acessar `/admin/banners` diretamente com perfil permitido e conferir
  bloqueio para perfil sem acesso.
- [ ] Usar F5 e conferir autorização, carregamento independente e dados.
- [ ] Conferir Sidebar selecionada, agrupamento, título e breadcrumbs.
- [ ] Conferir coleção recebida e estado vazio, sem confundir imagem de
  referência do simulador com um banner persistido.
- [ ] Simular falha de leitura de forma controlada; conferir erro e nova
  tentativa sem fallback da página ou perda da última leitura válida.
- [ ] Abrir prévia dos banners existentes e testar simulador desktop/mobile,
  tela cheia e fechamento.
- [ ] Selecionar imagem somente em “Selecionar banner para prévia local”.
  Conferir prévia, aviso de não salvo/publicado e ausência de POST de upload
  na aba Network. Para máxima garantia durante a revisão, interceptar qualquer POST.
- [ ] Selecionar outra imagem, cancelar seleção e testar arquivo inválido;
  conferir erro claro e preservação da última prévia válida.
- [ ] Não selecionar arquivos nos controles de estúdio/capas/galeria com
  envio liberado: esses mecanismos foram preservados e ainda fazem upload.
- [ ] Conferir que salvar link, adicionar URL, ordenar e remover apenas
  informam gravação bloqueada, sem mutações ou mensagens falsas de sucesso.
- [ ] Digitar nos campos e interagir internamente sem perder estado; sair,
  voltar e atualizar, observando o aviso de possível perda em memória.
- [ ] Testar os quatro links legados de `fotos`/`banners`, sem loops.
- [ ] Testar Voltar/Avançar e o atalho da Visão Geral.
- [ ] Conferir celular, tablet, desktop e menu móvel.
- [ ] Conferir os KPIs da Visão Geral e as dez subrotas anteriores, sem
  realizar gravações ou uploads reais.

## 16. Recomendações para a Etapa 12

Após validar a 11B, auditar a Visão Geral e suas dependências reais: indicadores,
fontes de dados, permissões, atalhos e navegação ainda duplicada. Separar
responsabilidades com reaproveitamento dos componentes existentes, sem migrar
fontes ou corrigir globalmente o lint como efeito colateral.

Antes de qualquer futura publicação de Banners, confirmar contrato Rails,
associação de imagens, permissões e consumo público em uma etapa própria.
Manter o envio bloqueado até existir uma operação de persistência suportada.

Somente a Etapa 11B foi implementada. A Etapa 12 aguarda validação do usuário.
