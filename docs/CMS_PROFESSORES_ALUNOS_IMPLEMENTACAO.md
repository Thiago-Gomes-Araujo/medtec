# Professores e Mediadores e Alunos que Inspiram

Entrega de interface administrativa em 31/10/2026, na branch `feature/evolucao-cms-institucional`.

## Auditoria e preservação

- A branch foi conferida antes das edições. Já existiam alterações não commitadas no institucional, dashboard, shell, navegação, testes e nos arquivos dos dois módulos. O trabalho foi complementado; a cópia inicial está em `/tmp/medtec-cms-before.tgz` nesta sessão.
- Foram inspecionados `TeacherProfiles.tsx`, `StudentStories.tsx`, `CommunityMuralSection.tsx`, os módulos administrativos, a navegação, `src/proxy.ts`, `AdminShell` e a sessão existente. O guia instalado de Server e Client Components do Next.js foi consultado.
- `src/proxy.ts` protege `/admin/*` pela sessão assinada existente. `AdminShell` mantém a verificação de sessão Rails e o fallback local. A visibilidade de navegação por perfil continua sendo a existente; ela não concede futuras capacidades Rails.
- O editor dos Quatro Pilares, o institucional, os componentes públicos, os handlers públicos e a fila de aprovação de Notícias não foram alterados por esta implementação. As alterações anteriores nesses arquivos foram preservadas.

## Rotas e formulários

| Rota | Interface |
|---|---|
| `/admin/professores` | Listagem com busca por nome, disciplina, escola e município; filtros de função, município, status e destaque. Formulário com identificação, slug/código, função, disciplina, escola, comunidade, resumo de prática/trajetória, entrevista, orientações, foto, materiais e posicionamento. |
| `/admin/alunos` | Listagem com busca por nome, escola e conquista; filtros de categoria, município, status editorial, autorização e destaque. Formulário com identificação, categoria, conquista, idade opcional, série, escola, município, comunidade, mediador, resumo, relato, mídia e destaques. Aba de conformidade com indicadores de autorização e ações privadas bloqueadas. |

As rotas reutilizam `AdminShell`, os padrões de formulário do painel e `useDialogFocus` para foco, Escape e isolamento das prévias. Os atalhos estão no dashboard e na navegação compartilhada.

## Continuidade com o painel existente

Esta entrega estende a interface administrativa existente, sem propor outra identidade visual. Como nos módulos do painel, inclusive Quatro Pilares, as superfícies usam fundos claros, bordas discretas, cantos arredondados, sombras leves e tipografia compacta. As ações primárias usam o azul institucional (`#004A99`), com texto branco; avisos e estados mantêm cores semânticas. Os formulários, filtros e prévias seguem a organização de cards e campos do painel, com adaptação de colunas conforme a largura disponível.

As opções de função e categoria expõem o estado selecionado por `aria-pressed`. As prévias de alunos informam que a autorização não foi recebida nem verificada, sem selos de conformidade que sugiram aprovação real. A mídia demonstrativa é compartilhada entre os módulos. A comparação registra padrões observados no código e nas capturas estáticas; não equivale a validar o painel autenticado em execução ou o modo escuro.

## Limites desta etapa

**Aguardando integração oficial.** Não há cadastro oficial, salvamento, aprovação, publicação, exclusão, upload ou revogação de consentimento. Não existe API fictícia, serviço de escrita ou persistência simulada.

O estado React existe somente para avaliar a interface e suas prévias. Ele se perde ao sair/recarregar. Os campos de texto pessoal ficam somente para leitura: o botão **Preencher exemplo fictício** permite conferir a estrutura do cadastro sem receber dados pessoais reais. Função, categoria, município de exemplo, posição, destaques e mídia demonstrativa podem ser alterados e restaurados.

Os exemplos são explicitamente sintéticos, com docentes, estudantes, escolas e comunidades fictícios. Os municípios têm chaves negativas exclusivamente para filtros da demonstração; não representam IDs Rails. O município oficial continua sendo uma pendência de validação. Nenhum exemplo é apresentado como publicado ou autorizado.

Não são coletados nome/documento do responsável, assinatura, protocolos, termos ou outros arquivos privados. Os indicadores LGPD permanecem pendentes e os botões de anexar, visualizar, verificar e revogar não têm handler de execução. Nenhum dado do módulo é escrito em localStorage, sessionStorage, arquivo público ou mock persistente.

A seleção de foto demonstrativa reutiliza somente `/hero.jpg`, com descrição que informa não retratar o perfil fictício. Materiais demonstrativos são apenas rótulos sem arquivo, link ou download. A seleção oficial depende do acervo e da autorização de mídia Rails.

## Prévias e validação

- Docentes: card do diretório, perfil/entrevista detalhada, mural da Home e mini-perfil da metodologia.
- Histórias: destaque territorial, card da grade, relato completo e mural da Home. Não exibem responsáveis, termos nem selos falsos de autorização.
- Validação local: obrigatórios, limites específicos dos contratos, formato de slug, função/categoria, município oficial, ordenação inteira, foto/alt, URLs HTTPS e materiais.
- Preparação LGPD no modelo: termo e escopos, verificação, vínculo do signatário, data de assinatura não futura, validade e estados expirado/revogado. Essas verificações são auxiliares de interface; somente o Rails poderá autorizar uma publicação.
- A restauração considera campos opcionais, materiais, ponto focal e dados aninhados. O catálogo demonstrativo também pode ser restaurado.

Os modelos em `src/lib/admin-teachers.ts` e `src/lib/admin-students.ts` são **modelos de apresentação**, não payloads Rails. IDs oficiais, DTOs, referências de mídia, capacidades, auditoria e concorrência precisam de adaptação quando o contrato for homologado.

## Endpoints pendentes

Os contratos em `CMS_MAPEAMENTO_CONTEUDOS.md` e `CMS_CONTRATOS_BACKEND.md` classificam os recursos como **N — propostos**. Não há serviço de integração desses recursos em `src/lib/api`. Os handlers locais `/api/teachers` e `/api/students` retornam listas vazias e avisam a pendência; não comprovam disponibilidade Rails. Não foi feita sondagem de ambiente remoto nem homologação de endpoints.

Com prefixo `/api/v1`:

| Recurso | Contratos a homologar |
|---|---|
| `/cms/docentes` | `GET` listagem/detalhe, `POST`, `PATCH`, `DELETE`; `GET /:id/preview`; `PATCH /:id/enviar_revisao`, `/publicar`, `/reprovar`, `/despublicar`. |
| `/cms/historias_alunos` | Mesmo ciclo; `GET /:id/termo_autorizacao` privado e `PATCH /:id/revogar_consentimento`. |
| `/publico/cms/docentes` e `/publico/cms/historias_alunos` | Listagem e detalhe por slug, com DTO público sanitizado. O consumo público não foi modificado. |
| Dependências | Mídias/documentos CMS e armazenamento privado, escolas, catálogos e capacidades específicas em `/auth/me`. Reutilizar o serviço já existente de `/g_cidades` quando houver integração oficial. |

Antes de habilitar ações: homologar permissões efetivas, validação no servidor, consentimento privado, ETag/If-Match, persistência, auditoria e invalidação pública. Não adicionar esses recursos à fila de Notícias sem autorização específica.

## Arquivos da entrega

- Rotas: `src/app/admin/professores/page.tsx`, `src/app/admin/alunos/page.tsx`.
- Módulos: `src/components/admin/TeachersAdminModule.tsx`, `StudentsAdminModule.tsx`.
- Seleção/prévia de mídia demonstrativa compartilhada: `src/components/admin/CommunityDemoMedia.tsx`.
- Modelos e validação: `src/lib/admin-teachers.ts`, `admin-students.ts`, `admin-community-validation.ts`.
- Integração de navegação já presente e preservada: `src/lib/admin-navigation.ts`, `src/components/admin/AdminShell.tsx`, `src/app/admin/page.tsx`.
- Testes direcionados incorporados em `tests/api-client.test.ts`, preservando os demais testes e os dos Quatro Pilares.

## Verificações

- **Testes direcionados:** o bloco “Módulos CMS — Professores e Mediadores & Alunos que Inspiram” passou com **11/11 testes** em `/tmp/medtec-targeted-review.log`. Houve ajuste textual posterior; a suíte completa abaixo foi executada depois e cobre o estado final.
- **Suíte completa:** **974/974 testes, em 70 suites**, sem falhas, cancelamentos ou testes ignorados, em `/tmp/medtec-suite-delivery.log`.
- **TypeScript:** `tsc --noEmit` passou com código de saída **0**, confirmado no término da sessão de execução. `/tmp/medtec-types-delivery-final.log` está vazio, sem diagnósticos.
- **ESLint da entrega:** passou com código de saída **0** para as duas rotas, os dois módulos, os modelos, o helper de validação, a mídia compartilhada e os testes. `/tmp/medtec-lint-delivery-final.log` contém somente a nota de desotimização do gerador Babel pelo tamanho de `tests/api-client.test.ts`, sem diagnóstico ESLint nesses arquivos. A execução ampliada sobre os arquivos já alterados no workspace apontou dois erros preexistentes de `react-hooks/set-state-in-effect` em `AdminShell.tsx:194` e `:200` (`/tmp/medtec-lint-delivery.log`). O shell foi comparado byte a byte com o snapshot inicial e não foi modificado nesta entrega; não há aprovação do lint ampliado.
- **Diff:** `git diff --check` passou.
- **Build:** nenhuma tentativa foi aprovada. O build padrão com Turbopack falhou duas vezes, inclusive em execução escalada, com `EPERM` ao criar processo/abrir porta durante o processamento de CSS. `npm run build -- --webpack` também falhou: `Could not parse output from TypeScript's --showConfig.` O diagnóstico de subprocesso com `node`/`spawnSync` retornou `EPERM` e stdout vazio, enquanto o TypeScript direto não apresentou diagnósticos. Essas limitações não substituem a validação de um build de produção.
- **Navegador:** o Chrome confirmou o redirecionamento de `/admin/professores` sem sessão para o login. A tentativa autenticada local permaneceu em “Autenticando”; a hidratação e o uso dos módulos na aplicação autenticada não foram validados ao vivo.
- **Capturas estáticas:** foram geradas 14 capturas em `/tmp/medtec-review`, com inventário em `static-report.json`, nas larguras de **1440 px e 390 px**, usando os componentes React e o CSS reais, com mídia demonstrativa. Cobrem listagens, formulários e prévias dos dois módulos e a aba de conformidade de alunos. Um revisor independente inspecionou todas e aprovou o código e essas capturas, confirmando a resolução dos selos falsos de LGPD, do estado `aria-pressed` e do azul das ações primárias. A revisão não inclui `AdminShell` nem comprova hidratação, interação, foco, rolagem ao vivo ou modo escuro.

Nenhuma dependência foi instalada. Esta implementação não alterou backend, consumo público ou kanban de Notícias e não criou commit nem push. Os logs e as capturas em `/tmp` são artefatos locais desta sessão.
