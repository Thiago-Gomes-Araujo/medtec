# Etapa 11A — Auditoria e componentização de Banners

## 1. Diagnóstico inicial

Trabalho realizado exclusivamente em `/home/lennon/medtec-web`. Foram conferidos
`pwd`, `git status --short --branch`, `AGENTS.md`, a skill `medtec-architecture`,
o guia local de Server/Client Components do Next.js instalado, a página
administrativa, os componentes, tipos, serviços, contratos e consumidores públicos.

Já havia alterações locais da Etapa 10B em `admin/page.tsx`, `AdminShell.tsx`
e testes, além do relatório, rota e helper de Projetos não rastreados. Todas
foram preservadas. Uma cópia inicial e hashes dos arquivos de `src` foram
guardados em `/tmp/medtec-11a-baseline` para distinguir esta etapa das anteriores.

A interface de Banners já estava em `SitePhotosManager.tsx`: carrossel,
formulários de links, ordenação, remoção, seleção/upload, foto do estúdio,
capas de notícias e cartões da galeria. A página principal ainda compunha o
aviso de persistência bloqueada, o layout com simulador, a imagem de referência
e os comandos de prévia, e fornecia o banco completo ao componente.

O diagnóstico foi apresentado antes da edição. A estimativa de redução era
30–35 linhas; o resultado foi 26, mantendo props explícitas e legíveis.
Não havia justificativa para criar um segundo módulo de Banners.

## 2. Componentes identificados e reutilizados

- `SitePhotosManager`: único consumidor na página administrativa; reaproveitado
  como módulo completo, sem novo `BannersModule` ou hook.
- `BannerCarousel`, `PhotoSlot` e `FileButton`: componentes privados existentes,
  mantidos com seus formulários, validações e controles.
- `AdminLiveSimulator` e `AdminPreviewModal`: reutilizados sem alterar seu código.
  O renderizador privado de Banners permanece nesse componente compartilhado.

Não há ativação/desativação ou filtros específicos nesse módulo. `BannerItem`
contém `id`, `imageUrl`, `title` e `linkUrl`; a ordem é a posição no array.

## 3. Arquivos modificados e criados nesta etapa

| Arquivo | Alteração da 11A |
| --- | --- |
| `src/app/admin/page.tsx` | Substitui a composição antiga por props específicas; retira import exclusivo do simulador e comandos de prévia de Banners. |
| `src/components/SitePhotosManager.tsx` | Reúne aviso, simulador, prévia e bloqueio de gravação; deixa de receber `DatabaseSchema` e callbacks do pai. |
| `tests/api-client.test.ts` | Acrescenta três testes estáticos do gerenciador existente. |
| `docs/ETAPA_11A_RELATORIO.md` | Novo relatório e checklist. |

A comparação de hashes dos arquivos existentes em `src` identificou somente
os dois primeiros arquivos como alterados nesta etapa. `AdminShell.tsx`, as
dez subrotas, FAQ, Projetos, Notícias, Kanban, Usuários, serviços, dados,
endpoints, área pública e autenticação permaneceram como estavam no início.
O diff acumulado também contém a 10B, ainda sem commit.

## 4. Responsabilidades extraídas

O componente existente agora reúne o aviso de gravação bloqueada, a composição
responsiva de duas colunas, a escolha do primeiro banner para o simulador e
a imagem de referência quando a coleção está vazia. Também concentra o alerta
de escrita sem suporte e os comandos de abrir/fechar a prévia em tela cheia.

A página mantém a autorização, a montagem condicional na seção `fotos`, a
leitura compartilhada e os KPIs. A extração não inicia requisições adicionais.
O layout e os controles existentes foram preservados. Foi corrigida apenas a
frase que afirmava publicação imediata: upload não confirma publicação.

## 5. Estados, handlers e ciclo de vida

`busy`, upload, tratamento de erro, reordenação e campos temporários já eram
internos e continuam assim. A seleção da prévia de Banners agora usa
`previewBanner: BannerItem | null` no próprio gerenciador; antes usava o estado
de modal compartilhado da página. Esse estado compartilhado continua no pai
para Avisos, Galeria e Institucional.

Não foram duplicados estados de dados, adicionados efeitos de leitura ou
criados hooks. O callback de bloqueio foi transferido para dentro do componente;
as propostas de alteração continuam sendo recusadas, sem atualizar a coleção
ou mostrar sucesso. Não foi removido o código legado `persistData` da página,
fora desta extração; Banners não o chama.

## 6. Props e dependências compartilhadas

O contrato agora recebe apenas:

- `banners: BannerItem[]`;
- `siteInfo: Pick<SiteInfo, 'heroImage' | 'studioImage'>`;
- `news: Pick<NewsItem, 'id' | 'title' | 'coverImage'>[]`;
- `gallery: Pick<GalleryItem, 'id' | 'title' | 'imageUrl'>[]`;
- `saving: boolean`, preservando a dependência de estado já existente.

A página projeta explicitamente os campos de notícias e galeria e as duas
imagens institucionais. Não são transmitidos banco completo, usuários, projetos,
FAQ ou funções de persistência. Os tipos existentes são reutilizados, sem `any`
novo. As coleções continuam pertencendo à leitura compartilhada, evitando cópias
de estado e divergências dos indicadores da Visão Geral.

## 7. Fonte real dos dados e área pública

A fonte administrativa continua GET `/api/data`, autorizado pela sessão no
servidor, que lê `getDatabase()`/`src/data/db.json`. Para gestores, o handler
também pode consultar usuários Rails; isso não constitui integração de Banners.
O componente não faz leitura própria nem adiciona fallback.

O leitor legado já mescla valores iniciais, normaliza Banners e, se não houver
imagens válidas, pode fornecer um banner baseado na imagem principal. Em falhas
de leitura do arquivo, já retorna dados iniciais. A carga compartilhada da página
também já captura falhas silenciosamente e pode permanecer na tela de carregamento.
Essas limitações anteriores não foram introduzidas nem refatoradas aqui.

A busca de usos não encontrou consumidor público da coleção `banners`.
`src/app/page.tsx` usa `/hero.jpg` fixo no hero. A prévia administrativa é uma
simulação e não comprova publicação na home. Nenhuma página pública mudou.

## 8. Contrato Rails e bloqueio de gravação

Não foram encontrados endpoints oficiais de Banners em `ROTAS_FRONT.md`,
`docs/ROTAS_FRONT_FULL.md`, tipos ou serviços de `src/lib/api`. Portanto,
métodos, payloads, respostas e permissões Rails de Banners ainda não estão
documentados no projeto; não é possível inferir suporte a CRUD.

O bloqueio preexistente foi preservado: adicionar por URL, salvar link,
ordenar, remover e aplicar imagem apenas informam a indisponibilidade da gravação.
Não há confirmação falsa de persistência. O PUT legado `/api/data` ainda existe
no servidor, mas não foi alterado nem conectado a Banners. Nenhum endpoint,
serviço, escrita de dados, mock oficial ou persistência em localStorage foi criado.

## 9. Upload de imagens

Foi preservado o fluxo original: selecionar arquivo inicia POST `/api/upload`,
com `FormData` e campo `file`; a URL só é utilizada após HTTP OK e resposta com
`url`. `busy`, alerta de erro e limpeza do input permanecem. Não há segundo
serviço ou novo destino. O handler existente grava em `public/uploads` e mantém
sessão, CSRF, limite de 5 MB, validações de MIME/extensão/conteúdo e nome seguro.
Sua autorização existente exige sessão válida, sem acrescentar aqui uma regra
de gestor que o código do servidor não possui.

O upload já ocorria antes do callback de persistência bloqueada. Assim, um
arquivo pode ser enviado sem associação salva a um banner, estúdio, notícia
ou foto. Não existia bloqueio do upload nesse componente; não foi inventada uma
nova política nesta etapa. A gravação dos dados continua bloqueada depois do
upload confirmado. Nenhum upload real foi executado para validar a mudança.

## 10. Permissões e navegação

A guarda existente permanece: gestor, `Curador de Fotos` ou `Operador de Conteúdo`
podem montar a seção. Não foram alterados proxy, autenticação, cookies, JWT,
login/logout ou permissões das outras seções. A autorização definitiva das
operações Rails protegidas continua pertencendo ao backend.

Banners continua em `fotos`, com Sidebar, links legados, título e breadcrumbs
existentes. Não foi criada `/admin/banners`, nem alterado o shell compartilhado
ou os destinos de outras seções. Os contadores de Banners na Visão Geral e na
Sidebar continuam lendo `data.banners`.

## 11. Verificações executadas

| Verificação | Resultado |
| --- | --- |
| `npx tsc --noEmit` inicial e após implementação | Passou. |
| `npm test` | 70 testes em 18 suítes passaram na execução final. |
| `npm run lint -- --format json` inicial/final | 12 erros/47 avisos → 12 erros/46 avisos; nenhum diagnóstico novo. |
| `git diff --check` | Passou. |
| `npm run build` | Falhou no Turbopack por `binding to a port` / `Operation not permitted`. |
| `npm run build -- --webpack` | Passou, incluindo verificação TypeScript e as dez subrotas administrativas. |
| `wc -l`, `git diff --stat`, `git status --short` | Executados; alterações anteriores preservadas, sem commit. |

Os três testes novos cobrem coleção recebida com props reduzidas, controles e
links, lista vazia sem inserir linha fictícia, imagem de referência do simulador,
cartões de imagens existentes, aviso de gravação bloqueada, estado `saving`,
seletores e ausência de requisições ao renderizar. São testes de renderização
estática, sem exercitar eventos do navegador, upload ou backend real.

A primeira execução dos testes no sandbox falhou por DNS `EAI_AGAIN` ao obter
`tsx`. A execução ampliada revelou uma expectativa textual incorreta em um teste
novo; corrigida, a suíte completa passou. O único aviso de lint removido era
o parâmetro `_next` sem uso no callback antigo da página. A comparação de
diagnósticos considerou arquivo, regra, severidade e mensagem, descontando linhas.

O Webpack registrou os avisos anteriores sobre lockfile externo e falhas de
conexão nas páginas públicas de avisos, acervo, galeria e redes, mas concluiu.
As rotas compiladas foram `/admin/noticias`, `/admin/kanban`, `/admin/usuarios`,
`/admin/faq`, `/admin/projetos`, `/admin/avisos`, `/admin/galeria`, `/admin/redes`,
`/admin/institucional` e `/admin/estados-cidades`.

## 12. Linhas antes e depois

`src/app/admin/page.tsx`: **2.230 → 2.204 linhas**, redução de **26 linhas**.
`SitePhotosManager.tsx`: **375 → 414 linhas**, reunindo composição e prévia,
sem um componente duplicado. A redução é pequena porque a interface e seus
handlers já estavam extraídos antes desta etapa.

## 13. Rascunhos, riscos e pendências

- A montagem continua condicional à seção `fotos`. Ao alternar seções, campos
  de URL e links não submetidos são desmontados e perdidos, como antes.
- A prévia de Banners agora fecha junto com o módulo; suas preferências locais
  de dispositivo/modo também podem reiniciar. As prévias dos demais módulos
  continuam no modal compartilhado da página.
- Não há preservação garantida após F5, troca de rota ou descarte pelo framework,
  nem persistência local de rascunhos. Não foi criado contêiner oculto.
- Permanecem a leitura legada, seus fallbacks e o tratamento global limitado de
  carregamento/erro. Uma coleção vazia no componente não cria banners; a
  normalização do leitor legado pode fornecê-los antes de chegar à interface.
- Permanece o risco de arquivos sem associação após uploads, que exige decisão
  própria de integração. Selecionar arquivo real continua provocando envio.
- Faltam contrato Rails e consumo público de Banners. Ordenação e alterações
  não são efetivamente persistidas enquanto o bloqueio estiver ativo.
- Não foram realizados testes interativos autenticados. Responsividade,
  navegação, eventos e ciclo de vida aguardam o checklist abaixo.

## 14. Checklist manual — sem uploads ou mutações reais

- [ ] Abrir Banners pela navegação atual e pelos links legados de `fotos`;
  conferir acesso permitido e negado segundo os perfis existentes.
- [ ] Conferir lista recebida, imagens, links e cartões de estúdio/capas/galeria,
  sem assumir que sejam o conteúdo atual publicado no site.
- [ ] Digitar nos campos sem gravar; conferir formulários e validações existentes.
- [ ] Abrir e fechar prévia por item e pelo simulador; conferir tela cheia,
  modo desktop/mobile e fechamento ao sair da seção.
- [ ] Inspecionar o seletor cancelando o diálogo. Para selecionar de fato sem
  upload, interceptar/bloquear previamente POST `/api/upload`; não selecionar
  arquivo real com envio liberado nesta validação.
- [ ] Conferir o estado de envio/erro somente com requisições interceptadas,
  sem criar arquivos e sem afirmar sucesso de upload real.
- [ ] Usar os controles de ordem, remover, adicionar por URL e salvar link;
  conferir apenas o alerta de bloqueio e nenhuma alteração persistida.
- [ ] Simular coleção vazia e falhas de leitura em ambiente controlado;
  distinguir a prévia de referência da lista e registrar a limitação global
  anterior de carregamento/erro, sem inserir dados substitutos novos.
- [ ] Digitar um link, alternar seção e retornar; confirmar a perda temporária
  preexistente, sem promessa de recuperação. Conferir também F5.
- [ ] Conferir Sidebar, breadcrumbs, celular, tablet, desktop e duas colunas.
- [ ] Conferir KPIs da Visão Geral e o contador de Banners sem alterações.
- [ ] Abrir as dez subrotas listadas acima e conferir seus acessos e navegação,
  sem realizar gravações ou uploads.

## 15. Recomendações para a Etapa 11B

Após validação desta etapa, a futura rota poderá reutilizar diretamente
`SitePhotosManager`, com o shell e a mesma guarda de acesso. Precisará possuir
leitura própria da fonte confirmada, carregamento, erro explícito e nova tentativa,
sem depender da Visão Geral ou mascarar falhas com dados fictícios.

Definir os requisitos de rascunhos ao navegar e documentar o descarte sem
introduzir persistência de negócio local. Confirmar separadamente o contrato Rails
e a política de upload/associação antes de habilitar qualquer escrita ou alegar
publicação. O hero público fixo também exige decisão em etapa própria.

Somente a Etapa 11A foi implementada. A Etapa 11B aguarda validação do usuário.
